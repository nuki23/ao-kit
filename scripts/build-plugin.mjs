// Genera el plugin de Claude Code (plugins/ao y .claude-plugin/marketplace.json) desde agent/.
// Uso: node scripts/build-plugin.mjs [carpeta destino]  (por defecto, la raíz del repo).
// Corre dentro de `pnpm build`; nunca edites a mano lo que genera.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  readPluginSources,
  renderClaudePlugin,
  writeClaudePlugin,
} from '../packages/adapters/dist/index.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = process.argv[2] ?? root;
const { version } = JSON.parse(
  readFileSync(new URL('../packages/cli/package.json', import.meta.url), 'utf8'),
);
const files = renderClaudePlugin(readPluginSources(`${root}agent`, version));
writeClaudePlugin(out, files);
console.log(`plugin ao: ${Object.keys(files).length} archivos en ${out}`);
