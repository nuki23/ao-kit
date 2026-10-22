import { z } from 'zod';
import { Count, Evidence, Hash, PosixPath, Ratio, SymbolId } from './common.js';

export const ComponentKind = z.enum(['wrapper', 'slot-container', 'component', 'unused']);
const UsedKind = z.enum(['wrapper', 'slot-container', 'component']);

/**
 * Por qué un componente es `unused`. `exported-not-consumed`: lo exporta el public-api de una
 * librería y nadie lo consume dentro del workspace; no cuenta como código muerto.
 */
export const UnusedReason = z.enum([
  'no-template-usage',
  'showcase-only',
  'deprecated-only',
  'exported-not-consumed',
]);

/** Ámbito: compartido en el workspace, en un proyecto, de una feature, o interno de una librería. */
export const Scope = z.enum(['workspace', 'project', 'feature', 'internal']);

export const Input = z.strictObject({
  name: z.string().min(1),
  alias: z.string().optional(),
  required: z.boolean(),
  kind: z.enum(['decorator', 'signal', 'model']),
  type: z.string().optional(),
  default: z.string().optional(),
});

export const Output = z.strictObject({
  name: z.string().min(1),
  alias: z.string().optional(),
  kind: z.enum(['decorator', 'signal', 'model']),
});

/** Criterios de wrapper de 4.4: (a) mismo elemento proyectado ≥ 80 %, (b) estilos sobre la librería, (c) atributo con el nombre del wrapper. */
export const WrapperCriteria = z.strictObject({
  a: z.strictObject({
    met: z.boolean(),
    element: z.string().nullable(),
    ratio: Ratio,
    evidence: z.array(Evidence),
  }),
  b: z.strictObject({
    met: z.boolean(),
    selectors: z.array(z.string()),
    evidence: z.array(Evidence),
  }),
  c: z.strictObject({
    met: z.boolean(),
    attribute: z.string().nullable(),
    ratio: Ratio,
    evidence: z.array(Evidence),
  }),
});

/** Pieza del contrato observado de un wrapper (4.17): presencia sobre todos los usos reales. */
export const ContractPiece = z
  .strictObject({
    piece: z.string().min(1),
    on: z.enum(['projected', 'host', 'sibling']),
    type: z.enum([
      'attribute',
      'directive',
      'input-binding',
      'output-binding',
      'two-way-binding',
      'element',
    ]),
    /** Valor constante en todos los usos, si lo es. */
    value: z.string().optional(),
    required: z.boolean(),
    present: Count,
    total: Count,
    missing: z.array(Evidence),
    inert: z.boolean(),
  })
  .superRefine((p, ctx) => {
    if (p.present > p.total)
      ctx.addIssue({
        code: 'custom',
        path: ['present'],
        message: 'present no puede superar total',
      });
    if (p.required !== (p.total > 0 && p.present === p.total)) {
      ctx.addIssue({
        code: 'custom',
        path: ['required'],
        message: 'required es present === total',
      });
    }
  });

export const Component = z
  .strictObject({
    id: SymbolId,
    selector: z.string().min(1),
    className: z.string().min(1),
    project: z.string().min(1),
    scope: Scope,
    /** Solo librerías: si está en el public-api. null fuera de librerías. */
    exported: z.boolean().nullable(),
    files: z.strictObject({
      ts: PosixPath,
      template: z.union([PosixPath, z.literal('inline')]),
      styles: z.array(PosixPath),
    }),
    /** `explicit`: valor escrito en el decorador; null si se omite y rige el default de la versión. */
    standalone: z.strictObject({ effective: z.boolean(), explicit: z.boolean().nullable() }),
    changeDetection: z.strictObject({
      /** `Eager` = `ChangeDetectionStrategy.Default` antes de v22. */
      effective: z.enum(['OnPush', 'Eager']),
      explicit: z.boolean(),
    }),
    inputs: z.array(Input),
    outputs: z.array(Output),
    /** "default" para `<ng-content>` sin select; si no, el valor de `select`. */
    slots: z.array(z.string()),
    kind: ComponentKind,
    formerKind: UsedKind.optional(),
    unusedReason: UnusedReason.optional(),
    wraps: z.string().nullable(),
    criteria: WrapperCriteria.nullable(),
    contract: z.array(ContractPiece).nullable(),
    hash: Hash,
    evidence: z.array(Evidence),
  })
  .superRefine((c, ctx) => {
    const unused = c.kind === 'unused';
    if (unused !== (c.formerKind !== undefined) || unused !== (c.unusedReason !== undefined)) {
      ctx.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'formerKind y unusedReason van solo (y siempre) con kind "unused"',
      });
    }
    const effective = unused ? c.formerKind : c.kind;
    if ((effective === 'wrapper') !== (c.wraps !== null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['wraps'],
        message: 'wraps va solo (y siempre) en wrappers',
      });
    }
    if (c.contract !== null && effective !== 'wrapper') {
      ctx.addIssue({ code: 'custom', path: ['contract'], message: 'contract es solo de wrappers' });
    }
    if (c.criteria !== null && c.slots.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['criteria'],
        message: 'criteria solo aplica a componentes que proyectan contenido',
      });
    }
  });

const SymbolBase = {
  id: SymbolId,
  className: z.string().min(1),
  project: z.string().min(1),
  scope: Scope,
  exported: z.boolean().nullable(),
  standalone: z.strictObject({ effective: z.boolean(), explicit: z.boolean().nullable() }),
  /** false si nadie la usa fuera del showcase y de deprecated (4.15). */
  used: z.boolean(),
  evidence: z.array(Evidence),
};

export const Directive = z.strictObject({
  ...SymbolBase,
  selector: z.string().min(1),
  inputs: z.array(Input),
});

export const Pipe = z.strictObject({
  ...SymbolBase,
  name: z.string().min(1),
});

export const Usage = z.strictObject({
  /** Selector de un componente propio o elemento de una librería de UI. */
  selector: z.string().min(1),
  /** Librería de UI dueña del elemento; null para componentes del repo. */
  library: z.string().nullable(),
  /** Usos reales: excluye showcase y deprecated. */
  total: Count,
  byProject: z.record(z.string(), Count),
  byFile: z.array(z.strictObject({ file: PosixPath, count: Count, evidence: z.array(Evidence) })),
  showcase: Count,
  deprecated: Count,
  /** Hasta 3 usos con snippet (atributos y directivas incluidos). */
  representative: z.array(Evidence).max(3),
  /** Elementos de librería: wrapper propio que los envuelve. */
  wrappedBy: z.strictObject({ selector: z.string(), count: Count }).nullable(),
  unwrapped: z.array(Evidence),
});

export const NgModule = z.strictObject({
  id: SymbolId,
  name: z.string().min(1),
  project: z.string().min(1),
  declarations: z.array(z.string()),
  imports: z.array(z.string()),
  exports: z.array(z.string()),
  providers: z.array(z.string()),
  schemas: z.array(z.string()),
  entryComponents: z.array(z.string()),
  bootstrap: z.array(z.string()),
  declaredNotExported: z.array(z.string()),
  /** Lo que ven los templates de sus declarations (4.10); null si no declara nada. */
  visibleInTemplates: z
    .strictObject({
      components: z.array(z.string()),
      directives: z.array(z.string()),
      pipes: z.array(z.string()),
      angularModules: z.array(z.string()),
      uiModules: z.array(z.string()),
    })
    .nullable(),
  /** Componentes del repo que sus templates no pueden usar. */
  notVisible: z.array(z.string()),
  evidence: Evidence,
});

const DuplicateSide = z.strictObject({
  id: SymbolId,
  selector: z.string().nullable(),
  project: z.string().min(1),
});

export const Duplicate = z.strictObject({
  kind: z.enum(['component', 'service', 'function']),
  a: DuplicateSide,
  b: DuplicateSide,
  baseName: z.string().min(1),
  criteria: z.strictObject({
    sharedInputs: z.strictObject({ met: z.boolean(), inputs: z.array(z.string()) }).nullable(),
    equivalentTemplate: z
      .strictObject({ met: z.boolean(), tree: z.string().optional() })
      .nullable(),
  }),
  /** El de mayor alcance (la librería). */
  suggest: SymbolId,
});
