#!/usr/bin/env node
// Compila cada fixture con su propia versión de Angular, fuera del repo.
// Uso: pnpm fixtures:verify [nombre-de-fixture ...]
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURES_DIR = join(ROOT, 'fixtures');
const WORK_DIR = join(tmpdir(), 'ao-kit-fixtures');
const { fixtures } = JSON.parse(readFileSync(join(ROOT, 'scripts/fixtures.config.json'), 'utf8'));

const NODE_VERSION = process.versions.node;
const ENV = { ...process.env, NG_CLI_ANALYTICS: 'false', CI: 'true' };
const NODE_VERSION_ERROR = /node\.?js version|unsupported engine|requires a minimum node/i;

/** Compara versiones x.y.z. */
const compare = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
};

/** Soporta los rangos que usa Angular en engines.node: ^, ~, >=, >, <=, <, exacto, espacios (y) y || (o). */
const satisfies = (version, range) =>
  range.split('||').some((part) =>
    part
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .every((comparator) => {
        const [, op = '', raw] = comparator.match(/^(\^|~|>=|>|<=|<|=)?v?(.+)$/) ?? [];
        const base = raw.split('.').concat(['0', '0']).slice(0, 3).join('.');
        const [major, minor] = base.split('.').map(Number);
        const c = compare(version, base);
        if (op === '^') return c >= 0 && Number(version.split('.')[0]) === major;
        if (op === '~')
          return c >= 0 && version.split('.').slice(0, 2).join('.') === `${major}.${minor}`;
        if (op === '>=') return c >= 0;
        if (op === '>') return c > 0;
        if (op === '<=') return c <= 0;
        if (op === '<') return c < 0;
        return c === 0;
      }),
  );

const sh = (command, cwd) => {
  const r = spawnSync(command, { cwd, env: ENV, shell: true, encoding: 'utf8' });
  return { ok: r.status === 0, output: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
};

const installedVersion = (dir, pkg) => {
  const file = join(dir, 'node_modules', pkg, 'package.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
};

const tail = (text, lines = 25) => text.split('\n').slice(-lines).join('\n');

function verify(name, entry) {
  if (entry.mode === 'parser-only') {
    return { status: 'excluido', detail: entry.reason };
  }

  const dir = join(WORK_DIR, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(WORK_DIR, { recursive: true });
  cpSync(join(FIXTURES_DIR, name), dir, {
    recursive: true,
    filter: (src) => !['node_modules', 'dist', '.angular'].includes(basename(src)),
  });

  const skippedByNode = (detail) =>
    entry.mode === 'try' ? { status: 'omitido por versión', detail } : null;

  const install = sh('npm install --no-audit --no-fund --loglevel=error', dir);
  if (!install.ok) {
    if (NODE_VERSION_ERROR.test(install.output)) {
      const skip = skippedByNode(`npm install falló por la versión de Node (${NODE_VERSION})`);
      if (skip) return skip;
    }
    return { status: 'falló', detail: `npm install\n${tail(install.output)}` };
  }

  const core = installedVersion(dir, '@angular/core');
  const engines = core?.engines?.node;
  if (engines && !satisfies(NODE_VERSION, engines)) {
    const skip = skippedByNode(
      `Node ${NODE_VERSION} fuera de engines.node de @angular/core (${engines})`,
    );
    if (skip) return skip;
  }

  for (const step of entry.steps) {
    const r = sh(step, dir);
    if (!r.ok) {
      if (NODE_VERSION_ERROR.test(r.output)) {
        const skip = skippedByNode(`"${step}" falló por la versión de Node (${NODE_VERSION})`);
        if (skip) return skip;
      }
      return { status: 'falló', detail: `${step}\n${tail(r.output)}` };
    }
  }
  return { status: 'ok', detail: `@angular/core ${core?.version ?? '?'}` };
}

const only = process.argv.slice(2);
const names = Object.keys(fixtures).filter((n) => only.length === 0 || only.includes(n));
const unknown = only.filter((n) => !(n in fixtures));
if (unknown.length > 0) {
  console.error(`Fixtures desconocidos: ${unknown.join(', ')}`);
  process.exit(2);
}

console.log(`fixtures:verify · Node ${NODE_VERSION} · directorio temporal ${WORK_DIR}\n`);
const results = [];
for (const name of names) {
  process.stdout.write(`→ ${name} (${fixtures[name].mode}) … `);
  const result = verify(name, fixtures[name]);
  results.push({ name, ...result });
  console.log(result.status);
}

console.log('\nResumen');
for (const { name, status, detail } of results) {
  console.log(`  [${status}] ${name}: ${detail.split('\n')[0]}`);
}
const failed = results.filter((r) => r.status === 'falló');
for (const { name, detail } of failed) {
  console.log(`\n── ${name} ──\n${detail}`);
}
process.exit(failed.length > 0 ? 1 : 0);
