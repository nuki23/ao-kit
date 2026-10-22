import { z } from 'zod';
import { Evidence, Hash } from './common.js';
import { Component, Directive, Duplicate, NgModule, Pipe, Usage } from './components.js';
import { Conventions } from './conventions.js';
import { DocDrift, InertAttribute, PossibleIssue, Warning } from './findings.js';
import { EmergentPattern, NotDetected, Patterns } from './patterns.js';
import { Route, Service, Token } from './routes-services.js';
import { Project, SharedScope, Stack } from './stack.js';

/**
 * Versión del formato de `.ao/index.json`. Regla (docs/plan.md, "Versionado del índice"):
 * un cambio incompatible (quitar o renombrar un campo, cambiar su tipo, volver obligatorio un
 * campo opcional o quitar un valor de un enum) sube SCHEMA_VERSION en 1. Si `.ao/index.json`
 * tiene otra versión, `ao scan` lo regenera completo (sin incremental) y `/ao:sync` avisa.
 */
export const SCHEMA_VERSION = 1;

export const Meta = z.strictObject({
  aoKitVersion: z.string().min(1),
  /** Versión de `@angular/compiler` con la que el escáner parseó los templates. */
  angularCompilerVersion: z.string().min(1),
  /** Hash de `.ao/config.json`; null si no existe. */
  configHash: Hash.nullable(),
  /** Hash de todos los archivos escaneados. Sin fechas: el índice es determinista. */
  inputsHash: Hash,
});

export const Index = z
  .strictObject({
    schemaVersion: z.literal(SCHEMA_VERSION),
    meta: Meta,
    stack: Stack,
    /** Siempre ≥ 1: una app sola es un proyecto. */
    projects: z.array(Project).min(1),
    sharedScopes: z.array(SharedScope),
    components: z.array(Component),
    directives: z.array(Directive),
    pipes: z.array(Pipe),
    usages: z.array(Usage),
    ngModules: z.array(NgModule),
    /** Por proyecto: promediar el workspace mezclaría estilos distintos. */
    conventions: z.record(z.string(), Conventions),
    patterns: Patterns,
    notDetected: z.array(NotDetected),
    emergentPatterns: z.array(EmergentPattern),
    templateSyntax: z.array(
      z.strictObject({
        feature: z.enum([
          'controlFlowBlocks',
          'deferBlocks',
          'letDeclarations',
          'switchGroupedCases',
          'switchExhaustiveDefaultNever',
          'arrowFunctions',
          'objectSpread',
        ]),
        sinceMajor: z.int().min(2),
        count: z.int().min(1),
        evidence: z.array(Evidence),
      }),
    ),
    duplicates: z.array(Duplicate),
    routes: z.record(z.string(), z.array(Route)),
    services: z.array(Service),
    tokens: z.array(Token),
    inertAttributes: z.array(InertAttribute),
    possibleIssues: z.array(PossibleIssue),
    docDrift: z.array(DocDrift),
    warnings: z.array(Warning),
  })
  .superRefine((index, ctx) => {
    const projects = new Set(index.projects.map((p) => p.name));
    const checkProject = (name: string, path: (string | number)[]) => {
      if (!projects.has(name))
        ctx.addIssue({ code: 'custom', path, message: `proyecto desconocido: ${name}` });
    };
    for (const key of ['conventions', 'routes'] as const) {
      for (const name of Object.keys(index[key])) checkProject(name, [key, name]);
    }
    for (const key of ['components', 'directives', 'pipes', 'services', 'ngModules'] as const) {
      const seen = new Set<string>();
      index[key].forEach((item, i) => {
        checkProject(item.project, [key, i, 'project']);
        if (seen.has(item.id))
          ctx.addIssue({
            code: 'custom',
            path: [key, i, 'id'],
            message: `id repetido: ${item.id}`,
          });
        seen.add(item.id);
      });
    }
    index.usages.forEach((u, i) => {
      for (const name of Object.keys(u.byProject))
        checkProject(name, ['usages', i, 'byProject', name]);
    });
  });

export type Index = z.infer<typeof Index>;
