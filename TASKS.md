# TASKS — ao-kit

Formato: `[ ]` pendiente · `[x]` hecha. Cada tarea tiene un criterio de aceptación (CA).

## M0 — Validación manual (sin código, en el proyecto A y el proyecto B)
Proyecto A: Angular 17 standalone con wrappers de ng-zorro. Proyecto B: Angular 21 con skill angular-ao.
- [ ] 0.1 Escribir a mano `.ao/conventions.md`, `.ao/catalog.md` y 3 fichas en el proyecto A (sus wrappers de select, input y botón, equivalentes a mimi-select, mimi-input y mimi-button).
- [ ] 0.2 Lo mismo en el proyecto B (page-header, custom-table, filter-drawer) + `recipes/listado.md` apuntando a su feature CRUD de referencia (como `pages/proveedores` en ng21-ao).
- [ ] 0.3 Correr 3 tareas reales en cada proyecto, primero sin y luego con esos archivos. Anotar: componentes reutilizados vs creados, archivos leídos y correcciones necesarias.
  - CA: hay una mejora clara; si no la hay, se ajusta el formato de las fichas antes de seguir.
- [ ] 0.4 Congelar las plantillas finales en `agent/templates/` (salen de 0.1 y 0.2).

## M1 — Repo base
- [x] 1.1 Monorepo pnpm: `pnpm-workspace.yaml`, `tsconfig.base.json`, tsup, vitest, eslint/prettier, changesets.
- [x] 1.2 Paquetes vacíos core, scanner-angular, adapters, cli, que compilan y tienen un test dummy.
- [x] 1.3 GitHub Actions: install, build y test en cada PR.
  - CA: `pnpm build && pnpm test` en verde, local y en CI.

## M2 — Fixtures
- [x] 2.1 `fixtures/ng17-wrappers`: app Angular 17 mínima con `mimi-select`/`mimi-input` (ng-content + `::ng-deep .ant-*`), 3 páginas que los usan, `@Input`, constructor DI, SCSS con variables.
- [x] 2.2 `fixtures/ng21-ao`: app Angular 21 mínima con signals, `inject()`, `@if`, theme.less, Tailwind v4 `@theme`, 3 shared components, un feature CRUD (listado, crear-editar, detalle, data-access) y una ruta `/ejemplos`.
- [x] 2.3 `fixtures/ng12-modules`: app Angular 12 con NgModules (declarations/exports/imports), Angular Material (`mat-*`), rutas con `loadChildren` a módulo (`import(...).then(m => m.XModule)`) y SCSS.
- [x] 2.4 `fixtures/ng-multi`: `angular.json` con 2 aplicaciones + 1 librería interna (`projects/<lib>`, consumida vía alias de tsconfig), cada una con su `sourceRoot` y `prefix`.
- [ ] 2.5 `fixtures/ng22-modern`: Angular 22 con `@Service`, Signal Forms, `httpResource`, componentes sin `changeDetection` (OnPush por defecto en v22) y uno con `ChangeDetectionStrategy.Eager`; templates con arrow functions, spread y `@switch` con varios casos; builder `@angular/build:application`.
  - CA (todo M2): los fixtures no necesitan `npm install` para escanearse (solo se leen los archivos); cada uno tiene `README.md` (patrones que representa) y `expected.json` (lo que debe detectar el escáner).

## M3 — core
- [ ] 3.1 Esquema zod de `index.json`: stack, aliases, components[], usages, conventions, tokens, routes, services, warnings, meta (versión de ao-kit, hashes).
  - `stack` incluye `angularVersion`, `builder`, `uiLibraries[]` (nombre + prefijos, p. ej. `{ name: "ng-zorro-antd", prefixes: ["nz-"] }`) y `projectStructure` (`standalone` | `ngmodule` | `mixed`).
  - cada componente lleva `kind` (`wrapper` | `slot-container` | `component`); los `wrapper` llevan además `wraps`.
- [ ] 3.2 Esquema del frontmatter de la ficha (selector, source, kind, wraps, hash, usedIn).
- [ ] 3.3 Utilidades: rutas POSIX relativas, hash de contenido, orden estable y escritura atómica.
- [ ] 3.4 Esquema zod de `.ao/config.json` (opcional, lo escribe el equipo del repo). Si no existe, el escáner usa los valores por defecto. Campos propuestos:
  - prefijos propios de UI, que se suman a la tabla de 4.4;
  - globs a ignorar;
  - rutas/carpetas de showcase (sus usos no cuentan como uso real);
  - `deprecated`: globs de carpetas/archivos legacy. Nunca se usan como ejemplo en fichas ni recetas, y sus patrones van a recommendations.md como migración;
  - `conventions`: overrides que fuerzan una dirección aunque no sea mayoría (p. ej. `{ "inputs": "signal" }`). En conventions.md aparecen marcados "decisión del equipo" junto con el % observado.
  - CA: un índice de ejemplo pasa la validación y su JSON serializado es estable entre corridas; un config inválido da un error legible, no una excepción.

## M4 — scanner-angular
Nota: los conteos de los `expected.json` de M2 salieron de grep. Si un detector basado en AST da otro número y la diferencia está justificada (ocurrencias en comentarios o strings, por ejemplo), se corrige el `expected.json` y se explica en el commit; nunca se ajusta el detector para que coincida con grep.

- [ ] 4.1 `detect-stack`: versiones (angular, ng-zorro, tailwind, íconos, estado, tests) desde package.json y lockfile.
- [ ] 4.2 `components`: selector, standalone, inputs/outputs (decoradores y signals), templateUrl/styleUrl.
- [ ] 4.3 `templates`: parseTemplate → elementos, atributos y directivas usadas por componente.
- [ ] 4.4 `wrappers`: clasificar cada componente que proyecta contenido (`ng-content`) usando la tabla de prefijos de librerías de UI (`nz-` → ng-zorro, `mat-` → Material, `p-` → PrimeNG, `ion-` → Ionic) más los prefijos propios de `.ao/config.json`.
  - Un componente es **wrapper de X** (`kind: "wrapper"`, `wraps: X`) si cumple **≥ 2** de:
    - (a) el contenido proyectado es el mismo elemento de la librería de UI (X) en ≥ 80 % de sus usos;
    - (b) sus estilos sobrescriben clases de esa librería (`::ng-deep .ant-*`, `.mat-*`…);
    - (c) el elemento proyectado lleva un atributo con el mismo nombre del wrapper (`<mimi-select><nz-select mimi-select>`).
  - Si proyecta contenido variado, es `kind: "slot-container"` (como `page-header`). El resto es `kind: "component"`.
  - CA: ng17-wrappers da mimi-select → wrapper de nz-select y mimi-input → wrapper de nz-input (cumplen a, b y c); en ng21-ao, page-header da slot-container aunque en `detalle` se le proyecten `nz-button`, y custom-table da component.
- [ ] 4.5 `usages`: conteo por selector y los 3 sitios de uso más representativos, con su snippet (atributos y directivas incluidos).
- [ ] 4.6 `conventions`: % standalone, inject vs constructor, input() vs @Input, @if vs *ngIf y naming de archivos.
  - CA: ng17 da mayoría @Input; ng21 da mayoría input().
- [ ] 4.7 `tokens`: CSS vars de :root/@theme, variables less/scss y tailwind.config.
- [ ] 4.8 `routes` y `services`: árbol de rutas lazy, servicios con métodos HTTP y URLs.
- [ ] 4.9 Snapshot completo del índice de cada fixture.
- [ ] 4.10 `ngmodules`: leer `declarations`/`exports`/`imports` de cada `@NgModule` y resolver qué componentes y directivas están disponibles en cada template (lo que en standalone sale de `imports` del componente).
  - CA: en ng12-modules, un componente declarado en un módulo de feature ve los exports de `SharedModule` y los `mat-*` importados.
- [ ] 4.11 Test de que el `@angular/compiler` más reciente (el que usa el escáner) parsea sin errores los templates de todos los fixtures.
  - CA: falla si se agrega un fixture con un template que el parser no entiende (p. ej. sintaxis de una versión futura).
- [ ] 4.12 `duplicates`: detector de componentes duplicados entre ámbitos (librería del workspace, `shared/` de cada app). Dos componentes son duplicados si su selector tiene el **mismo nombre base sin prefijo** (`app-button` / `ui-button` → `button`) **y además** cumplen al menos uno de:
    - comparten ≥ 2 inputs (por nombre);
    - tienen una estructura de template equivalente (mismo árbol de elementos y slots `ng-content`, ignorando clases, bindings y valores de `select`).
  - El warning dice qué criterio se cumplió (inputs compartidos y/o template equivalente) y sugiere usar el de mayor alcance (la librería).
  - CA: en ng-multi, `app-button` ↔ `ui-button` (por inputs) y `bo-card` ↔ `ui-card` (por template) salen como duplicados; `bo-button-group` no (nombre base `button-group` ≠ `button`).

## M5 — CLI
- [ ] 5.1 `ao scan [path]`: escribe `.ao/index.json`, imprime un resumen y es incremental por hash.
- [ ] 5.2 `ao check`: código ≠ 0 si hay fichas cuyo hash ya no coincide (para CI y pre-commit).
- [ ] 5.3 Probar en los proyectos A y B reales (local, no se commitea nada de ellos).
  - CA: el proyecto A escanea en menos de 10 s y detecta sus wrappers de ng-zorro.
- [ ] 5.4 Corpus de repos públicos: lista versionada de repos Angular públicos (URL + commit fijo, para que sea determinista) y `pnpm corpus`, que los clona o actualiza en `.corpus/` (ignorado por git) y corre `ao scan` en cada uno, con un resumen de tiempos, warnings y conteos. Nada de `.corpus/` se commitea.
  - CA: ningún detector lanza excepción en el corpus; los fallos quedan en `warnings[]`.

## M6 — Prompts y perfil
- [ ] 6.1 `agent/commands/init.md`: corre `ao scan` si no hay índice, lee el índice, abre solo los archivos que cita y genera AGENTS.md, CLAUDE.md (`@AGENTS.md`), `.ao/*` y la skill del proyecto.
- [ ] 6.2 `agent/profiles/angular-modern` (antes angular-21): angular-ao refactorizado. Cada regla declara su versión mínima de Angular (p. ej. `input()` ≥ 17.1, control flow `@if` ≥ 17, Signal Forms ≥ 22) y solo se recomienda si el repo la cumple. Resolver la contradicción lucide-angular vs @ng-icons e integrar shared-components y styling desde la copia del proyecto B.
- [ ] 6.3 Regla en el prompt: lo observado > el perfil; las diferencias van a recommendations.md.
  - CA: /ao:init en ng17-wrappers NO recomienda escribir con signals en las fichas, solo en recommendations.md.
- [ ] 6.4 Preguntas puntuales en `/ao:init`: cuando una convención está dividida (la minoría es ≥ 30 %, p. ej. 60 % `@Input` / 40 % `input()`), el agente pregunta cuál seguir en código nuevo, mostrando los conteos y archivos de ejemplo de cada lado, en vez de elegir solo. La respuesta queda en conventions.md como decisión del equipo.
  - Si nadie responde (ejecución sin usuario presente), la convención queda en conventions.md como "pendiente de confirmar", con ambas opciones y su evidencia; nunca se inventa la respuesta.
  - CA: con una convención 70/30 hay pregunta; con 90/10 no la hay y gana la mayoría; sin usuario presente, la 70/30 queda "pendiente de confirmar" con las dos opciones, sus conteos y archivos.

## M7 — Adaptador Claude Code + install
- [ ] 7.1 Generar un plugin `ao` (`.claude-plugin/plugin.json`, `commands/init.md`) → `/ao:init`.
- [ ] 7.2 `marketplace.json` en el repo, para instalarlo vía `/plugin marketplace add`.
- [ ] 7.3 `ao install --agents claude` en un repo destino.
  - CA: en el proyecto B, `/ao:init` aparece y genera `.ao/`.

## M8 — Otros agentes
- [ ] 8.1 Verificar los formatos actuales (cambian seguido): Codex (AGENTS.md, prompts y skills), Antigravity (`.agent/workflows`, rules), Gemini CLI (`.gemini/commands/ao/init.toml`).
- [ ] 8.2 Implementar los adaptadores codex, agy y gemini a partir de la misma fuente.
  - CA: el mismo `init.md` se ejecuta en los 3 agentes.

## M9 — Sync y publicación 0.1
- [ ] 9.1 `agent/commands/sync.md`: regenera solo las fichas con hash viejo.
- [ ] 9.2 README, licencia y changeset; `npm publish` de `ao-kit@0.1.0`.

## Backlog (después de 0.1)
- [ ] /ao:view (prompt + Figma MCP → plan de reutilización → genera)
- [ ] /ao:review · /ao:component · /ao:explain · /ao:migrate · /ao:api
- [ ] MCP propio del catálogo (`ao.find_component`, `ao.get_card`)
- [ ] scanner-react · scanner-vue
- [ ] Más fixtures: Ionic (`ion-*`), PrimeNG (`p-*`) y monorepo Nx (`project.json` en lugar de `angular.json`).
- [ ] Licenciamiento: licencia propietaria, `ao login`, licencia JWT Ed25519 verificada offline + refresh online, API de licencias, landing (registro/pago o aprobación manual). Evaluar mover plantillas/generación al servidor.
