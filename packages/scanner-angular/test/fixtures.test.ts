import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const FIXTURES_DIR = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const FIXTURES = ['ng-multi', 'ng12-modules', 'ng17-wrappers', 'ng21-ao', 'ng22-modern'];

const tsFiles = (fixture: string): string[] =>
  readdirSync(join(FIXTURES_DIR, fixture, 'src'), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.ts'));

const read = (fixture: string, file: string): string =>
  readFileSync(join(FIXTURES_DIR, fixture, file), 'utf8');

describe.each(FIXTURES)('fixture %s', (fixture) => {
  it('se escanea sin instalar nada (no trae node_modules)', () => {
    expect(existsSync(join(FIXTURES_DIR, fixture, 'node_modules'))).toBe(false);
    expect(existsSync(join(FIXTURES_DIR, fixture, 'package.json'))).toBe(true);
  });

  it('documenta sus patrones en README.md', () => {
    expect(existsSync(join(FIXTURES_DIR, fixture, 'README.md'))).toBe(true);
  });

  it('trae un expected.json válido', () => {
    expect(() => JSON.parse(read(fixture, 'expected.json')) as unknown).not.toThrow();
  });
});

describe('ng-multi', () => {
  it('tiene 2 aplicaciones y 1 librería en angular.json', () => {
    const { projects } = JSON.parse(read('ng-multi', 'angular.json')) as {
      projects: Record<string, { projectType: string }>;
    };
    const types = Object.values(projects).map((p) => p.projectType);
    expect(types.filter((t) => t === 'application')).toHaveLength(2);
    expect(types.filter((t) => t === 'library')).toHaveLength(1);
  });

  it('la librería publica su API en public-api.ts', () => {
    expect(existsSync(join(FIXTURES_DIR, 'ng-multi', 'projects/acme-ui/src/public-api.ts'))).toBe(
      true,
    );
  });
});

describe('ng12-modules', () => {
  it('arranca desde AppModule', () => {
    expect(read('ng12-modules', 'src/main.ts')).toContain('bootstrapModule(AppModule)');
  });

  it('ningún .ts declara la propiedad standalone', () => {
    const files = tsFiles('ng12-modules');
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(read('ng12-modules', join('src', file)), file).not.toMatch(/\bstandalone\s*:/);
    }
  });
});

describe('ng22-modern', () => {
  it('declara servicios con @Service() y nunca con @Injectable()', () => {
    const sources = tsFiles('ng22-modern').map((f) => read('ng22-modern', join('src', f)));
    expect(sources.some((s) => /@Service\(/.test(s))).toBe(true);
    expect(sources.some((s) => /@Injectable\(/.test(s))).toBe(false);
  });
});

describe('ng17-wrappers', () => {
  it.each(['mimi-select', 'mimi-input'])('el template de %s solo proyecta contenido', (name) => {
    const html = read(
      'ng17-wrappers',
      `src/app/shared/components/ui/${name}/${name}.component.html`,
    );
    expect(html).toContain('<ng-content></ng-content>');
  });
});

describe('ng21-ao', () => {
  it('expone la ruta /ejemplos', () => {
    expect(read('ng21-ao', 'src/app/app.routes.ts')).toContain("path: 'ejemplos'");
  });
});
