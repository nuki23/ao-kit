import { posix, win32 } from 'node:path';

const isWindowsPath = (p: string) => /^[A-Za-z]:/.test(p) || p.includes('\\');

/** Cambia los separadores de Windows por "/". */
export function toPosix(p: string): string {
  return p.replaceAll('\\', '/');
}

/**
 * Ruta de `target` relativa a `root`, con "/" (el formato PosixPath del índice).
 * Devuelve null si `target` es la raíz misma o queda fuera de ella (otra unidad o "..").
 * En Windows, y para rutas con unidad o "\" en cualquier sistema, se usan las reglas de Windows.
 */
export function toPosixRelative(root: string, target: string): string | null {
  const path =
    process.platform === 'win32' || isWindowsPath(root) || isWindowsPath(target) ? win32 : posix;
  const rel = toPosix(path.relative(path.resolve(root), path.resolve(root, target)));
  if (rel === '' || rel === '..' || rel.startsWith('../') || path.isAbsolute(rel)) return null;
  return rel;
}
