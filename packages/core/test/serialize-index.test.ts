import { describe, expect, it } from 'vitest';
import { Index, ORDERED_ARRAYS, serializeIndex } from '../src/index.js';
import { sampleIndex } from './sample-index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

/** PRNG con semilla (mulberry32): el barajado es aleatorio pero reproducible. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mismas rutas genéricas que ORDERED_ARRAYS: `{}` por valor de record, `[]` por elemento.
const RECORDS = new Set(['routes', 'conventions', 'usages[].byProject']);
const generic = (path: string) => path.replace(/(\.children\[\])+/g, '');
const isEvidence = (v: unknown) =>
  v !== null && typeof v === 'object' && 'file' in v && 'line' in v && !('count' in v);

/** Recorre el índice y llama a `visit` con cada array y su ruta genérica. */
function eachArray(value: unknown, path: string, visit: (arr: unknown[], path: string) => void) {
  if (Array.isArray(value)) {
    visit(value, generic(path));
    for (const v of value) eachArray(v, `${path}[]`, visit);
  } else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value))
      eachArray(v, RECORDS.has(generic(path)) ? `${path}{}` : path ? `${path}.${k}` : k, visit);
  }
}

/**
 * Índice de ejemplo con más elementos en los arrays, para que barajar cambie algo: cada array de
 * Evidence suma dos entradas y se agregan elementos a varias colecciones.
 */
function richIndex(): Loose {
  const index = structuredClone(sampleIndex) as Loose;
  eachArray(index, '', (arr, path) => {
    // missing del contrato cuenta los que faltan: no se toca.
    if (path.endsWith('contract[].missing') || arr.length === 0 || !isEvidence(arr[0])) return;
    const e = arr[0] as Loose;
    arr.push({ ...e, line: e['line'] + 10 }, { ...e, file: `a/${e['file'] as string}` });
  });
  const ev = (file: string, line: number) => ({ file, line });
  index['stack'].uiLibraries.push({
    name: 'mimi-ui',
    version: null,
    prefixes: ['mm-', 'mx-'],
    source: 'config',
  });
  index['stack'].styles.themes.push('src/styles/_dark.scss', 'src/styles/_base.scss');
  index['stack'].aliases.push({
    alias: '@core/*',
    paths: ['src/app/core/*', 'src/legacy/core/*'],
    resolvesTo: 'src/app/core/',
    via: null,
  });
  index['sharedScopes'].push({ scope: 'workspace', project: 'mimi', source: 'libs/ui/' });
  index['tokens'].push(
    { name: '$color-error', value: '#d00', kind: 'scss', evidence: ev('src/styles/_v.scss', 2) },
    { name: '--gap', value: '8px', kind: 'css-var', evidence: ev('src/styles.css', 1) },
  );
  index['possibleIssues'].push(
    { ...index['possibleIssues'][0], evidence: ev('src/app/a.ts', 3) },
    { ...index['possibleIssues'][0], code: 'duplicate-attribute', evidence: ev('src/app/a.ts', 3) },
  );
  index['warnings'].push(
    { code: 'parse-error', message: 'b', evidence: [ev('src/b.html', 1)] },
    { code: 'parse-error', message: 'a', evidence: [ev('src/a.html', 1)] },
  );
  index['services'][0].http.push(
    { method: 'get', url: '/b', evidence: ev('src/app/core/api.ts', 9) },
    { method: 'delete', url: '/a', evidence: ev('src/app/core/api.ts', 4) },
    { method: 'get', url: '/a', evidence: ev('src/app/core/api.ts', 2) },
  );
  index['patterns'].estado.details.facts.push(
    { key: 'carrito', value: 'signal', evidence: [] },
    { key: 'auth', value: 'BehaviorSubject', evidence: [] },
  );
  index['patterns'].modales.facade.wraps.push('NzMessageService', 'MatDialog');
  index['patterns'].modales.evidence.push({ what: 'NzModalService', files: 1, evidence: [] });
  return index;
}

/** Baraja con semilla todos los arrays que no están en ORDERED_ARRAYS. */
function shuffleUnordered(index: Loose, seed: number): { index: Loose; changed: string[] } {
  const random = rng(seed);
  const changed: string[] = [];
  eachArray(index, '', (arr, path) => {
    if (ORDERED_ARRAYS.has(path) || arr.length < 2) return;
    const before = JSON.stringify(arr);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (JSON.stringify(arr) === before) arr.push(arr.shift());
    changed.push(path);
  });
  return { index, changed };
}

describe('serializeIndex', () => {
  it('el índice enriquecido es válido', () => {
    const result = Index.safeParse(richIndex());
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  it.each([1, 7, 42])(
    'con todos los arrays no semánticos barajados (semilla %i) serializa igual',
    (seed) => {
      const original = serializeIndex(richIndex());
      const { index, changed } = shuffleUnordered(richIndex(), seed);
      expect(changed.length).toBeGreaterThan(25);
      expect(serializeIndex(index)).toBe(original);
    },
  );

  it('cubre los criterios pedidos: evidence, byFile, contract, nombres y http', () => {
    const { index } = shuffleUnordered(richIndex(), 3);
    const out = JSON.parse(serializeIndex(index)) as Loose;
    const evidence = out['components'][0].evidence.map((e: Loose) => `${e.file}:${e.line}`);
    expect(evidence).toEqual([
      'a/src/app/shared/mimi-select/mimi-select.component.ts:4',
      'src/app/shared/mimi-select/mimi-select.component.ts:4',
      'src/app/shared/mimi-select/mimi-select.component.ts:14',
    ]);
    expect(out['usages'][0].byFile.map((f: Loose) => f.file)).toEqual([
      'src/app/pages/pagos/pagos.component.html',
      'src/app/pages/perfil/perfil.component.html',
    ]);
    expect(out['components'][0].contract.map((c: Loose) => c.piece)).toEqual([
      'mimi-select',
      'nzShowSearch',
    ]);
    expect(out['services'][0].http.map((h: Loose) => `${h.method} ${h.url}`)).toEqual([
      'delete /a',
      'get /a',
      'get /b',
    ]);
    expect(out['patterns'].modales.facade.wraps).toEqual([
      'MatDialog',
      'NzMessageService',
      'NzModalService',
    ]);
  });

  it('preserva el orden de routes, children, inputs, outputs y slots', () => {
    const base = richIndex();
    const original = serializeIndex(base);
    const reorder = (mutate: (i: Loose) => void) => {
      const index = structuredClone(base);
      mutate(index);
      return serializeIndex(index);
    };
    expect(reorder((i) => i['routes'].mimi.reverse())).not.toBe(original);
    expect(
      reorder((i) =>
        i['routes'].mimi[1].children.unshift({
          path: 'nuevo',
          showcase: false,
          evidence: { file: 'src/app/pages/pagos/pagos.routes.ts', line: 2 },
        }),
      ),
    ).not.toBe(
      reorder((i) =>
        i['routes'].mimi[1].children.push({
          path: 'nuevo',
          showcase: false,
          evidence: { file: 'src/app/pages/pagos/pagos.routes.ts', line: 2 },
        }),
      ),
    );
    const withTwoInputs = (names: string[]) =>
      reorder((i) => {
        i['components'][1].inputs = names.map((name) => ({
          name,
          required: false,
          kind: 'signal',
        }));
      });
    expect(withTwoInputs(['rows', 'cols'])).not.toBe(withTwoInputs(['cols', 'rows']));
    expect(JSON.parse(withTwoInputs(['rows', 'cols']))['components'][1].inputs[0].name).toBe(
      'rows',
    );
  });

  it('dos corridas sobre el índice de ejemplo dan el mismo texto, con salto final', () => {
    const text = serializeIndex(sampleIndex);
    expect(serializeIndex(JSON.parse(text))).toBe(text);
    expect(text.endsWith('}\n')).toBe(true);
    expect(text.startsWith('{\n  "schemaVersion": 1,\n  "meta"')).toBe(true);
  });

  it('ordena las claves de los records', () => {
    const index = richIndex();
    index['projects'].push({ ...index['projects'][0], name: 'admin', root: 'projects/admin' });
    index['conventions'] = { mimi: index['conventions'].mimi, admin: index['conventions'].mimi };
    const out = JSON.parse(serializeIndex(index)) as Loose;
    expect(Object.keys(out['conventions'])).toEqual(['admin', 'mimi']);
    expect(out['projects'].map((p: Loose) => p.name)).toEqual(['admin', 'mimi']);
  });

  it('un índice inválido lanza (es un error del escáner, no del repo)', () => {
    expect(() => serializeIndex({ ...sampleIndex, schemaVersion: 2 })).toThrow();
  });
});
