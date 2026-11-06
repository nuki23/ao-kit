import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CardFrontmatter, parseCard, stringifyCard } from '../src/index.js';

const template = readFileSync(new URL('../../../agent/templates/card.md', import.meta.url), 'utf8');

/** La plantilla con sus marcadores `<…>` del frontmatter reemplazados por valores reales. */
const filled = template
  .replace(
    '<components[].id del índice, "<ruta>#<Clase>">',
    JSON.stringify(
      'src/app/shared/components/ui/mimi-select/mimi-select.component.ts#MimiSelectComponent',
    ),
  )
  .replace('<hash del componente en index.json>', 'a'.repeat(64));

const card: CardFrontmatter = {
  schemaVersion: 1,
  id: 'src/app/shared/mimi-select/mimi-select.component.ts#MimiSelectComponent',
  selector: 'mimi-select',
  source: 'src/app/shared/mimi-select/',
  kind: 'wrapper',
  wraps: 'nz-select',
  hash: 'b'.repeat(64),
  usedIn: 3,
};

const errors = (markdown: string) => {
  const result = parseCard(markdown);
  return result.ok ? [] : result.errors;
};

describe('frontmatter de la ficha', () => {
  it('la plantilla card.md, con sus marcadores reemplazados, es válida', () => {
    const result = parseCard(filled);
    expect(result.ok ? [] : result.errors).toEqual([]);
    if (!result.ok) return;
    expect(result.data).toMatchObject({ selector: 'mimi-select', kind: 'wrapper', usedIn: 3 });
    expect(result.body.startsWith('\n# mimi-select')).toBe(true);
  });

  it('stringifyCard → parseCard devuelve exactamente lo mismo', () => {
    const body = '\n# mimi-select\n\nTexto con --- en medio.\n';
    const text = stringifyCard(card, body);
    expect(parseCard(text)).toEqual({ ok: true, data: card, body });
    expect(stringifyCard({ ...card, wraps: null, kind: 'component' }, '')).toContain('wraps: null');
  });

  it('stringifyCard escribe los campos siempre en el mismo orden', () => {
    const reversed = Object.fromEntries(Object.entries(card).reverse()) as CardFrontmatter;
    expect(stringifyCard(reversed, '')).toBe(stringifyCard(card, ''));
    expect(stringifyCard(card, '').split('\n').slice(1, 3)).toEqual([
      'schemaVersion: 1',
      `id: ${card.id}`,
    ]);
  });

  it('wraps va solo, y siempre, con kind wrapper', () => {
    expect(CardFrontmatter.safeParse({ ...card, kind: 'component' }).success).toBe(false);
    expect(CardFrontmatter.safeParse({ ...card, wraps: null }).success).toBe(false);
    expect(CardFrontmatter.safeParse({ ...card, kind: 'unused' }).success).toBe(false);
    expect(CardFrontmatter.safeParse({ ...card, source: 'src/app/x' }).success).toBe(false);
  });

  it('errores legibles: sin frontmatter, sin cierre, campo faltante o desconocido', () => {
    expect(errors('# sin frontmatter')).toEqual(['la ficha debe empezar con una línea "---"']);
    expect(errors('---\nselector: a\n')).toEqual([
      'falta la línea "---" que cierra el frontmatter',
    ]);
    const text = stringifyCard(card, '');
    expect(errors(text.replace(/^usedIn: 3\n/m, ''))).toEqual([
      'usedIn: Entrada inválida: se esperaba número, recibido indefinido',
    ]);
    expect(errors(text.replace('usedIn: 3', 'usedIn: 3\nextra: 1')).join()).toContain('extra');
  });

  it('acepta CRLF y BOM', () => {
    const text = `\uFEFF${stringifyCard(card, '\n# x\n')}`.replaceAll('\n', '\r\n');
    expect(parseCard(text)).toEqual({ ok: true, data: card, body: '\n# x\n' });
  });
});

describe('frontmatter de la ficha: seguridad', () => {
  // Si algo se ejecutara, cambiaría esta marca global.
  const flag = '__aoKitCardExecuted';
  const executed = () => (globalThis as Record<string, unknown>)[flag] === true;

  it('rechaza ---js sin ejecutar nada', () => {
    const js = `---js\n{ selector: (globalThis.${flag} = true, 'x') }\n---\n# x\n`;
    expect(errors(js)).toEqual(['frontmatter "js" no admitido: solo YAML ("---")']);
    expect(errors(js.replace('---js', '---javascript'))).toHaveLength(1);
    expect(executed()).toBe(false);
  });

  it('rechaza tags YAML custom y de otros lenguajes', () => {
    const base = stringifyCard(card, '');
    const fn = base.replace(
      'selector: mimi-select',
      `selector: !!js/function "function () { globalThis.${flag} = true }"`,
    );
    expect(errors(fn).join()).toContain('tags');
    expect(
      errors(base.replace('selector: mimi-select', 'selector: !mimi mimi-select')).join(),
    ).toContain('tags');
    expect(errors(base.replace('usedIn: 3', 'usedIn: !!int 3')).join()).toContain('tags');
    expect(executed()).toBe(false);
  });

  it('rechaza anclas, aliases, claves repetidas y __proto__', () => {
    const base = stringifyCard(card, '');
    expect(
      errors(base.replace('selector: mimi-select', 'selector: &s mimi-select\nx: *s')),
    ).not.toEqual([]);
    expect(errors(base.replace('usedIn: 3', 'usedIn: 3\nusedIn: 4'))).not.toEqual([]);
    expect(
      errors(base.replace('usedIn: 3', 'usedIn: 3\n__proto__: { polluted: true }')),
    ).not.toEqual([]);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });
});
