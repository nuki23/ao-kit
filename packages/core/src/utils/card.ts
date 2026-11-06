import { isAlias, isNode, parseDocument, stringify, visit } from 'yaml';
import { CardFrontmatter } from '../schema/card.js';
import { parseWithErrors } from './issues.js';

export type ParseCardResult =
  { ok: true; data: CardFrontmatter; body: string } | { ok: false; errors: string[] };

const OPEN = /^---([^\n]*)\n/;
const CLOSE = /^---[ \t]*$/m;

/**
 * Lee una ficha: frontmatter YAML entre líneas `---` y el cuerpo en Markdown. Nunca lanza.
 * Las fichas viven en repos ajenos, así que el parseo es estricto: solo YAML con el esquema core,
 * sin tags (`!foo`, `!!js/function`), sin anclas ni aliases y sin otros lenguajes (`---js`).
 */
export function parseCard(markdown: string): ParseCardResult {
  const text = markdown.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');
  const open = OPEN.exec(text);
  if (!open) return { ok: false, errors: ['la ficha debe empezar con una línea "---"'] };
  const lang = open[1]!.trim();
  if (lang !== '')
    return { ok: false, errors: [`frontmatter "${lang}" no admitido: solo YAML ("---")`] };
  const rest = text.slice(open[0].length);
  const close = CLOSE.exec(rest);
  if (!close) return { ok: false, errors: ['falta la línea "---" que cierra el frontmatter'] };
  const source = rest.slice(0, close.index);
  const body = rest.slice(close.index + close[0].length).replace(/^\n/, '');

  const doc = parseDocument(source, {
    schema: 'core',
    customTags: [],
    strict: true,
    uniqueKeys: true,
    prettyErrors: false,
  });
  const errors = [...doc.errors, ...doc.warnings].map((e) => `YAML: ${e.message}`);
  visit(doc, {
    Node(_, node) {
      if (isAlias(node)) errors.push('YAML: no se admiten aliases (*nombre)');
      else if (isNode(node) && node.anchor) errors.push('YAML: no se admiten anclas (&nombre)');
      if (isNode(node) && node.tag) errors.push(`YAML: no se admiten tags (${node.tag})`);
    },
  });
  if (errors.length > 0) return { ok: false, errors };

  const result = parseWithErrors(CardFrontmatter, doc.toJS(), 'frontmatter');
  return result.ok ? { ok: true, data: result.data, body } : result;
}

/** Escribe una ficha con los campos del frontmatter siempre en el mismo orden. Lanza si no es válido. */
export function stringifyCard(data: CardFrontmatter, body: string): string {
  const yaml = stringify(CardFrontmatter.parse(data), { lineWidth: 0 });
  return `---\n${yaml}---\n${body}`;
}
