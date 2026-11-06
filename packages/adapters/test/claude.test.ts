import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import {
  PLACEHOLDERS,
  TEMPLATES_APPENDIX,
  parseCommand,
  readPluginSources,
  renderClaudePlugin,
} from '../src/index.js';
import cli from '../../cli/package.json' with { type: 'json' };

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const sources = readPluginSources(join(repo, 'agent'), cli.version);
const files = renderClaudePlugin(sources);

function walk(dir: string, rel = ''): string[] {
  return readdirSync(join(dir, rel), { withFileTypes: true }).flatMap((e) => {
    const p = rel ? `${rel}/${e.name}` : e.name;
    return e.isDirectory() ? walk(dir, p) : [p];
  });
}

const frontmatter = (text: string) =>
  parse(/^---\n([\s\S]*?)\n---\n/.exec(text)![1]!) as Record<string, unknown>;

describe('adaptador claude', () => {
  it('cada comando de agent/commands es una skill /ao:<comando>', () => {
    expect(sources.commands.map((c) => c.name)).toEqual(['init', 'view']);
    for (const { name } of sources.commands) {
      const skill = files[`plugins/ao/skills/${name}/SKILL.md`]!;
      expect(frontmatter(skill)).toMatchObject({ name, 'disable-model-invocation': true });
    }
  });

  it('las plantillas viajan enteras dentro del SKILL.md (anexo), no como archivos aparte', () => {
    const appendix = (name: string) =>
      files[`plugins/ao/skills/${name}/SKILL.md`]!.split(`\n## ${TEMPLATES_APPENDIX}\n`)[1]!;
    const embedded = (text: string) =>
      [...text.matchAll(/^### `([^`]+)`\n\n(`{4,})markdown\n([\s\S]*?)\n\2$/gm)].map((m) => [
        m[1],
        `${m[3]}\n`,
      ]);
    expect(Object.fromEntries(embedded(appendix('init')))).toEqual(sources.templates);
    expect(embedded(appendix('view'))).toEqual([
      ['card.md', sources.templates['card.md']],
      ['catalog.md', sources.templates['catalog.md']],
    ]);
    expect(Object.keys(files).filter((f) => f.includes('/templates/'))).toEqual([]);
  });

  it('traduce los marcadores: plantillas por el anexo y la versión de ao-kit', () => {
    for (const { name } of sources.commands) {
      const body = files[`plugins/ao/skills/${name}/SKILL.md`]!.split(
        `\n## ${TEMPLATES_APPENDIX}\n`,
      )[0]!;
      for (const p of PLACEHOLDERS) expect(body).not.toContain(p);
      expect(body).toContain(`«${TEMPLATES_APPENDIX}», al final de este archivo`);
      expect(body).toContain('`' + cli.version + '`');
    }
  });

  it('marketplace en la raíz que apunta al plugin ao, sin licencia open source', () => {
    const market = JSON.parse(files['.claude-plugin/marketplace.json']!);
    expect(market).toMatchObject({
      name: 'ao-kit',
      plugins: [{ name: 'ao', source: './plugins/ao' }],
    });
    const plugin = JSON.parse(files['plugins/ao/.claude-plugin/plugin.json']!);
    expect(plugin).toMatchObject({ name: 'ao', license: 'UNLICENSED' });
  });

  it('lo generado en el repo está al día con agent/ (nunca se edita a mano: pnpm build)', () => {
    const onDisk = [
      '.claude-plugin/marketplace.json',
      ...walk(join(repo, 'plugins/ao')).map((p) => `plugins/ao/${p}`),
    ].sort();
    expect(onDisk).toEqual(Object.keys(files).sort());
    for (const [path, content] of Object.entries(files))
      expect(readFileSync(join(repo, path), 'utf8').replaceAll('\r\n', '\n'), path).toBe(content);
  });

  it('es determinista', () => {
    expect(renderClaudePlugin(readPluginSources(join(repo, 'agent'), cli.version))).toEqual(files);
  });

  it('rechaza comandos fuente sin description, con campos desconocidos o marcadores mal escritos', () => {
    expect(() => parseCommand('x', '# sin frontmatter')).toThrow('falta el frontmatter');
    expect(() => parseCommand('x', '---\nargument-hint: a\n---\n')).toThrow('falta description');
    expect(() => parseCommand('x', '---\ndescription: a\nname: b\n---\n')).toThrow('name');
    expect(() => parseCommand('x', '---\ndescription: a\ntemplates: card.md\n---\n')).toThrow(
      'templates debe ser una lista',
    );
    const bad = {
      ...sources,
      commands: [parseCommand('x', '---\ndescription: a\n---\n{{plantillas}}')],
    };
    expect(() => renderClaudePlugin(bad)).toThrow('{{plantillas}}');
    const missing = {
      ...sources,
      commands: [parseCommand('x', '---\ndescription: a\ntemplates: [nada.md]\n---\n')],
    };
    expect(() => renderClaudePlugin(missing)).toThrow('no existe la plantilla nada.md');
  });

  it('existe la carpeta generada', () => {
    expect(existsSync(join(repo, 'plugins/ao/.claude-plugin/plugin.json'))).toBe(true);
  });
});
