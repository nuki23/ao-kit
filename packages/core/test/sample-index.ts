import type { Index } from '../src/index.js';

const ev = (file: string, line: number, snippet?: string) =>
  snippet === undefined ? { file, line } : { file, line, snippet };
const split = <C extends Record<string, number>>(
  counts: C,
  majority: (keyof C & string) | null,
  divided = false,
) => ({
  counts,
  majority,
  divided,
  evidence: Object.fromEntries(Object.keys(counts).map((k) => [k, []])) as unknown as Record<
    keyof C,
    []
  >,
});

/** Índice completo de ejemplo (repo "mimi" ficticio): toca todas las secciones del esquema. */
export const sampleIndex: Index = {
  schemaVersion: 1,
  meta: {
    aoKitVersion: '0.1.0',
    angularCompilerVersion: '22.2.3',
    configHash: null,
    inputsHash: 'a1b2c3d4e5f60718',
  },
  stack: {
    framework: 'angular',
    angularVersion: '17.3.12',
    angularMajor: 17,
    workspace: 'angular-cli',
    zoneless: false,
    projectStructure: 'standalone',
    uiLibraries: [{ name: 'ng-zorro-antd', version: '17.4.1', prefixes: ['nz-'], source: 'table' }],
    icons: [{ library: '@ant-design/icons-angular', version: '17.0.0' }],
    state: [],
    tests: [{ library: 'jasmine-core', version: '5.1.2' }],
    styles: { preprocessors: ['scss'], tailwind: null, themes: ['src/styles/_variables.scss'] },
    aliases: [
      { alias: '@shared/*', paths: ['src/app/shared/*'], resolvesTo: 'src/app/shared/', via: null },
    ],
  },
  projects: [
    {
      name: 'mimi',
      type: 'application',
      root: '',
      sourceRoot: 'src',
      prefix: 'app',
      builder: '@angular-devkit/build-angular:application',
      bootstrap: 'bootstrapApplication',
      projectStructure: 'standalone',
      packageName: null,
      entryFile: null,
      consumes: [],
    },
  ],
  sharedScopes: [{ scope: 'project', project: 'mimi', source: 'src/app/shared/' }],
  components: [
    {
      id: 'src/app/shared/mimi-select/mimi-select.component.ts#MimiSelectComponent',
      selector: 'mimi-select',
      className: 'MimiSelectComponent',
      project: 'mimi',
      scope: 'project',
      exported: null,
      files: {
        ts: 'src/app/shared/mimi-select/mimi-select.component.ts',
        template: 'src/app/shared/mimi-select/mimi-select.component.html',
        styles: ['src/app/shared/mimi-select/mimi-select.component.scss'],
      },
      standalone: { effective: true, explicit: true },
      changeDetection: { effective: 'Eager', explicit: false },
      inputs: [],
      outputs: [],
      slots: ['default'],
      kind: 'wrapper',
      wraps: 'nz-select',
      criteria: {
        a: {
          met: true,
          element: 'nz-select',
          ratio: { value: 2, total: 2 },
          evidence: [ev('src/app/pages/pagos/pagos.component.html', 5)],
        },
        b: {
          met: true,
          selectors: [':host ::ng-deep .ant-select'],
          evidence: [ev('src/app/shared/mimi-select/mimi-select.component.scss', 3)],
        },
        c: { met: true, attribute: 'mimi-select', ratio: { value: 2, total: 2 }, evidence: [] },
      },
      contract: [
        {
          piece: 'mimi-select',
          on: 'projected',
          type: 'attribute',
          required: true,
          present: 2,
          total: 2,
          missing: [],
          inert: false,
        },
        {
          piece: 'nzShowSearch',
          on: 'projected',
          type: 'attribute',
          required: false,
          present: 1,
          total: 2,
          missing: [ev('src/app/pages/perfil/perfil.component.html', 8)],
          inert: false,
        },
      ],
      hash: '0f1e2d3c4b5a6978',
      evidence: [
        ev('src/app/shared/mimi-select/mimi-select.component.ts', 4, "selector: 'mimi-select',"),
      ],
    },
    {
      id: 'src/app/shared/old-table/old-table.component.ts#OldTableComponent',
      selector: 'mimi-old-table',
      className: 'OldTableComponent',
      project: 'mimi',
      scope: 'project',
      exported: null,
      files: {
        ts: 'src/app/shared/old-table/old-table.component.ts',
        template: 'inline',
        styles: [],
      },
      standalone: { effective: true, explicit: true },
      changeDetection: { effective: 'OnPush', explicit: true },
      inputs: [{ name: 'rows', required: true, kind: 'decorator', type: 'unknown[]' }],
      outputs: [{ name: 'rowClick', kind: 'decorator' }],
      slots: [],
      kind: 'unused',
      formerKind: 'component',
      unusedReason: 'no-template-usage',
      wraps: null,
      criteria: null,
      contract: null,
      hash: '1234abcd5678ef90',
      evidence: [],
    },
  ],
  directives: [
    {
      id: 'src/app/shared/input-effect.directive.ts#InputEffectDirective',
      className: 'InputEffectDirective',
      project: 'mimi',
      scope: 'project',
      exported: null,
      standalone: { effective: true, explicit: true },
      used: true,
      evidence: [],
      selector: '[inputEffectDirective]',
      inputs: [],
    },
  ],
  pipes: [],
  usages: [
    {
      selector: 'mimi-select',
      library: null,
      total: 2,
      byProject: { mimi: 2 },
      byFile: [
        {
          file: 'src/app/pages/pagos/pagos.component.html',
          count: 1,
          evidence: [ev('src/app/pages/pagos/pagos.component.html', 5)],
        },
        {
          file: 'src/app/pages/perfil/perfil.component.html',
          count: 1,
          evidence: [ev('src/app/pages/perfil/perfil.component.html', 7)],
        },
      ],
      showcase: 0,
      deprecated: 0,
      representative: [ev('src/app/pages/pagos/pagos.component.html', 5, '<mimi-select>')],
      wrappedBy: null,
      unwrapped: [],
    },
  ],
  ngModules: [],
  conventions: {
    mimi: {
      standalone: { ...split({ standalone: 4, ngmodule: 0 }, 'standalone'), explicitFlag: 4 },
      di: split({ constructorParam: 6, inject: 4 }, 'constructorParam', true),
      inputs: split({ decorator: 3, signal: 0 }, 'decorator'),
      outputs: split({ decorator: 0, signal: 0 }, null),
      controlFlow: split({ structural: 9, blocks: 1 }, 'structural'),
      changeDetection: split({ onPush: 0, eager: 4 }, 'eager'),
      services: split({ service: 0, injectable: 3 }, 'injectable'),
      providedIn: split({ root: 3, module: 0, component: 0 }, 'root'),
      fileNaming: { pattern: 'kebab-case.component.ts', evidence: [] },
      featureLayout: null,
      wrapperUsage: [
        {
          wrapper: 'mimi-select',
          wraps: 'nz-select',
          followed: 2,
          total: 3,
          exceptions: [ev('src/app/pages/reportes/reportes.component.html', 4)],
        },
      ],
    },
  },
  patterns: {
    modales: {
      approach: 'facade',
      facade: { id: 'src/app/core/confirm.service.ts#ConfirmService', wraps: ['NzModalService'] },
      evidence: [
        {
          what: 'ConfirmService',
          files: 2,
          evidence: [ev('src/app/pages/pagos/pagos.component.ts', 20)],
        },
      ],
      exceptions: [
        {
          ...ev('src/app/pages/reportes/reportes.component.ts', 31),
          detail: 'NzModalService.info directo',
        },
      ],
      details: {
        library: 'ng-zorro-antd',
        dataPassing: { mechanism: 'nzData', evidence: [ev('src/app/core/confirm.service.ts', 18)] },
        result: null,
        provider: null,
      },
    },
    estado: {
      approach: 'signals-service',
      facade: null,
      evidence: [],
      exceptions: [],
      details: {
        facts: [
          {
            key: 'store',
            value: 'signal + computed en un servicio',
            evidence: [ev('src/app/core/carrito.store.ts', 5)],
          },
        ],
      },
    },
  },
  notDetected: [{ need: 'notificaciones', missing: 'interceptor de errores HTTP' }],
  emergentPatterns: [
    {
      symbol: 'src/app/core/permisos.ts#tienePermiso',
      kind: 'function',
      features: [
        { feature: 'src/app/pages/pagos/', count: 4 },
        { feature: 'src/app/pages/perfil/', count: 2 },
        { feature: 'src/app/pages/reportes/', count: 1 },
      ],
      total: 7,
      evidence: [ev('src/app/pages/pagos/pagos.component.ts', 40)],
    },
  ],
  templateSyntax: [
    {
      feature: 'controlFlowBlocks',
      sinceMajor: 17,
      count: 1,
      evidence: [ev('src/app/pages/perfil/perfil.component.html', 3)],
    },
  ],
  duplicates: [],
  routes: {
    mimi: [
      { path: '', redirectTo: 'pagos', showcase: false, evidence: ev('src/app/app.routes.ts', 4) },
      {
        path: 'pagos',
        loadChildren: 'src/app/pages/pagos/pagos.routes.ts#PAGOS_ROUTES',
        canActivate: ['src/app/core/auth.guard.ts#authGuard'],
        showcase: false,
        evidence: ev('src/app/app.routes.ts', 5),
        children: [
          {
            path: '',
            loadComponent: 'src/app/pages/pagos/pagos.component.ts#PagosComponent',
            showcase: false,
            evidence: ev('src/app/pages/pagos/pagos.routes.ts', 3),
          },
        ],
      },
    ],
  },
  services: [
    {
      id: 'src/app/core/confirm.service.ts#ConfirmService',
      name: 'ConfirmService',
      project: 'mimi',
      decorator: '@Injectable',
      providedIn: 'root',
      baseClass: null,
      role: 'facade',
      used: true,
      registered: null,
      http: [],
      hash: 'deadbeefcafebabe',
      evidence: [],
    },
    {
      id: 'src/app/core/legacy-auth.interceptor.ts#legacyAuthInterceptor',
      name: 'legacyAuthInterceptor',
      project: 'mimi',
      decorator: 'none',
      providedIn: 'none',
      baseClass: null,
      role: 'interceptor',
      used: false,
      registered: false,
      http: [],
      hash: 'feedface00112233',
      evidence: [],
    },
  ],
  tokens: [
    {
      name: '$color-primario',
      value: '#0b5fff',
      kind: 'scss',
      evidence: ev('src/styles/_variables.scss', 1),
    },
  ],
  inertAttributes: [
    {
      attribute: 'appAutoFocus',
      reason: 'no-matching-selector',
      directive: null,
      occurrences: 1,
      evidence: [ev('src/app/pages/pagos/pagos.component.html', 9)],
    },
  ],
  possibleIssues: [
    {
      code: 'global-dom-query',
      message: 'document.querySelectorAll desde una directiva',
      evidence: ev('src/app/shared/input-effect.directive.ts', 17),
    },
  ],
  docDrift: [
    {
      doc: ev('CLAUDE.md', 42, 'los íconos se registran en app.config.ts'),
      claim: 'path',
      value: 'src/app/icons.ts',
      status: 'moved',
      actual: ev('src/app/core/icons.ts', 1),
      fix: 'CLAUDE.md',
    },
  ],
  warnings: [],
};
