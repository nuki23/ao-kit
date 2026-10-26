import { createHash } from 'node:crypto';
import { compareCodePoint } from './order.js';

const BOM = [0xef, 0xbb, 0xbf];

/** Quita el BOM UTF-8 inicial y cambia CRLF por LF, sin decodificar el contenido. */
function normalize(bytes: Uint8Array): Uint8Array {
  const start = BOM.every((b, i) => bytes[i] === b) ? BOM.length : 0;
  const out = new Uint8Array(bytes.length - start);
  let n = 0;
  for (let i = start; i < bytes.length; i++) {
    if (bytes[i] === 0x0d && bytes[i + 1] === 0x0a) continue;
    out[n++] = bytes[i]!;
  }
  return out.subarray(0, n);
}

/**
 * sha256 (hex, 64 caracteres) del contenido de un archivo de texto. Ignora el BOM UTF-8 inicial
 * y los finales de línea CRLF, así un checkout en Windows da el mismo hash que en Linux.
 */
export function hashContent(content: string | Uint8Array): string {
  const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
  return createHash('sha256').update(normalize(bytes)).digest('hex');
}

/**
 * Un solo hash para un conjunto de archivos (`meta.inputsHash`): combina pares [ruta, hash]
 * ordenados por ruta, así el resultado no depende del orden en que se leyeron.
 */
export function combineHashes(entries: Iterable<readonly [path: string, hash: string]>): string {
  const sorted = [...entries].sort(([a], [b]) => compareCodePoint(a, b));
  const h = createHash('sha256');
  for (const [path, hash] of sorted) h.update(`${path}\0${hash}\n`);
  return h.digest('hex');
}
