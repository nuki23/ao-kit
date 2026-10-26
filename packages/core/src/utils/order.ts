/**
 * Compara por punto de código Unicode. Nunca `localeCompare`: depende del idioma del sistema.
 * (`<` entre strings compara unidades UTF-16 y ordena mal los caracteres fuera del BMP).
 */
export function compareCodePoint(a: string, b: string): number {
  if (a === b) return 0;
  const ia = a[Symbol.iterator]();
  const ib = b[Symbol.iterator]();
  for (;;) {
    const ca = ia.next();
    const cb = ib.next();
    if (ca.done) return cb.done ? 0 : -1;
    if (cb.done) return 1;
    const d = ca.value.codePointAt(0)! - cb.value.codePointAt(0)!;
    if (d !== 0) return d < 0 ? -1 : 1;
  }
}

export type SortKey = string | number | null | readonly (string | number | null)[];

/** Compara claves: null primero, números por valor, strings por punto de código, tuplas en orden. */
export function compareKeys(a: SortKey, b: SortKey): number {
  const ta = Array.isArray(a) ? a : [a];
  const tb = Array.isArray(b) ? b : [b];
  for (let i = 0; i < Math.max(ta.length, tb.length); i++) {
    if (i >= ta.length) return -1;
    if (i >= tb.length) return 1;
    const x = ta[i] as string | number | null;
    const y = tb[i] as string | number | null;
    if (x === y) continue;
    if (x === null) return -1;
    if (y === null) return 1;
    if (typeof x === 'number' && typeof y === 'number') return x < y ? -1 : 1;
    const d = compareCodePoint(String(x), String(y));
    if (d !== 0) return d;
  }
  return 0;
}

/** Copia ordenada por la clave. Estable: los empates conservan el orden de entrada. */
export function sortBy<T>(items: readonly T[], key: (item: T) => SortKey): T[] {
  return items
    .map((item, i) => ({ item, i, k: key(item) }))
    .sort((a, b) => compareKeys(a.k, b.k) || a.i - b.i)
    .map((e) => e.item);
}

/**
 * Copia del objeto con las claves ordenadas por punto de código. Ojo: JavaScript siempre pone
 * primero las claves que parecen enteros ("0", "12"), en orden numérico.
 */
export function sortRecord<V>(record: Readonly<Record<string, V>>): Record<string, V> {
  return Object.fromEntries(
    Object.entries(record).sort(([a], [b]) => compareCodePoint(a, b)),
  ) as Record<string, V>;
}
