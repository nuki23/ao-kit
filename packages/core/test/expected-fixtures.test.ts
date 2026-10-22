import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { Conventions, ExpectedFixture } from '../src/index.js';

const FIXTURES_DIR = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const FIXTURES = ['ng-multi', 'ng12-modules', 'ng17-wrappers', 'ng21-ao', 'ng22-modern'];

/** Campos cuyo valor es una ruta del fixture (o una lista de rutas). */
const PATH_KEYS = new Set([
  'file',
  'ts',
  'template',
  'styles',
  'themes',
  'resolvesTo',
  'via',
  'sourceRoot',
  'entryFile',
  'source',
  'fix',
  'models',
]);
const SYMBOL_ID = /^([^#\s]+)#([A-Za-z_$][\w$]*)$/;

interface Found {
  paths: string[];
  symbols: [file: string, name: string][];
  evidence: { file: string; line: number; snippet?: string }[];
}

function collect(value: unknown, key: string | null, found: Found): void {
  if (typeof value === 'string') {
    const symbol = SYMBOL_ID.exec(value);
    if (symbol) found.symbols.push([symbol[1]!, symbol[2]!]);
    // `source` también es el origen de una librería de UI ("table" | "config").
    else if (key !== null && PATH_KEYS.has(key) && !['inline', 'table', 'config'].includes(value))
      found.paths.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collect(item, key, found);
    return;
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj['file'] === 'string' && typeof obj['line'] === 'number') {
      found.evidence.push(obj as Found['evidence'][number]);
    }
    for (const [k, v] of Object.entries(obj)) if (k !== '$comment') collect(v, k, found);
  }
}

describe.each(FIXTURES)('expected.json de %s', (fixture) => {
  const dir = join(FIXTURES_DIR, fixture);
  const raw = JSON.parse(readFileSync(join(dir, 'expected.json'), 'utf8')) as unknown;
  const found: Found = { paths: [], symbols: [], evidence: [] };
  collect(raw, null, found);
  const lines = (file: string) => readFileSync(join(dir, file), 'utf8').split(/\r?\n/);

  it('tiene la forma del esquema de index.json (índice parcial)', () => {
    const result = ExpectedFixture.safeParse(raw);
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  it('cita rutas que existen en el fixture', () => {
    const missing = [...found.paths, ...found.symbols.map(([f]) => f)].filter(
      (p) => !existsSync(join(dir, p)),
    );
    expect(missing).toEqual([]);
  });

  it('cada SymbolId nombra un símbolo de su archivo', () => {
    const missing = found.symbols
      .filter(([f]) => existsSync(join(dir, f)))
      .filter(
        ([f, name]) =>
          !new RegExp(`\\b${name.replace('$', '\\$')}\\b`).test(readFileSync(join(dir, f), 'utf8')),
      )
      .map(([f, name]) => `${f}#${name}`);
    expect(missing).toEqual([]);
  });

  it('cada evidencia apunta a una línea real y su snippet está en esa línea', () => {
    const wrong = found.evidence
      .filter((e) => existsSync(join(dir, e.file)))
      .filter((e) => {
        const text = lines(e.file)[e.line - 1];
        if (text === undefined) return true;
        return e.snippet !== undefined && !text.includes(e.snippet.split('\n')[0]!.trim());
      })
      .map((e) => `${e.file}:${e.line}`);
    expect(wrong).toEqual([]);
  });

  it('las convenciones con conteos completos tienen la mayoría y la división correctas (6.4)', () => {
    const conventions = ((raw as { index: { conventions?: object } }).index.conventions ??
      {}) as Record<string, Record<string, Record<string, unknown>>>;
    const shape = Conventions.shape as Record<string, z.ZodType>;
    const issues: string[] = [];
    for (const [project, byKey] of Object.entries(conventions)) {
      for (const [key, withComment] of Object.entries(byKey)) {
        const value = Object.fromEntries(
          Object.entries(withComment).filter(([k]) => k !== '$comment'),
        );
        const counts = value['counts'] as Record<string, number> | undefined;
        if (!counts || !('majority' in value) || !('divided' in value)) continue;
        // La evidencia de los oráculos es parcial (sin línea): aquí solo se comprueban los conteos.
        const evidence = Object.fromEntries(Object.keys(counts).map((k) => [k, []]));
        const extra = key === 'standalone' ? { explicitFlag: value['explicitFlag'] ?? 0 } : {};
        const result = shape[key]!.safeParse({ ...value, evidence, ...extra });
        if (!result.success)
          issues.push(`${project}.${key}: ${result.error.issues.map((i) => i.message).join('; ')}`);
      }
    }
    expect(issues).toEqual([]);
  });

  it('en usages, la suma de byFile coincide con total (los dos sin showcase)', () => {
    const { index } = ExpectedFixture.parse(raw) as {
      index: {
        usages?: {
          selector?: string;
          total?: number;
          showcase?: number;
          byFile?: { count?: number }[];
        }[];
      };
    };
    const wrong = (index.usages ?? [])
      .filter(
        (u) =>
          u.total !== undefined &&
          u.byFile !== undefined &&
          u.byFile.every((f) => f.count !== undefined),
      )
      .filter((u) => u.byFile!.reduce((a, f) => a + f.count!, 0) !== u.total!)
      .map((u) => u.selector);
    expect(wrong).toEqual([]);
  });
});
