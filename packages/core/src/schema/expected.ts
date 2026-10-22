import { z } from 'zod';
import { Evidence, SymbolId } from './common.js';
import { PossibleIssueCode } from './findings.js';
import { Index, SCHEMA_VERSION } from './index-schema.js';

const cache = new Map<z.ZodType, z.ZodType>();

/**
 * Versión parcial y profunda de un esquema: todos los campos de objeto son opcionales y se admite
 * `$comment` en cada objeto. Los tipos, enums y formatos de las hojas (rutas, SymbolId) se
 * mantienen, así que un oráculo parcial se valida por forma. Las refinaciones entre campos se pierden.
 */
export function deepPartial(schema: z.ZodType): z.ZodType {
  const hit = cache.get(schema);
  if (hit) return hit;
  let out: z.ZodType;
  if (schema instanceof z.ZodObject) {
    const shape = Object.fromEntries(
      Object.entries(schema.shape as Record<string, z.ZodType>).map(([k, v]) => [
        k,
        deepPartial(v).optional(),
      ]),
    );
    out = z.strictObject({ $comment: z.string().optional(), ...shape });
  } else if (schema instanceof z.ZodArray) {
    out = z.array(deepPartial(schema.element as z.ZodType));
  } else if (schema instanceof z.ZodOptional) {
    out = deepPartial(schema.unwrap() as z.ZodType).optional();
  } else if (schema instanceof z.ZodNullable) {
    out = deepPartial(schema.unwrap() as z.ZodType).nullable();
  } else if (schema instanceof z.ZodRecord) {
    out = z.record(schema.keyType as z.ZodString, deepPartial(schema.valueType as z.ZodType));
  } else if (schema instanceof z.ZodUnion) {
    out = z.union((schema.options as z.ZodType[]).map(deepPartial) as [z.ZodType, ...z.ZodType[]]);
  } else if (schema instanceof z.ZodLazy) {
    out = z.lazy(() => deepPartial(schema.unwrap() as z.ZodType));
  } else {
    out = schema;
  }
  cache.set(schema, out);
  return out;
}

/**
 * Formato de `fixtures/<fixture>/expected.json`: el oráculo de lo que `ao scan` debe detectar.
 * `index` es un índice parcial con el formato real; `negatives` lista lo que NO debe detectarse.
 */
export const ExpectedFixture = z.strictObject({
  $comment: z.string(),
  schemaVersion: z.literal(SCHEMA_VERSION),
  index: deepPartial(Index),
  negatives: z
    .strictObject({
      $comment: z.string().optional(),
      /** Componentes que proyectan contenido y no son wrappers (4.4). */
      notWrappers: z.array(z.strictObject({ id: SymbolId, reason: z.string().min(1) })).optional(),
      /** Pares que no son duplicados (4.12). */
      notDuplicates: z
        .array(z.strictObject({ a: SymbolId, b: SymbolId, reason: z.string().min(1) }))
        .optional(),
      /** Código que no debe reportarse como posible problema (4.19). */
      possibleIssues: z
        .array(
          z.strictObject({
            code: PossibleIssueCode,
            evidence: Evidence,
            reason: z.string().min(1),
          }),
        )
        .optional(),
    })
    .optional(),
});

export type ExpectedFixture = z.infer<typeof ExpectedFixture>;
