import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { compareCodePoint } from '@ao-kit/core';
import { parse, stringify } from 'yaml';

/** Nombre del plugin: los comandos quedan como /ao:<comando>. */
export const PLUGIN_NAME = 'ao';
export const MARKETPLACE_NAME = 'ao-kit';
const OWNER = { name: 'nuki23', url: 'https://github.com/nuki23' };
const REPOSITORY = 'https://github.com/nuki23/ao-kit';
const DESCRIPTION =
  'Contexto de proyecto para agentes de código: /ao:init documenta cómo se trabaja en el repo (.ao/) y /ao:view genera vistas reutilizando lo que ya existe.';

/** Marcadores de agent/commands/*.md que cada adaptador traduce. */
export const PLACEHOLDERS = ['{{templates}}', '{{version}}'] as const;

/** Título del anexo con las plantillas, al final de cada SKILL.md. */
export const TEMPLATES_APPENDIX = 'Anexo: plantillas';

export interface CommandSource {
  /** Nombre del comando (archivo sin .md). */
  name: string;
  description: string;
  argumentHint?: string;
  /** Plantillas de agent/templates que usa el comando; si se omite, todas. */
  templates?: string[];
  body: string;
}

export interface PluginSources {
  commands: CommandSource[];
  /** Plantillas de agent/templates: nombre de archivo → contenido. */
  templates: Record<string, string>;
  /** Versión de ao-kit que se escribe en la cabecera de los archivos generados. */
  version: string;
}

const FIELDS = ['description', 'argument-hint', 'templates'];

/** Lee un comando fuente: frontmatter YAML (`description`, `argument-hint`, `templates`) y cuerpo. */
export function parseCommand(name: string, markdown: string): CommandSource {
  const where = `agent/commands/${name}.md`;
  const text = markdown.replaceAll('\r\n', '\n');
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) throw new Error(`${where}: falta el frontmatter`);
  const meta = parse(m[1]!, { schema: 'core' }) as Record<string, unknown>;
  const unknown = Object.keys(meta).filter((k) => !FIELDS.includes(k));
  if (unknown.length > 0) throw new Error(`${where}: campos desconocidos: ${unknown.join(', ')}`);
  if (typeof meta['description'] !== 'string' || meta['description'] === '')
    throw new Error(`${where}: falta description`);
  const hint = meta['argument-hint'];
  const templates = meta['templates'];
  if (
    templates !== undefined &&
    !(Array.isArray(templates) && templates.every((t) => typeof t === 'string'))
  )
    throw new Error(`${where}: templates debe ser una lista de archivos de agent/templates`);
  return {
    name,
    description: meta['description'],
    ...(typeof hint === 'string' ? { argumentHint: hint } : {}),
    ...(templates ? { templates: templates as string[] } : {}),
    body: text.slice(m[0].length),
  };
}

/** Lee agent/commands y agent/templates. */
export function readPluginSources(agentDir: string, version: string): PluginSources {
  const md = (dir: string) =>
    readdirSync(join(agentDir, dir))
      .filter((f) => f.endsWith('.md'))
      .sort(compareCodePoint);
  return {
    commands: md('commands').map((f) =>
      parseCommand(f.slice(0, -3), readFileSync(join(agentDir, 'commands', f), 'utf8')),
    ),
    templates: Object.fromEntries(
      md('templates').map((f) => [
        f,
        readFileSync(join(agentDir, 'templates', f), 'utf8').replaceAll('\r\n', '\n'),
      ]),
    ),
    version,
  };
}

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

/** Valla de código más larga que cualquiera de las que tenga el contenido. */
function fenceFor(content: string): string {
  const longest = Math.max(0, ...[...content.matchAll(/`{3,}/g)].map((m) => m[0].length));
  return '`'.repeat(Math.max(4, longest + 1));
}

/**
 * Anexo con las plantillas, dentro del propio SKILL.md. Van incrustadas (y no como archivos al
 * lado) porque la carpeta de un plugin instalado queda fuera del repo, y con
 * `permissions.blockReadsOutsideWorkingDirectories` el agente no puede leerla.
 */
function templatesAppendix(cmd: CommandSource, templates: Record<string, string>): string {
  const names = cmd.templates ?? Object.keys(templates);
  const parts = [
    `\n## ${TEMPLATES_APPENDIX}\n`,
    'Formato de salida. Cada plantilla va entera entre las vallas; no copies las vallas al archivo que escribas.\n',
  ];
  for (const name of names) {
    const content = templates[name];
    if (content === undefined)
      throw new Error(`agent/commands/${cmd.name}.md: no existe la plantilla ${name}`);
    const fence = fenceFor(content);
    parts.push(`### \`${name}\`\n\n${fence}markdown\n${content.replace(/\n?$/, '\n')}${fence}\n`);
  }
  return parts.join('\n');
}

/**
 * Archivos del plugin de Claude Code (ruta relativa a la raíz del repo → contenido).
 * Cada comando es una skill (`skills/<nombre>/SKILL.md`, invocada como /ao:<nombre>) que lleva
 * sus plantillas en un anexo: la carpeta de la skill funciona sola, también copiada a mano en
 * otros agentes. Determinista: mismo input, mismo output.
 */
export function renderClaudePlugin(src: PluginSources): Record<string, string> {
  const root = `plugins/${PLUGIN_NAME}`;
  const files: Record<string, string> = {
    '.claude-plugin/marketplace.json': json({
      name: MARKETPLACE_NAME,
      owner: OWNER,
      description: DESCRIPTION,
      plugins: [{ name: PLUGIN_NAME, source: `./${root}`, description: DESCRIPTION }],
    }),
    [`${root}/.claude-plugin/plugin.json`]: json({
      name: PLUGIN_NAME,
      displayName: 'ao-kit',
      description: DESCRIPTION,
      author: OWNER,
      repository: REPOSITORY,
      license: 'UNLICENSED',
    }),
  };
  for (const cmd of src.commands) {
    const frontmatter = stringify(
      {
        name: cmd.name,
        description: cmd.description,
        ...(cmd.argumentHint ? { 'argument-hint': cmd.argumentHint } : {}),
        // Escriben archivos en el repo: solo cuando el usuario las llama.
        'disable-model-invocation': true,
      },
      { lineWidth: 0 },
    );
    const body = cmd.body
      .replaceAll('{{templates}}', `«${TEMPLATES_APPENDIX}», al final de este archivo`)
      .replaceAll('{{version}}', src.version);
    const left = /\{\{[a-z_]+\}\}/.exec(body);
    if (left) throw new Error(`agent/commands/${cmd.name}.md: marcador desconocido ${left[0]}`);
    const header =
      '<!-- Generado por @ao-kit/adapters desde agent/commands y agent/templates. No lo edites a mano: corre pnpm build. -->\n';
    files[`${root}/skills/${cmd.name}/SKILL.md`] =
      `---\n${frontmatter}---\n${header}${body.replace(/\n*$/, '\n')}${templatesAppendix(cmd, src.templates)}`;
  }
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => compareCodePoint(a, b)));
}

/** Escribe el plugin en `repoRoot`, borrando antes lo generado (plugins/ao y el marketplace). */
export function writeClaudePlugin(repoRoot: string, files: Record<string, string>): void {
  rmSync(join(repoRoot, 'plugins', PLUGIN_NAME), { recursive: true, force: true });
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(repoRoot, path)), { recursive: true });
    writeFileSync(join(repoRoot, path), content);
  }
}
