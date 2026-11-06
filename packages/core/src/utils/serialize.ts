import { z } from 'zod';
import { Index } from '../schema/index-schema.js';
import { compareKeys, sortRecord, type SortKey } from './order.js';

/**
 * Arrays con orden semántico: se serializan en el orden del detector. Las rutas se escriben en
 * forma genérica: `[]` por elemento, `{}` por valor de record; `routes{}[].children` vale para
 * cualquier nivel de anidación.
 * - rutas y children: el router prueba las rutas en orden.
 * - canActivate: los guards corren en orden.
 * - inputs, outputs y slots: orden de declaración en la clase y el template.
 * - files.styles: el orden de styleUrls decide la cascada.
 * - aliases[].paths: TypeScript prueba los paths del alias en orden.
 * - patterns.api.details.interceptors: orden de ejecución de withInterceptors.
 */
export const ORDERED_ARRAYS: ReadonlySet<string> = new Set([
  'routes{}',
  'routes{}[].children',
  'routes{}[].canActivate',
  'components[].inputs',
  'components[].outputs',
  'components[].slots',
  'components[].files.styles',
  'directives[].inputs',
  'stack.aliases[].paths',
  'patterns.api.details.interceptors',
]);

type Obj = Record<string, unknown>;
type Ev = { file: string; line: number } | null | undefined;
const ev = (e: Ev): [string | null, number | null] => (e ? [e.file, e.line] : [null, null]);
const first = (items: unknown) => (items as Ev[])[0];

/**
 * Clave de orden de los arrays de objetos, por nombre de campo. Los arrays de Evidence (objetos
 * con file y line) van por archivo y línea, y los de strings o enums por valor, sin entrada aquí.
 */
const OBJECT_KEYS: Record<string, (item: Obj) => SortKey> = {
  // Colecciones de primer nivel.
  projects: (p) => p['name'] as string,
  sharedScopes: (s) => [s['scope'], s['project'], s['source']] as SortKey,
  components: (c) => c['id'] as string,
  directives: (d) => d['id'] as string,
  pipes: (p) => p['id'] as string,
  usages: (u) => [u['selector'], u['library']] as SortKey,
  ngModules: (m) => m['id'] as string,
  notDetected: (n) => n['need'] as string,
  emergentPatterns: (e) => e['symbol'] as string,
  templateSyntax: (t) => t['feature'] as string,
  duplicates: (d) => [d['kind'], (d['a'] as Obj)['id'], (d['b'] as Obj)['id']] as SortKey,
  services: (s) => s['id'] as string,
  tokens: (t) => [t['kind'], t['name'], ...ev(t['evidence'] as Ev)] as SortKey,
  inertAttributes: (a) => [a['attribute'], a['reason'], ...ev(first(a['evidence']))] as SortKey,
  possibleIssues: (p) => [...ev(p['evidence'] as Ev), p['code']] as SortKey,
  docDrift: (d) => [...ev(d['doc'] as Ev), d['claim'], d['value']] as SortKey,
  warnings: (w) => [w['code'], ...ev(first(w['evidence'])), w['message']] as SortKey,
  // Arrays anidados.
  uiLibraries: (l) => l['name'] as string,
  icons: (l) => l['library'] as string,
  state: (l) => l['library'] as string,
  tests: (l) => l['library'] as string,
  aliases: (a) => a['alias'] as string,
  contract: (c) => [c['on'], c['piece']] as SortKey,
  byFile: (f) => f['file'] as string,
  wrapperUsage: (w) => [w['wrapper'], w['wraps']] as SortKey,
  /** PatternEvidence de patterns.<necesidad>.evidence. */
  evidence: (e) => e['what'] as string,
  customValidators: (v) => v['id'] as string,
  facts: (f) => [f['key'], f['value']] as SortKey,
  features: (f) => f['feature'] as string,
  http: (h) => [h['method'], h['url'], ...ev(h['evidence'] as Ev)] as SortKey,
};

type Rule = 'ordered' | ((item: unknown) => SortKey);

const unwrap = (s: z.ZodType): z.ZodType =>
  s instanceof z.ZodOptional || s instanceof z.ZodNullable || s instanceof z.ZodLazy
    ? unwrap(s.unwrap() as z.ZodType)
    : s;

/** `routes{}[].children[].children` → `routes{}[].children`: un solo nombre para cada nivel. */
const generic = (path: string) => path.replace(/(\.children\[\])+/g, '');

function ruleFor(path: string, field: string, element: z.ZodType): Rule {
  if (ORDERED_ARRAYS.has(generic(path))) return 'ordered';
  const el = unwrap(element);
  if (el instanceof z.ZodObject) {
    const shape = el.shape as Record<string, unknown>;
    if ('file' in shape && 'line' in shape) return (e) => ev(e as Ev);
    const key = OBJECT_KEYS[field];
    if (key) return (item) => key(item as Obj);
    throw new Error(`serializeIndex: el array ${path} no tiene criterio de orden`);
  }
  return (v) => v as string | number;
}

/** Recorre el valor guiado por el esquema: ordena arrays (salvo los semánticos) y records. */
function normalize(schema: z.ZodType, value: unknown, path: string, field: string): unknown {
  if (value === null || value === undefined) return value;
  const s = unwrap(schema);
  if (s instanceof z.ZodArray) {
    const element = s.element as z.ZodType;
    const items = (value as unknown[]).map((v) => normalize(element, v, `${path}[]`, field));
    const rule = ruleFor(path, field, element);
    if (rule === 'ordered') return items;
    // Desempate por el JSON del elemento: el orden de entrada nunca decide.
    return items
      .map((item) => ({ item, k: rule(item), json: JSON.stringify(item) }))
      .sort((a, b) => compareKeys(a.k, b.k) || compareKeys(a.json, b.json))
      .map((e) => e.item);
  }
  if (s instanceof z.ZodRecord) {
    const inner = s.valueType as z.ZodType;
    return sortRecord(
      Object.fromEntries(
        Object.entries(value as Obj).map(([k, v]) => [k, normalize(inner, v, `${path}{}`, field)]),
      ),
    );
  }
  if (s instanceof z.ZodObject) {
    const shape = s.shape as Record<string, z.ZodType>;
    return Object.fromEntries(
      Object.entries(value as Obj).map(([k, v]) => [
        k,
        shape[k] ? normalize(shape[k], v, path ? `${path}.${k}` : k, k) : v,
      ]),
    );
  }
  return value;
}

/** Comprueba al cargar el módulo que cada array del esquema tiene criterio (o está en ORDERED_ARRAYS). */
function checkCoverage(schema: z.ZodType, path: string, field: string, seen: Set<string>): void {
  const key = generic(path);
  if (seen.has(key)) return;
  seen.add(key);
  const s = unwrap(schema);
  if (s instanceof z.ZodArray) {
    ruleFor(path, field, s.element as z.ZodType);
    checkCoverage(s.element as z.ZodType, `${path}[]`, field, seen);
  } else if (s instanceof z.ZodRecord) {
    checkCoverage(s.valueType as z.ZodType, `${path}{}`, field, seen);
  } else if (s instanceof z.ZodObject) {
    for (const [k, v] of Object.entries(s.shape as Record<string, z.ZodType>))
      checkCoverage(v, path ? `${path}.${k}` : k, k, seen);
  }
}
checkCoverage(Index, '', '', new Set());

/**
 * JSON estable de `.ao/index.json`: valida con el esquema (lanza ZodError si no es válido), fija el
 * orden de los campos, ordena las claves de los records y todos los arrays salvo los de
 * ORDERED_ARRAYS. Mismo índice, mismo texto, sin importar el orden en que lo armaron los detectores.
 */
export function serializeIndex(index: unknown): string {
  return `${JSON.stringify(normalize(Index, Index.parse(index), '', ''), null, 2)}\n`;
}
