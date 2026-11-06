import { z } from 'zod';
import { Count, Hash, PosixPath, SymbolId } from './common.js';

/** Versión del frontmatter de las fichas; sube con la misma regla que SCHEMA_VERSION del índice. */
export const CARD_SCHEMA_VERSION = 1;

/**
 * Quién escribió la ficha: `scan`, /ao:init a partir de `.ao/index.json`; `prompt`, /ao:init sin
 * índice (el agente analizó el repo él mismo). Una ficha `prompt` no tiene hash: /ao:sync la
 * regenera completa cuando haya índice.
 */
export const CardGeneratedBy = z.enum(['scan', 'prompt']);
export type CardGeneratedBy = z.infer<typeof CardGeneratedBy>;

/**
 * Frontmatter de `.ao/components/<selector>.md`. Lo escribe /ao:init y /ao:sync compara `hash`
 * con `components[].hash` para saber si la ficha quedó vieja.
 * No hay fichas de componentes `unused`.
 */
export const CardFrontmatter = z
  .strictObject({
    schemaVersion: z.literal(CARD_SCHEMA_VERSION),
    /** `components[].id` del índice. */
    id: SymbolId,
    selector: z.string().min(1),
    /** Carpeta del componente, terminada en "/". */
    source: PosixPath.refine((p) => p.endsWith('/'), { message: 'debe terminar en "/"' }),
    kind: z.enum(['wrapper', 'slot-container', 'component']),
    /** Elemento que envuelve; solo en kind wrapper. */
    wraps: z.string().min(1).nullable(),
    generatedBy: CardGeneratedBy,
    /** `components[].hash` del índice; `null` si y solo si `generatedBy` es `prompt`. */
    hash: Hash.nullable(),
    /** Usos reales (sin showcase ni deprecated). Con `generatedBy: prompt`, los cuenta el agente. */
    usedIn: Count,
  })
  .superRefine((card, ctx) => {
    if ((card.generatedBy === 'prompt') !== (card.hash === null))
      ctx.addIssue({
        code: 'custom',
        path: ['hash'],
        message: 'va null si y solo si generatedBy es prompt',
      });
    if ((card.kind === 'wrapper') !== (card.wraps !== null))
      ctx.addIssue({
        code: 'custom',
        path: ['wraps'],
        message: 'wraps va solo, y siempre, con kind wrapper',
      });
  });

export type CardFrontmatter = z.infer<typeof CardFrontmatter>;
