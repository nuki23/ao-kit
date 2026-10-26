import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  combineHashes,
  compareCodePoint,
  hashContent,
  Index,
  serializeIndex,
  sortBy,
  sortRecord,
  toPosix,
  toPosixRelative,
  writeFileAtomic,
} from '../src/index.js';
import { sampleIndex } from './sample-index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

describe('rutas POSIX', () => {
  it('toPosix cambia "\\" por "/"', () => {
    expect(toPosix('src\\app\\x.ts')).toBe('src/app/x.ts');
  });

  it('relativa a la raíz, con "/", desde rutas de Windows', () => {
    expect(toPosixRelative('C:\\repo', 'C:\\repo\\src\\app\\a.component.ts')).toBe(
      'src/app/a.component.ts',
    );
    expect(toPosixRelative('C:\\repo\\', 'c:/repo/src/a.ts')).toBe('src/a.ts');
  });

  it('relativa a la raíz desde rutas POSIX y relativas', () => {
    expect(toPosixRelative('/repo', '/repo/src/a.ts')).toBe('src/a.ts');
    expect(toPosixRelative('/repo', 'src/./b/../a.ts')).toBe('src/a.ts');
  });

  it('null fuera de la raíz o en la raíz misma; nunca ".."', () => {
    expect(toPosixRelative('/repo', '/otro/a.ts')).toBeNull();
    expect(toPosixRelative('/repo', '/repo-2/a.ts')).toBeNull();
    expect(toPosixRelative('/repo', '/repo')).toBeNull();
    expect(toPosixRelative('/repo', '../a.ts')).toBeNull();
    expect(toPosixRelative('C:\\repo', 'D:\\repo\\a.ts')).toBeNull();
  });

  it('un nombre que empieza con ".." no es salir de la raíz', () => {
    expect(toPosixRelative('/repo', '/repo/..config/a.ts')).toBe('..config/a.ts');
  });
});

describe('hash de contenido', () => {
  const lf = 'export class A {}\nconst x = 1;\n';
  const expected = hashContent(lf);

  it('sha256 completo en hex', () => {
    expect(expected).toMatch(/^[0-9a-f]{64}$/);
    expect(hashContent('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('CRLF y LF dan el mismo hash', () => {
    expect(hashContent(lf.replaceAll('\n', '\r\n'))).toBe(expected);
  });

  it('el BOM UTF-8 inicial no cambia el hash (string y bytes)', () => {
    expect(hashContent(`\uFEFF${lf}`)).toBe(expected);
    const bytes = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(lf, 'utf8')]);
    expect(hashContent(bytes)).toBe(expected);
    expect(hashContent(Buffer.from(`\uFEFF${lf.replaceAll('\n', '\r\n')}`, 'utf8'))).toBe(expected);
  });

  it('un BOM en medio y un \\r suelto sí cuentan', () => {
    expect(hashContent(`a\uFEFFb`)).not.toBe(hashContent('ab'));
    expect(hashContent('a\rb')).not.toBe(hashContent('ab'));
  });

  it('combineHashes no depende del orden de entrada y sí de rutas y hashes', () => {
    const a = ['src/a.ts', hashContent('a')] as const;
    const b = ['src/b.ts', hashContent('b')] as const;
    expect(combineHashes([a, b])).toBe(combineHashes([b, a]));
    expect(combineHashes([a, b])).not.toBe(combineHashes([a, ['src/c.ts', b[1]]]));
    expect(combineHashes([a, b])).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('orden estable', () => {
  it('compareCodePoint ordena por punto de código, sin locale', () => {
    expect(['b', 'a', 'B', 'á', '_'].sort(compareCodePoint)).toEqual(['B', '_', 'a', 'b', 'á']);
    // U+FF5E (BMP) < U+1F600 (fuera del BMP); en UTF-16 el surrogate 0xD83D quedaría antes.
    expect(['\u{1F600}', '\uFF5E'].sort(compareCodePoint)).toEqual(['\uFF5E', '\u{1F600}']);
  });

  it('sortBy: tuplas, números por valor, null primero y estable en empates', () => {
    const items = [
      { f: 'b.ts', l: 10, n: 1 },
      { f: 'a.ts', l: 9, n: 2 },
      { f: 'b.ts', l: 2, n: 3 },
      { f: 'a.ts', l: 9, n: 4 },
    ];
    expect(sortBy(items, (i) => [i.f, i.l]).map((i) => i.n)).toEqual([2, 4, 3, 1]);
    expect(sortBy(['x', null, 'a'], (v) => v)).toEqual([null, 'a', 'x']);
  });

  it('sortRecord ordena las claves', () => {
    expect(Object.keys(sortRecord({ portal: 1, backoffice: 2, 'acme-ui': 3 }))).toEqual([
      'acme-ui',
      'backoffice',
      'portal',
    ]);
  });
});

describe('serializeIndex', () => {
  const shuffled = (): Loose => {
    const index = structuredClone(sampleIndex) as Loose;
    for (const [key, value] of Object.entries(index))
      if (Array.isArray(value)) index[key] = [...value].reverse();
    // Un segundo proyecto, con las claves de los records en otro orden.
    index['projects'].push({ ...index['projects'][0], name: 'admin', root: 'projects/admin' });
    index['conventions'] = { mimi: index['conventions'].mimi, admin: index['conventions'].mimi };
    return index;
  };

  it('serializa igual sin importar el orden de arrays y claves (CA 3.4)', () => {
    const a = shuffled();
    const b = shuffled();
    for (const [key, value] of Object.entries(b))
      if (Array.isArray(value)) b[key] = [...value].reverse();
    b['conventions'] = { admin: b['conventions'].admin, mimi: b['conventions'].mimi };
    expect(Index.safeParse(a).success).toBe(true);
    expect(serializeIndex(b)).toBe(serializeIndex(a));
  });

  it('dos corridas sobre el índice de ejemplo dan el mismo texto, con salto final', () => {
    const text = serializeIndex(sampleIndex);
    expect(serializeIndex(JSON.parse(text))).toBe(text);
    expect(text.endsWith('}\n')).toBe(true);
    expect(text.startsWith('{\n  "schemaVersion": 1,\n  "meta"')).toBe(true);
  });

  it('ordena las colecciones y las claves de los records', () => {
    const parsed = JSON.parse(serializeIndex(shuffled())) as Loose;
    expect(parsed['projects'].map((p: Loose) => p.name)).toEqual(['admin', 'mimi']);
    expect(Object.keys(parsed['conventions'])).toEqual(['admin', 'mimi']);
    const ids = parsed['components'].map((c: Loose) => c.id as string);
    expect(ids).toEqual([...ids].sort(compareCodePoint));
  });

  it('un índice inválido lanza (es un error del escáner, no del repo)', () => {
    expect(() => serializeIndex({ ...sampleIndex, schemaVersion: 2 })).toThrow();
  });
});

describe('writeFileAtomic', () => {
  let dir: string;
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('crea la carpeta, escribe y sobrescribe sin dejar temporales', async () => {
    dir = mkdtempSync(join(tmpdir(), 'ao-kit-atomic-'));
    const file = join(dir, '.ao', 'index.json');
    await writeFileAtomic(file, '{"a":1}\n');
    expect(readFileSync(file, 'utf8')).toBe('{"a":1}\n');
    await writeFileAtomic(file, Buffer.from('{"a":2}\n'));
    expect(readFileSync(file, 'utf8')).toBe('{"a":2}\n');
    expect(readdirSync(join(dir, '.ao'))).toEqual(['index.json']);
  });

  it('si falla, borra el temporal y deja el archivo anterior intacto', async () => {
    dir = mkdtempSync(join(tmpdir(), 'ao-kit-atomic-'));
    const file = join(dir, 'index.json');
    await writeFileAtomic(file, 'viejo');
    // El destino es una carpeta: rename falla en todos los sistemas.
    const target = join(dir, 'carpeta');
    await writeFileAtomic(join(target, 'x'), 'x');
    await expect(writeFileAtomic(target, 'nuevo')).rejects.toThrow();
    expect(readFileSync(file, 'utf8')).toBe('viejo');
    expect(readdirSync(dir).sort()).toEqual(['carpeta', 'index.json']);
    expect(existsSync(join(target, 'x'))).toBe(true);
  });
});
