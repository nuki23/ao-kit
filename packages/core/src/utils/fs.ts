import { randomBytes } from 'node:crypto';
import { mkdir, open, rename, rm } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

/** En Windows, rename falla un momento si otro proceso (antivirus, indexador) tiene el archivo abierto. */
const RETRY_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);
const RETRY_DELAYS_MS = [50, 100, 200];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Escribe el archivo completo o no lo toca: escribe un temporal en la misma carpeta y lo renombra.
 * Crea la carpeta si falta. Si algo falla, borra el temporal y relanza el error.
 */
export async function writeFileAtomic(file: string, data: string | Uint8Array): Promise<void> {
  const dir = dirname(file);
  await mkdir(dir, { recursive: true });
  const tmp = join(dir, `.${basename(file)}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`);
  try {
    const handle = await open(tmp, 'wx');
    try {
      await handle.writeFile(data);
      await handle.sync();
    } finally {
      await handle.close();
    }
    for (let attempt = 0; ; attempt++) {
      try {
        await rename(tmp, file);
        return;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code ?? '';
        if (!RETRY_CODES.has(code) || attempt >= RETRY_DELAYS_MS.length) throw error;
        await sleep(RETRY_DELAYS_MS[attempt]!);
      }
    }
  } catch (error) {
    await rm(tmp, { force: true });
    throw error;
  }
}
