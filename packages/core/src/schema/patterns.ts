import { z } from 'zod';
import { Count, Evidence, Exception, PosixPath, SymbolId } from './common.js';

export const HIGH_PRIORITY_NEEDS = [
  'iconos',
  'modales',
  'notificaciones',
  'formularios',
  'api',
] as const;
export const OTHER_NEEDS = ['estado', 'auth', 'tablas', 'estilos', 'entornos'] as const;
export const Need = z.enum([...HIGH_PRIORITY_NEEDS, ...OTHER_NEEDS]);
export const HighPriorityNeed = z.enum(HIGH_PRIORITY_NEEDS);

/** Cuántos archivos usan una forma (p. ej. la fachada, o la librería directa fuera de ella). */
export const PatternEvidence = z.strictObject({
  what: z.string().min(1),
  files: Count,
  occurrences: Count.optional(),
  evidence: z.array(Evidence),
});

export const Facade = z.strictObject({
  id: SymbolId,
  /** Servicios de librería que envuelve (`NzModalService`, `HttpClient`…). */
  wraps: z.array(z.string().min(1)).min(1),
});

/** Mecanismo con nombre y dónde se ve (`nzData`, `MAT_DIALOG_DATA`, `afterClosed`…). */
const Mechanism = z.strictObject({ mechanism: z.string().min(1), evidence: z.array(Evidence) });

const IconosDetails = z.strictObject({
  library: z.string().min(1),
  /** Dónde se registran los íconos; null si cada componente importa los suyos. */
  registration: Evidence.nullable(),
  syntax: z.string().min(1),
  icons: Count,
  uses: Count,
});

const ModalesDetails = z.strictObject({
  library: z.string().min(1),
  dataPassing: Mechanism.nullable(),
  result: Mechanism.nullable(),
  /** Dónde se registra el servicio cuando no es providedIn root. */
  provider: Evidence.nullable(),
});

const NotificacionesDetails = z.strictObject({
  library: z.string().min(1),
  errorInterceptor: z
    .strictObject({
      id: SymbolId,
      kind: z.enum(['HttpInterceptorFn', 'HttpInterceptor']),
      registration: Evidence.nullable(),
    })
    .nullable(),
  /** Cómo se evita el aviso de error en una llamada concreta. */
  suppress: z
    .strictObject({
      mechanism: z.enum(['HttpContextToken', 'header', 'flag']),
      id: SymbolId,
      usedIn: z.array(Evidence),
    })
    .nullable(),
});

const FormulariosDetails = z.strictObject({
  builder: z
    .enum(['FormBuilder', 'NonNullableFormBuilder', 'new', 'signal-forms', 'template-driven'])
    .nullable(),
  customValidators: z.array(
    z.strictObject({ id: SymbolId, uses: Count, evidence: z.array(Evidence) }),
  ),
  /** Selectores que envuelven cada campo (wrapper propio, `nz-form-item`, `mat-form-field`). */
  fieldLayout: z.array(z.string().min(1)),
  /** De dónde salen las opciones de los selects. */
  catalogs: z.array(SymbolId),
});

const ApiDetails = z.strictObject({
  urlOrigin: z
    .strictObject({
      kind: z.enum(['environment', 'injection-token', 'constant', 'literal']),
      name: z.string().min(1),
      evidence: z.array(Evidence),
    })
    .nullable(),
  responseWrapper: z
    .strictObject({
      type: z.string().min(1),
      unwrap: z.string().nullable(),
      evidence: z.array(Evidence),
    })
    .nullable(),
  interceptors: z.array(SymbolId),
  httpContext: z.array(SymbolId),
  /** Dónde viven los modelos de la API. */
  models: z.array(PosixPath),
});

/** Necesidades sin detector tipado todavía: hechos sueltos con evidencia. */
const FactsDetails = z.strictObject({
  facts: z.array(
    z.strictObject({ key: z.string().min(1), value: z.string(), evidence: z.array(Evidence) }),
  ),
});

function pattern<D extends z.ZodType>(details: D) {
  return z.strictObject({
    /** Forma dominante en kebab-case: `facade`, `direct`, `base-class`, `httpResource`… */
    approach: z.string().regex(/^[a-z][a-zA-Z0-9-]*$/),
    facade: Facade.nullable(),
    evidence: z.array(PatternEvidence),
    exceptions: z.array(Exception),
    details,
  });
}

/** Solo necesidades con evidencia: una necesidad sin evidencia no aparece (4.14). */
export const Patterns = z.strictObject({
  iconos: pattern(IconosDetails).optional(),
  modales: pattern(ModalesDetails).optional(),
  notificaciones: pattern(NotificacionesDetails).optional(),
  formularios: pattern(FormulariosDetails).optional(),
  api: pattern(ApiDetails).optional(),
  estado: pattern(FactsDetails).optional(),
  auth: pattern(FactsDetails).optional(),
  tablas: pattern(FactsDetails).optional(),
  estilos: pattern(FactsDetails).optional(),
  entornos: pattern(FactsDetails).optional(),
});

/** Necesidad de prioridad alta sin evidencia: va a recommendations.md como "no detectado" (6.1). */
export const NotDetected = z.strictObject({ need: HighPriorityNeed, missing: z.string().min(1) });

/** Función o servicio transversal usado en ≥ N features (4.18). El nombre lo pone la IA. */
export const EmergentPattern = z.strictObject({
  symbol: SymbolId,
  kind: z.enum(['function', 'service', 'directive', 'pipe']),
  features: z.array(z.strictObject({ feature: PosixPath, count: Count })).min(1),
  total: Count,
  evidence: z.array(Evidence),
});
