import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProgram } from '../src/program.js';
import { validateAoDir } from '../src/validate.js';

const sample = fileURLToPath(new URL('./samples/ao-valid', import.meta.url));

describe('ao validate', () => {
  let dir: string;
  const file = (p: string) => join(dir, p);
  const edit = (p: string, from: string | RegExp, to: string) => {
    const text = readFileSync(file(p), 'utf8');
    const next = text.replace(from, to);
    if (next === text) throw new Error(`el test no cambió ${p}`);
    writeFileSync(file(p), next);
  };

  beforeEach(() => {
    dir = join(mkdtempSync(join(tmpdir(), 'ao-kit-validate-')), '.ao');
    cpSync(sample, dir, { recursive: true });
  });
  afterEach(() => rmSync(join(dir, '..'), { recursive: true, force: true }));

  it('pasa sobre la .ao de ejemplo', () => {
    expect(validateAoDir(dir)).toEqual({ errors: [], cards: 1, files: 6 });
  });

  it('falla con una ficha rota y dice qué archivo y qué campo', () => {
    edit('components/mimi-select.md', 'hash: null', `hash: ${'a'.repeat(64)}`);
    expect(validateAoDir(dir).errors).toEqual([
      'components/mimi-select.md: hash: va null si y solo si generatedBy es prompt',
    ]);
  });

  it('falla si la ficha no tiene frontmatter YAML', () => {
    edit('components/mimi-select.md', /^---\n/, '---js\n');
    expect(validateAoDir(dir).errors).toEqual([
      'components/mimi-select.md: frontmatter "js" no admitido: solo YAML ("---")',
    ]);
  });

  it('falla si falta un archivo fijo de las plantillas', () => {
    rmSync(file('recommendations.md'));
    expect(validateAoDir(dir).errors).toEqual([
      'recommendations.md: falta (lo piden las plantillas: va siempre)',
    ]);
  });

  it('el nombre de la ficha es su selector', () => {
    cpSync(file('components/mimi-select.md'), file('components/select.md'));
    expect(validateAoDir(dir).errors).toEqual([
      'components/select.md: el archivo debe llamarse components/mimi-select.md (su selector)',
      'components/select.md: la ficha no aparece en catalog.md (falta su fila con el enlace)',
    ]);
  });

  it('falla con un enlace roto a otro archivo de .ao/ y acepta anclas', () => {
    edit('catalog.md', '(patterns/modales.md#forma-oficial)', '(patterns/notificaciones.md)');
    expect(validateAoDir(dir).errors).toEqual([
      'catalog.md:15: el enlace patterns/notificaciones.md no existe',
    ]);
  });

  it('ignora enlaces externos y los que salen de .ao/', () => {
    edit(
      'conventions.md',
      '## 1. Componentes',
      '[docs](https://example.com/x.md) · [AGENTS](../AGENTS.md) · [ancla](#1-componentes)\n\n## 1. Componentes',
    );
    expect(validateAoDir(dir).errors).toEqual([]);
  });

  it('falla si quedan instrucciones <!-- ao: … --> de la plantilla, salvo en bloques de código', () => {
    edit('catalog.md', '## Diálogos', '<!-- ao: una tabla por grupo -->\n\n## Diálogos');
    expect(validateAoDir(dir).errors).toEqual([
      'catalog.md:11: quedó una instrucción de la plantilla (<!-- ao: … -->)',
    ]);
  });

  it('una ficha generatedBy scan pide .ao/index.json, y el índice tiene que ser válido', () => {
    edit(
      'components/mimi-select.md',
      'generatedBy: prompt\nhash: null',
      `generatedBy: scan\nhash: ${'a'.repeat(64)}`,
    );
    expect(validateAoDir(dir).errors).toEqual([
      'components/mimi-select.md: dice generatedBy: scan pero no hay index.json',
    ]);
    writeFileSync(file('index.json'), '{ "schemaVersion": 1 }');
    expect(validateAoDir(dir).errors[0]).toMatch(/^index\.json: meta: /);
    writeFileSync(file('index.json'), '{');
    expect(validateAoDir(dir).errors).toEqual(['index.json: no es JSON válido']);
  });

  it('config.json, si existe, es JSON válido', () => {
    writeFileSync(file('config.json'), '{ "showcase": [');
    expect(validateAoDir(dir).errors).toEqual(['config.json: no es JSON válido']);
  });

  it('una carpeta que no existe es un error, no una excepción', () => {
    expect(validateAoDir(file('no-existe')).errors).toEqual([
      `${file('no-existe')}: no existe o no es una carpeta`,
    ]);
  });

  it('el comando sale con código ≠ 0 si algo falla y 0 si todo está bien', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const before = process.exitCode;
    try {
      await createProgram('0.0.0').parseAsync(['validate', dir], { from: 'user' });
      expect(process.exitCode ?? 0).toBe(0);
      expect(log.mock.calls.join('\n')).toContain('1 ficha');

      edit('components/mimi-select.md', 'usedIn: 3', 'usedIn: -1');
      await createProgram('0.0.0').parseAsync(['validate', dir], { from: 'user' });
      expect(process.exitCode).toBe(1);
      expect(error.mock.calls.join('\n')).toContain('components/mimi-select.md: usedIn:');
    } finally {
      process.exitCode = before;
      log.mockRestore();
      error.mockRestore();
    }
  });
});
