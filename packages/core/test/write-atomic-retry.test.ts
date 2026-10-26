import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import type * as FsPromises from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { writeFileAtomic } from '../src/utils/fs.js';

// rename falla `failures` veces con `code` antes de funcionar (como un antivirus en Windows).
const state = vi.hoisted(() => ({ failures: 0, code: 'EBUSY' }));
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof FsPromises>();
  return {
    ...actual,
    rename: async (from: string, to: string) => {
      if (state.failures > 0) {
        state.failures--;
        throw Object.assign(new Error(`${state.code}: simulado`), { code: state.code });
      }
      return actual.rename(from, to);
    },
  };
});

describe('writeFileAtomic en Windows', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ao-kit-retry-'));
  afterEach(() => {
    for (const f of readdirSync(dir)) rmSync(join(dir, f), { force: true });
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('reintenta rename con EBUSY/EPERM y termina escribiendo', async () => {
    Object.assign(state, { failures: 2, code: 'EPERM' });
    await writeFileAtomic(join(dir, 'a.json'), 'ok');
    expect(readFileSync(join(dir, 'a.json'), 'utf8')).toBe('ok');
    expect(readdirSync(dir)).toEqual(['a.json']);
  });

  it('se rinde tras 3 reintentos y borra el temporal', async () => {
    Object.assign(state, { failures: 10, code: 'EBUSY' });
    await expect(writeFileAtomic(join(dir, 'b.json'), 'x')).rejects.toThrow('EBUSY');
    expect(readdirSync(dir)).toEqual([]);
  });

  it('no reintenta otros errores', async () => {
    Object.assign(state, { failures: 1, code: 'ENOSPC' });
    await expect(writeFileAtomic(join(dir, 'c.json'), 'x')).rejects.toThrow('ENOSPC');
    expect(state.failures).toBe(0);
    expect(readdirSync(dir)).toEqual([]);
  });
});
