import { z } from 'zod';
import { Index } from '../schema/index-schema.js';
import { compareKeys, sortRecord, type SortKey } from './order.js';

type Item<K extends keyof Index> = Index[K] extends readonly (infer T)[] ? T : never;
type ArrayKey = {
  [K in keyof Index]: Index[K] extends readonly unknown[] ? K : never;
}[keyof Index];

const ev = (
  e: { file: string; line: number } | null | undefined,
): [string | null, number | null] => (e ? [e.file, e.line] : [null, null]);

/**
 * Clave de orden de cada colección de primer nivel. Los arrays anidados (rutas, inputs, piezas
 * del contrato, evidencia) no se reordenan: su orden lo fija el detector y puede tener sentido.
 */
const SORT_KEYS: { [K in ArrayKey]: (item: Item<K>) => SortKey } = {
  projects: (p) => p.name,
  sharedScopes: (s) => [s.scope, s.project, s.source],
  components: (c) => c.id,
  directives: (d) => d.id,
  pipes: (p) => p.id,
  usages: (u) => [u.selector, u.library],
  ngModules: (m) => m.id,
  notDetected: (n) => n.need,
  emergentPatterns: (e) => e.symbol,
  templateSyntax: (t) => t.feature,
  duplicates: (d) => [d.kind, d.a.id, d.b.id],
  services: (s) => s.id,
  tokens: (t) => [t.kind, t.name, ...ev(t.evidence)],
  inertAttributes: (a) => [a.attribute, a.reason, ...ev(a.evidence[0])],
  possibleIssues: (p) => [...ev(p.evidence), p.code],
  docDrift: (d) => [...ev(d.doc), d.claim, d.value],
  warnings: (w) => [w.code, ...ev(w.evidence[0]), w.message],
};

/** Ordena las claves de todos los records del esquema (conventions, routes, byProject…). */
function sortRecords(schema: z.ZodType, value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable)
    return sortRecords(schema.unwrap() as z.ZodType, value);
  if (schema instanceof z.ZodLazy) return sortRecords(schema.unwrap() as z.ZodType, value);
  if (schema instanceof z.ZodArray)
    return (value as unknown[]).map((v) => sortRecords(schema.element as z.ZodType, v));
  if (schema instanceof z.ZodRecord) {
    const inner = schema.valueType as z.ZodType;
    return sortRecord(
      Object.fromEntries(
        Object.entries(value as object).map(([k, v]) => [k, sortRecords(inner, v)]),
      ),
    );
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    return Object.fromEntries(
      Object.entries(value as object).map(([k, v]) => [k, shape[k] ? sortRecords(shape[k], v) : v]),
    );
  }
  return value;
}

/**
 * JSON estable de `.ao/index.json`: valida con el esquema (lanza ZodError si no es válido), fija el
 * orden de los campos, ordena las colecciones de primer nivel y las claves de los records.
 * Mismo índice, mismo texto, sin importar el orden en que lo armaron los detectores.
 */
export function serializeIndex(index: unknown): string {
  const parsed = sortRecords(Index, Index.parse(index)) as Index;
  const out: Record<string, unknown> = { ...parsed };
  for (const [key, sortKey] of Object.entries(SORT_KEYS) as [ArrayKey, (i: unknown) => SortKey][]) {
    // Desempate por el JSON del elemento: el orden de entrada nunca decide.
    out[key] = (parsed[key] as unknown[])
      .map((item) => ({ item, k: sortKey(item), json: JSON.stringify(item) }))
      .sort((a, b) => compareKeys(a.k, b.k) || compareKeys(a.json, b.json))
      .map((e) => e.item);
  }
  return `${JSON.stringify(out, null, 2)}\n`;
}
