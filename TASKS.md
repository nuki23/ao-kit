# TASKS — ao-kit

Formato: `[ ]` pendiente · `[x]` hecha. Cada tarea tiene un criterio de aceptación (CA).

## M0 — Validación manual (sin código, en el proyecto A y el proyecto B)
Proyecto A: Angular 17 standalone con wrappers de ng-zorro. Proyecto B: Angular 21 con skill angular-ao.
Resultado de 0.1, 0.2 y 0.2b: `docs/m0-hallazgos.md`.
- [x] 0.1 Escribir a mano `.ao/conventions.md`, `.ao/catalog.md` y 3 fichas en el proyecto A (sus wrappers de select, input y botón, equivalentes a mimi-select, mimi-input y mimi-button).
- [x] 0.2 Lo mismo en el proyecto B (page-header, custom-table, filter-drawer) + `recipes/listado.md` apuntando a su feature CRUD de referencia (como `pages/proveedores` en ng21-ao).
- [x] 0.2b Escribir a mano `.ao/patterns/modales.md` y `.ao/patterns/api.md` en los dos proyectos (forma del proyecto, 1–2 ejemplos reales, "no hacer" y excepciones; ver "Patrones por necesidad" en docs/plan.md).
- [ ] 0.3 Correr 3 tareas reales en cada proyecto, primero sin y luego con esos archivos. Anotar: componentes reutilizados vs creados, archivos leídos y correcciones necesarias. Al menos una tarea toca un modal o una llamada a la API, para medir los patterns.
  - **Se hace después de publicar la 0.1 (M9)**: prueba con/sin `.ao/` en casos de uso reales, ya con el `.ao/` generado por `ao scan` + `/ao:init`.
  - CA: hay una mejora clara; si no la hay, se ajusta el formato de las fichas y de los patterns antes de seguir.
- [x] 0.4 Congelar las plantillas finales en `agent/templates/` (salen de 0.1, 0.2 y 0.2b, sección 3 de `docs/m0-hallazgos.md`): `conventions.md`, `catalog.md`, `card.md` (con "Contrato observado" para `kind: wrapper`), `pattern.md`, `recipe.md` y `recommendations.md`, con ejemplos `mimi-*` o neutros.

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
- [x] 2.5 `fixtures/ng22-modern`: Angular 22 con `@Service`, Signal Forms, `httpResource`, componentes sin `changeDetection` (OnPush por defecto en v22) y uno con `ChangeDetectionStrategy.Eager`; templates con arrow functions, spread y `@switch` de v22 (`@case` agrupados y `@default never`); builder `@angular/build:application`. Cubre además los patrones por necesidad de v22: api (`httpResource` + `HttpClient` para escrituras), formularios (Signal Forms + validador propio), notificaciones (fachada `@Service` sobre `MatSnackBar`), estado (signals en un servicio) e iconos (`@lucide/angular` por componente).
- [x] 2.6 Completar fixtures con patrones por necesidad (huecos de la matriz de cobertura de docs/plan.md). Cada caso entra con su `expected.json` (`patterns`) y su README:
  - [x] ng21-ao: **fachada de modales** `ConfirmService` sobre `NzModalService` (paso de datos y cierre con resultado), usada en ≥ 2 sitios, y 1 uso directo de `NzModalService` como excepción.
  - [x] ng17-wrappers: **interceptor de errores** (`HttpInterceptorFn` + `withInterceptors`) que muestra el error con una fachada `NotificacionesService` sobre `NzMessageService`, y un `HttpContextToken` para suprimirlo en una llamada concreta.
  - [x] ng17-wrappers: **iconos** de ng-zorro con registro estático (en ng-zorro 17: `NzIconModule.forRoot([...])`; `provideNzIcons` es de versiones posteriores) y uso `<span nz-icon nzType="…">`.
  - [x] ng17-wrappers: **validador propio** (`ValidatorFn`) usado en 2 formularios.
  - [x] ng12-modules: **clase base de API** (`ApiService` genérico que los servicios extienden) y **wrapper de respuesta** `{ data, meta }` que se desempaqueta con `map(r => r.data)`; un servicio que no extiende la base como excepción.
  - [x] ng17-wrappers: **estado** con `@ngrx/signals` (`signalStore`) en un feature.
  - [x] ng12-modules: **notificaciones con uso directo** (`MatSnackBar` sin fachada), para que la necesidad tenga un caso directo.
  - [x] ng21-ao: **paginación en servidor** en el listado (página y tamaño en la URL de la API) frente a la paginación en cliente de `/ejemplos`.
  - [x] Casos de 4.19 (posibles problemas), cada código con un positivo y un negativo: ng17-wrappers (`duplicate-attribute`, `subscription-without-cleanup`, `global-dom-query`) y ng21-ao (`loading-set-true-in-tap`). Van en `possibleIssues` y `negatives.possibleIssues` del `expected.json`.
  - CA: cada necesidad de prioridad alta (iconos, modales, notificaciones/errores, formularios, API) tiene al menos un fixture con fachada o forma propia y uno con uso directo de la librería.
- [x] 2.7 `pnpm fixtures:verify` (`scripts/verify-fixtures.mjs` + `scripts/fixtures.config.json`): copia cada fixture a un directorio temporal fuera del repo, instala sus dependencias y lo compila con su versión de Angular (`ngc`; en ng-multi, antes `ng build` de la librería con ng-packagr).
  - Modos: `compile` (ng21-ao, ng-multi, ng22-modern), `try` (ng17-wrappers: si falla por la versión de Node se reporta "omitido por versión" sin fallar) y `parser-only` (ng12-modules, excluido por decisión; lo dice en la salida).
  - Determinismo: dependencias directas de cada fixture con versión exacta y sin lockfile (ver docs/plan.md).
  - Workflow aparte `.github/workflows/verify-fixtures.yml`: `workflow_dispatch` y semanal (lunes 06:00 UTC); no corre en los PR.
  - Un test exige que `fixtures.config.json` cubra todas las carpetas de `fixtures/` y que sus versiones sean exactas.
  - CA: con Node 24, ng-multi, ng17-wrappers, ng21-ao y ng22-modern compilan; ng12-modules sale como excluido; código de salida 0.
  - CA (todo M2): los fixtures no necesitan `npm install` para escanearse (solo se leen los archivos); cada uno tiene `README.md` (patrones que representa) y `expected.json` (lo que debe detectar el escáner).

## M3 — core
- [x] 3.1 Esquema zod de `index.json` (`packages/core/src/schema/`): stack, aliases, components[], usages, conventions, tokens, routes, services, warnings, meta (versión de ao-kit, hashes).
  - `stack` incluye `angularVersion`, `uiLibraries[]` (nombre + prefijos, p. ej. `{ name: "ng-zorro-antd", prefixes: ["nz-"] }`) y `projectStructure` (`standalone` | `ngmodule` | `mixed`).
  - cada componente lleva `kind` (`wrapper` | `slot-container` | `component`); los `wrapper` llevan además `wraps`.
  - `patterns: { <necesidad>: { approach, facade?, evidence[], exceptions[] } }`, con `necesidad` ∈ iconos, modales, notificaciones, formularios, api, estado, auth, tablas, estilos, entornos. `approach` es la forma dominante (p. ej. `"facade"`, `"direct"`, `"base-class"`); `facade` nombra el servicio o componente propio; `evidence[]` y `exceptions[]` citan archivos con conteos.
  - De M0 (`docs/m0-hallazgos.md` §4): `kind` incluye `unused`; evidencia común `{ file, line, snippet? }`; `usages` con distribución por archivo; `contract[]` en los wrappers (`{ piece, required, present, total }`); `docDrift[]`, `inertAttributes[]`, `possibleIssues[]` y `emergentPatterns[]`.
  - Decisiones: `builder` va por proyecto (`projects[]`), no en `stack`; `conventions` y `routes` van por proyecto (una app sola es un proyecto); los `id` de componentes, directivas, pipes, servicios y módulos son `"<ruta>#<Clase>"`; `details` de `patterns` tipado en las 5 necesidades de prioridad alta y `facts[]` en el resto; `unusedReason` incluye `exported-not-consumed`; `docDrift` solo lo determinista; conteos y nunca porcentajes; sin fechas.
  - Versionado: cambio incompatible ⇒ `schemaVersion + 1` (docs/plan.md, "Versionado del índice").
  - Los `expected.json` de los 5 fixtures usan este formato (índice parcial + `negatives`) y un test los valida por forma, comprueba que sus rutas, símbolos y líneas existen y que las convenciones cumplen la regla de mayoría y división.
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
  - Después (de M0): ampliar a servicios y funciones utilitarias (dos `formTouched`, dos utilidades de modal), con criterio propio de equivalencia.
- [ ] 4.13 `facades`: detector de fachadas de servicios. Una **fachada** es un servicio propio que inyecta un servicio de librería (`NzModalService`, `MatDialog`, `HttpClient`, `NzMessageService`, `MatSnackBar`…), por constructor o con `inject()`, y que el resto del código usa más que el servicio de librería directo.
  - Cuenta, fuera de la propia fachada, los archivos que inyectan la fachada frente a los que inyectan el servicio de librería; es fachada si gana. Mismo criterio de evidencia que los wrappers: archivos y conteos, y los usos directos van a `exceptions[]`.
  - Un servicio con métodos HTTP que solo envuelve `HttpClient` para un recurso (p. ej. `ProveedoresService`) no es fachada de `HttpClient`: es un servicio de datos. Solo cuenta como fachada de API una clase base o un servicio genérico que los demás usan para llamar a la API.
  - CA: en ng21-ao (tras 2.6) `ConfirmService` sale como fachada de `NzModalService` con 1 excepción; en ng12-modules `MatDialog` sale como `approach: "direct"` (sin fachada).
- [ ] 4.14 Detectores por necesidad (llenan `patterns`), en este orden de prioridad:
  1. **iconos**: librería (lucide, ng-zorro, Material, FontAwesome…), registro (`provideNzIcons`, `MatIconRegistry`, módulos) y sintaxis de uso.
  2. **modales**: fachada frente a uso directo, cómo se pasan los datos (`nzData`, `MAT_DIALOG_DATA`…) y cómo se cierra con resultado (`afterClose`, `afterClosed`…).
  3. **notificaciones/errores**: servicio de mensajes (y su fachada), interceptor de errores y cómo se suprime en una llamada (`HttpContextToken`, header, flag).
  4. **formularios**: reactive tipados o no tipados, Signal Forms, template-driven, `FormBuilder` frente a `new FormGroup/FormControl`, validadores propios, layout de campos (wrapper propio, `nz-form-item`, `mat-form-field`) y carga de catálogos para selects.
  5. **api**: `HttpClient` directo, clase base o `httpResource`; origen de la URL (`environment`, constante, token); wrapper de respuesta y cómo se desempaqueta; interceptores; `HttpContext`; ubicación de los modelos.
  6. Después: **estado**, **auth/guards**, **tablas-filtros-paginación**, **estilos** (dónde se sobrescribe la librería) y **entornos**.
  - CA: cada necesidad se valida contra los fixtures que la cubren según la matriz de cobertura de docs/plan.md; una necesidad sin evidencia en el repo no aparece en `patterns` (no se inventa).
- [ ] 4.15 `unused`: código heredado sin uso. Componentes, directivas y pipes que nadie usa en templates (ni importa en `imports`/`declarations` de otro sitio), servicios que nadie inyecta e interceptores importados pero no registrados en `withInterceptors`/`HTTP_INTERCEPTORS`.
  - Los componentes sin uso llevan `kind: "unused"` (con el `kind` que tendrían en `formerKind`); nunca se usan como ejemplo en fichas ni recetas y van a la sección "Heredado sin uso" de conventions.md y a "Legacy" de catalog.md.
  - Los usos del showcase no cuentan: un componente que solo aparece en el showcase es `unused`.
  - `unusedReason`: `no-template-usage`, `showcase-only`, `deprecated-only` o `exported-not-consumed`. Este último es para lo que exporta el public-api de una librería y nadie consume dentro del workspace: conserva `kind: "unused"`, pero no cuenta como código muerto (no va a "Heredado sin uso" ni a recommendations.md; puede tener consumidores fuera del repo).
  - CA: en ng-multi, `ui-badge` sale `unused` con `exported-not-consumed`; ningún componente usado en algún template sale `unused`.
- [ ] 4.16 `inertAttributes`: atributos de template con forma de directiva que no hacen nada. Dos casos: (1) coinciden con el selector de una directiva del repo que el componente no importa (standalone) o que su módulo no ve (NgModules, con 4.10); (2) tienen forma de directiva (`appX`, `xDirective`, prefijo propio de la config) y no coinciden con ningún selector conocido (repo, librerías de UI instaladas, Angular).
  - Cada caso va con su evidencia y el número de veces que se repite; la ficha del wrapper lo marca "se escribe siempre, no tiene efecto" y recommendations.md lo lista.
  - CA: un fixture con un atributo inerte de cada tipo da exactamente esos dos; ningún atributo HTML estándar, `aria-*`, `data-*` ni input de un componente sale como inerte.
- [ ] 4.17 `contract`: contrato observado de cada wrapper. Para cada pieza que aparece en los usos (atributo o directiva en el elemento proyectado, binding, hermano como un `label`), cuenta en cuántos usos está (`present` / `total`) y la marca `required` si está en todos.
  - Los usos del showcase y de `deprecated` no cuentan.
  - CA: en ng17-wrappers, el contrato de `mimi-select` da `mimi-select`, `inputEffectDirective`, `mimiType` y `formControlName` como `required` (3/3) y `nzShowSearch` como opcional (2/3).
- [ ] 4.18 `emergentPatterns`: patrones de dominio fuera de las 10 necesidades fijas. Una función o servicio propio usado en ≥ N features distintas (N por defecto 3, configurable) que no es componente ni ya cuenta como fachada de una necesidad. El escáner da el símbolo, el conteo y la distribución por feature; la IA en `/ao:init` le pone nombre y decide si merece `patterns/<nombre>.md`.
  - CA: en un fixture con una función de permisos usada en 3 features, sale como emergente con sus 3 features; una utilidad usada en 1 sola feature no sale.
- [ ] 4.19 `possibleIssues`: posibles problemas con códigos de alta precisión, sin falsos positivos. Una entrada por ocurrencia, con evidencia. Lo que no cumple exactamente la regla no se reporta (lo marca la IA como "a revisar", fuera del índice).
  - `duplicate-attribute`: el mismo atributo o binding dos veces en un elemento (`class` y `[class.x]` son distintos).
  - `loading-set-true-in-tap`: `x.set(true)` dentro de `tap()` en el mismo `pipe` que la request. `set(false)` en `tap` no se reporta.
  - `subscription-without-cleanup`: `subscribe` sin `takeUntilDestroyed`/`unsubscribe`/`async`, solo sobre fuentes que no completan (`valueChanges`, `params`/`queryParams` de la ruta, `interval`/`timer`, `fromEvent`, selects de un store). `HttpClient` no se reporta.
  - `global-dom-query`: `document.querySelector*` / `document.getElementsBy*` dentro de un componente o directiva (no sobre `nativeElement`).
  - CA: cada código tiene un caso positivo y uno negativo en los fixtures (ver 2.6); el detector da exactamente los `possibleIssues` de cada `expected.json` y ninguno de sus `negatives.possibleIssues`.

## M5 — CLI
- [ ] 5.1 `ao scan [path]`: escribe `.ao/index.json`, imprime un resumen y es incremental por hash.
- [ ] 5.2 `ao check`: código ≠ 0 si hay fichas cuyo hash ya no coincide (para CI y pre-commit).
- [ ] 5.3 Probar en los proyectos A y B reales (local, no se commitea nada de ellos).
  - CA: el proyecto A escanea en menos de 10 s y detecta sus wrappers de ng-zorro.
- [ ] 5.4 Corpus de repos públicos: lista versionada de repos Angular públicos (URL + commit fijo, para que sea determinista) y `pnpm corpus`, que los clona o actualiza en `.corpus/` (ignorado por git) y corre `ao scan` en cada uno, con un resumen de tiempos, warnings y conteos. Nada de `.corpus/` se commitea.
  - CA: ningún detector lanza excepción en el corpus; los fallos quedan en `warnings[]`.

## M6 — Prompts y perfil
- [ ] 6.1 `agent/commands/init.md`: corre `ao scan` si no hay índice, lee el índice, abre solo los archivos que cita y genera AGENTS.md, CLAUDE.md (`@AGENTS.md`), `.ao/*` y la skill del proyecto.
  - Por cada necesidad con evidencia en `patterns`, genera `.ao/patterns/<necesidad>.md` con: la forma del proyecto (fachada o enfoque), 1–2 ejemplos reales citados del repo, una sección "no hacer" (p. ej. "no inyectes NzModalService directo; usa ConfirmService") y las excepciones encontradas.
  - Las necesidades sin evidencia no van en `patterns` ni tienen archivo en `.ao/patterns/`. Si son de prioridad alta (iconos, modales, notificaciones/errores, formularios, api), se anotan en `recommendations.md` como **"no detectado"** con lo que falta (p. ej. "sin interceptor de errores HTTP: cada pantalla maneja sus errores"), sin inventar una forma. ng22-modern trae este caso (`recommendationsNotDetected` en su `expected.json`).
- [ ] 6.2 `agent/profiles/angular-modern` (antes angular-21): angular-ao refactorizado. Cada regla declara su versión mínima de Angular (p. ej. `input()` ≥ 17.1, control flow `@if` ≥ 17, Signal Forms ≥ 22, `@switch` con `@default never` ≥ 22, sobre una expresión estrechable con `@let`) y solo se recomienda si el repo la cumple. Resolver la contradicción lucide-angular vs @ng-icons e integrar shared-components y styling desde la copia del proyecto B.
- [ ] 6.3 Regla en el prompt: lo observado > el perfil; las diferencias van a recommendations.md.
  - CA: /ao:init en ng17-wrappers NO recomienda escribir con signals en las fichas, solo en recommendations.md.
- [ ] 6.4 Preguntas puntuales en `/ao:init`: cuando una convención está dividida (la minoría es ≥ 30 %, p. ej. 60 % `@Input` / 40 % `input()`), el agente pregunta cuál seguir en código nuevo, mostrando los conteos y archivos de ejemplo de cada lado, en vez de elegir solo. La respuesta queda en conventions.md como decisión del equipo.
  - Si nadie responde (ejecución sin usuario presente), la convención queda en conventions.md como "pendiente de confirmar", con ambas opciones y su evidencia; nunca se inventa la respuesta.
  - CA: con una convención 70/30 hay pregunta; con 90/10 no la hay y gana la mayoría; sin usuario presente, la 70/30 queda "pendiente de confirmar" con las dos opciones, sus conteos y archivos.
- [ ] 6.5 Drift de docs: `/ao:init` y `/ao:sync` leen la documentación propia del repo (CLAUDE.md, AGENTS.md, skills en `.claude/skills/`, `.agent/`, `.gemini/`…) y contrastan cada afirmación verificable con el índice (rutas, nombres de exports, firmas de clases base, registro de íconos, rutas de la app, convenciones). El código manda (principio 9).
  - Las contradicciones van a `docDrift[]` / la sección "Contradicciones" de conventions.md, cada una con lo que dice el documento (archivo:línea), lo que muestra el código (evidencia) y qué documento corregir. Nunca se corrige el documento del equipo sin pedirlo.
  - El escáner solo aporta lo determinista (rutas y símbolos citados en los docs que no existen en el repo); el contraste semántico lo hace el agente.
  - CA: en un fixture con un CLAUDE.md que cita una ruta inexistente y un nombre de export viejo, salen las 2 contradicciones con su evidencia; las afirmaciones que coinciden con el código no salen.

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
