import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { Index, compareCodePoint, parseCard, parseWithErrors } from '@ao-kit/core';

/** Archivos que las plantillas (agent/templates) piden siempre, haya o no datos. */
export const REQUIRED_FILES = ['conventions.md', 'catalog.md', 'recommendations.md'] as const;

export interface ValidateResult {
  /** "ruta relativa a la .ao[:línea]: mensaje", en orden estable. */
  errors: string[];
  cards: number;
  /** Archivos .md revisados. */
  files: number;
}

const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory();

/** Sin BOM inicial y con saltos de línea LF, para que los números de línea no dependan del editor. */
const normalizeText = (text: string) =>
  (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text).replaceAll('\r\n', '\n');

/** Archivos .md bajo `root`, como rutas POSIX relativas y en orden estable. */
function markdownFiles(root: string, rel = ''): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(root, rel), { withFileTypes: true })) {
    const path = rel === '' ? entry.name : `${rel}/${entry.name}`;
    if (entry.isDirectory()) out.push(...markdownFiles(root, path));
    else if (entry.name.endsWith('.md')) out.push(path);
  }
  return out.sort(compareCodePoint);
}

/** Líneas fuera de bloques de código ``` / ~~~, con su número (desde 1). */
function proseLines(text: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  let fence: string | null = null;
  text.split('\n').forEach((line, i) => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker && (fence === null || marker.startsWith(fence))) {
      fence = fence === null ? marker[0]!.repeat(3) : null;
      return;
    }
    if (fence === null) out.push({ line: i + 1, text: line.replace(/`[^`]*`/g, '') });
  });
  return out;
}

const LINK = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** Enlaces relativos que apuntan dentro de la .ao: los externos y los que salen de ella no se revisan. */
function brokenLinks(root: string, file: string, text: string): string[] {
  const errors: string[] = [];
  for (const { line, text: prose } of proseLines(text))
    for (const m of prose.matchAll(LINK)) {
      const target = decodeURI(m[1]!.split('#')[0]!);
      if (target === '' || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('/')) continue;
      const resolved = posix.normalize(posix.join(posix.dirname(file), target));
      if (resolved.startsWith('../') || resolved === '..') continue;
      if (!existsSync(join(root, resolved)))
        errors.push(`${file}:${line}: el enlace ${m[1]!.split('#')[0]} no existe`);
    }
  return errors;
}

function readJson(path: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(readFileSync(path, 'utf8')) };
  } catch {
    return { ok: false };
  }
}

/**
 * Valida una carpeta `.ao/` escrita por /ao:init (o a mano). Nunca lanza: todo problema es un error
 * en el resultado. No compara hashes con el índice (eso es `ao check`).
 */
export function validateAoDir(root: string): ValidateResult {
  if (!isDir(root))
    return { errors: [`${root}: no existe o no es una carpeta`], cards: 0, files: 0 };
  const errors: string[] = [];

  for (const f of REQUIRED_FILES)
    if (!existsSync(join(root, f)))
      errors.push(`${f}: falta (lo piden las plantillas: va siempre)`);

  const hasIndex = existsSync(join(root, 'index.json'));
  if (hasIndex) {
    const json = readJson(join(root, 'index.json'));
    if (!json.ok) errors.push('index.json: no es JSON válido');
    else {
      const parsed = parseWithErrors(Index, json.value, 'index');
      if (!parsed.ok) errors.push(...parsed.errors.map((e) => `index.json: ${e}`));
    }
  }
  if (existsSync(join(root, 'config.json')) && !readJson(join(root, 'config.json')).ok)
    errors.push('config.json: no es JSON válido');

  const files = markdownFiles(root);
  const catalog = existsSync(join(root, 'catalog.md'))
    ? readFileSync(join(root, 'catalog.md'), 'utf8')
    : '';
  let cards = 0;

  for (const file of files) {
    const text = normalizeText(readFileSync(join(root, file), 'utf8'));

    if (dirname(file) === 'components') {
      cards++;
      const card = parseCard(text);
      if (!card.ok) {
        errors.push(...card.errors.map((e) => `${file}: ${e}`));
        continue;
      }
      const expected = `components/${card.data.selector}.md`;
      if (file !== expected)
        errors.push(`${file}: el archivo debe llamarse ${expected} (su selector)`);
      if (card.data.generatedBy === 'scan' && !hasIndex)
        errors.push(`${file}: dice generatedBy: scan pero no hay index.json`);
      if (!catalog.includes(`(${file})`) && !catalog.includes(`(${file}#`))
        errors.push(`${file}: la ficha no aparece en catalog.md (falta su fila con el enlace)`);
    }

    for (const { line, text: prose } of proseLines(text))
      if (prose.includes('<!-- ao:'))
        errors.push(`${file}:${line}: quedó una instrucción de la plantilla (<!-- ao: … -->)`);
    errors.push(...brokenLinks(root, file, text));
  }

  return { errors, cards, files: files.length };
}
