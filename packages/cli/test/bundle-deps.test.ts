import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'tsup';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import config from '../tsup.config.js';
import pkg from '../package.json' with { type: 'json' };

// tsup resuelve entry con globs: en Windows necesita "/".
const root = fileURLToPath(new URL('..', import.meta.url)).replaceAll('\\', '/');

/** Nombre del paquete de un import: "@scope/pkg/sub" → "@scope/pkg", "pkg/sub" → "pkg". */
function packageName(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!;
}

const isBuiltin = (specifier: string) =>
  specifier.startsWith('node:') || builtinModules.includes(packageName(specifier));

/** Imports estáticos, dinámicos, re-exports y require() que esbuild deja en el bundle. */
function externalImports(code: string): string[] {
  const patterns = [
    /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']/g,
    /\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
    /\b(?:__)?require\(\s*["']([^"']+)["']\s*\)/g,
  ];
  const found = new Set<string>();
  for (const re of patterns)
    for (const m of code.matchAll(re)) {
      const specifier = m[1]!;
      if (!specifier.startsWith('.') && !isBuiltin(specifier)) found.add(packageName(specifier));
    }
  return [...found].sort();
}

describe('bundle de la cli', () => {
  let outDir: string;
  let externals: string[];

  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), 'ao-kit-cli-bundle-'));
    const options = Array.isArray(config) ? config[0]! : config;
    if (typeof options === 'function') throw new Error('tsup.config.ts debe exportar un objeto');
    await build({
      ...options,
      config: false,
      // tsup solo deja externas las dependencies del package.json del cwd y empaqueta el resto en
      // silencio. Aquí todo paquete de terceros queda externo, así se ve qué necesita la cli en
      // runtime; los @ao-kit/* siguen empaquetándose por noExternal.
      esbuildPlugins: [
        {
          name: 'todo-externo',
          setup(b) {
            // El filtro de esbuild es regex de Go (sin lookahead): la exclusión va en el callback.
            b.onResolve({ filter: /^[^./]/ }, (args) =>
              /^[A-Za-z]:/.test(args.path) || args.path.startsWith('@ao-kit/')
                ? undefined
                : { path: args.path, external: true },
            );
          },
        },
      ],
      entry: (options.entry as string[]).map((e) => `${root}${e}`),
      tsconfig: `${root}tsconfig.json`,
      outDir,
      sourcemap: false,
      silent: true,
    });
    const code = readdirSync(outDir)
      .filter((f) => f.endsWith('.js'))
      .map((f) => readFileSync(join(outDir, f), 'utf8'))
      .join('\n');
    externals = externalImports(code);
  }, 60_000);

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  it('empaqueta los @ao-kit/*: ninguno queda como import externo', () => {
    expect(externals.filter((e) => e.startsWith('@ao-kit/'))).toEqual([]);
  });

  it('cada import externo está en dependencies de la cli', () => {
    const declared = Object.keys(pkg.dependencies ?? {});
    expect(externals.filter((e) => !declared.includes(e))).toEqual([]);
  });

  it('encuentra al menos commander (el test no pasa en vacío)', () => {
    expect(externals).toContain('commander');
  });
});

describe('externalImports', () => {
  it('reconoce las formas de import y descarta builtins y rutas relativas', () => {
    const code = [
      'import { Command } from "commander";',
      'import "side-effect";',
      'import * as z from "zod/v4";',
      'export { x } from "@scope/pkg/sub";',
      'const m = await import("ts-morph");',
      'const c = __require("@angular/compiler");',
      'import fs from "node:fs";',
      'import path from "path";',
      'import local from "./local.js";',
    ].join('\n');
    expect(externalImports(code)).toEqual([
      '@angular/compiler',
      '@scope/pkg',
      'commander',
      'side-effect',
      'ts-morph',
      'zod',
    ]);
  });
});
