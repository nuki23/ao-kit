# CLAUDE.md — ao-kit

## Qué es
ao-kit es un instalable que le da contexto de proyecto a agentes de código (Claude Code, Codex, Antigravity, Gemini CLI).
`ao scan` analiza un repo frontend (Angular primero; React y Vue después) **sin IA** y genera `.ao/index.json`.
Después, el comando del agente `/ao:init` usa ese índice para escribir AGENTS.md, conventions.md, catalog.md, las fichas por componente y las recetas.
Más adelante vienen `/ao:view` (prompt o Figma → vista que reutiliza lo que ya existe), `/ao:sync` y `/ao:review`.

Plan completo: `docs/plan.md`. Backlog: `TASKS.md` (trabaja una tarea a la vez y márcala al terminar).

## Principios (no negociables)
1. **Lo observado gana sobre el perfil.** El escáner reporta cómo se trabaja *en ese repo*. Los perfiles (por ejemplo `profiles/angular-modern`, que es el antiguo angular-ao) solo alimentan `recommendations.md` y se usan cuando el repo no tiene un patrón propio.
2. **El escáner es determinista.** No usa IA ni red, y con el mismo input da el mismo output (orden estable y rutas relativas en POSIX).
3. **Toda afirmación lleva evidencia.** Cada regla en conventions.md o en una ficha cita archivos y conteos (`usado en 14 archivos: pages/solicitudes/…`).
4. **Prompts con una sola fuente.** Los comandos se escriben una vez en `agent/commands/*.md`; los adaptadores los traducen al formato de cada agente. Nunca se editan a mano los archivos generados.
5. **No se incluye código de clientes.** Los fixtures son sintéticos: reproducen patrones (wrappers de ng-zorro, showcase), no copian código real de ningún proyecto. Nunca escribas en el repo nombres de clientes, empresas ni proyectos reales; para ejemplos usa "mimi" o nombres neutros.
6. **Licencia propietaria.** Nunca pongas MIT ni otra licencia open source en ningún package.json, README o LICENSE; usa `"license": "UNLICENSED"` y `"private": true` hasta que se defina el licenciamiento.
7. **Los detectores detectan patrones, no versiones.** La versión solo se usa para interpretar los valores por defecto (por ejemplo, OnPush en v22 o standalone implícito desde v19); nunca para suponer que un patrón está o no está.
8. **Ningún detector usa nombres de proyectos concretos.** Nada de selectores, prefijos, rutas ni carpetas de proyectos reales o de los fixtures (`mimi-*`, `pages/proveedores`…) en el código del escáner. Solo se usan datos genéricos (tabla de prefijos de librerías de UI: `nz-`, `mat-`, `p-`, `ion-`); lo propio de cada repo entra por `.ao/config.json`.
9. **El código manda; la documentación existente del repo (CLAUDE.md, AGENTS.md, skills) es evidencia a contrastar, no verdad.** Lo que dicen esos documentos se compara con el índice y las contradicciones se reportan (`docDrift`); nunca se copian a conventions.md ni a las fichas sin verificarlas en el código.

## Stack
- Node ≥ 22 (CI en 22 y 24), TypeScript estricto, ESM.
- pnpm workspaces; paquetes internos con `workspace:*`.
- Build: tsup. Tests: vitest (snapshots sobre fixtures). Validación: zod.
- Angular: `ts-morph` para TS y `@angular/compiler` (`parseTemplate`) para templates. Nunca regex para HTML.
- CLI: `commander`. Archivos: `fast-glob`. Frontmatter: `gray-matter`.
- Versionado y publicación: changesets.

## Estructura
```
packages/
  core/              esquemas zod (index, card, conventions) + utilidades de rutas y hash
  scanner-angular/   detectores: stack, components, templates, wrappers, usages, conventions, tokens, routes, services, ngmodules, duplicates
  adapters/          claude | codex | agy | gemini  → escriben los comandos/skills en el formato de cada agente
  cli/               bin "ao": install, scan, check
agent/
  commands/          init.md, sync.md (fuente única de los prompts)
  templates/         plantillas de .ao/: conventions, catalog, card, pattern, recipe, recommendations (AGENTS.md llega con 6.1)
  profiles/angular-modern/  perfil recomendado (angular-ao refactorizado); cada regla con su versión mínima
fixtures/            sintéticos; cada uno con README.md y expected.json (oráculo de lo que debe detectar el escáner)
  ng12-modules/      NgModules, Angular Material, loadChildren con módulo, SCSS
  ng17-wrappers/     como el proyecto A (Angular 17 standalone con wrappers de ng-zorro): APIs viejas, @Input, constructor DI, wrappers mimi-* con ng-content + ::ng-deep
  ng21-ao/           como el proyecto B (Angular 21 con skill angular-ao): signals, inject(), shared components, showcase /ejemplos
  ng22-modern/       @Service, Signal Forms, httpResource, OnPush por defecto, @switch con @default never
  ng-multi/          angular.json con 2 apps (standalone y NgModules) + librería interna; duplicados
docs/plan.md
```

## Comandos
```bash
pnpm i
pnpm build                       # todos los paquetes
pnpm test                        # vitest
pnpm test -u                     # actualizar snapshots (solo si el cambio es intencional)
pnpm ao scan fixtures/ng17-wrappers   # correr la CLI local
pnpm fixtures:verify [fixture…]  # compila cada fixture con su Angular, fuera del repo (lento; también corre semanal en CI)
```

## Convenciones de código
- Cada detector es una función pura `(project: Project, ctx) => Partial<Index>` en su propio archivo, con un test contra todos los fixtures (compara con su `expected.json`).
- Ningún detector lanza excepción por un archivo malo: lo registra en `index.warnings[]` y sigue.
- Los nombres de campos del índice van en inglés; los textos generados para el usuario, en español.
- Cambios pequeños, un commit recomendado por tarea de TASKS.md.
- Dependencias de fixtures con versión exacta; actualizarlas es un cambio explícito con su propio commit.

## Cuándo preguntar (autonomía)
Trabaja de forma autónoma dentro del repo: crea, edita, mueve y borra archivos, instala dependencias, corre build/test sin pedir confirmación. **Nunca hagas `git add`, `git commit` ni `git push`**: los commits los hace Fran (ver "Commits").
**Solo pregunta** cuando:
- haya que decidir algo de diseño que cambie un formato público (esquema de index.json, plantilla de ficha, nombres de comandos);
- dos opciones razonables lleven a resultados distintos y no se puedan revertir fácil;
- vayas a publicar en npm o tocar algo fuera de esta carpeta;
- una tarea contradiga los principios de arriba.
Para todo lo demás, decide, sigue y deja anotada la decisión en el mensaje de commit que recomiendes.

## Commits (los hace Fran)
Al terminar cada tarea (o cada bloque lógico de cambios), **no hagas commit**. Al final de tu respuesta entrega:
1. La lista de archivos a incluir (para `git add`).
2. Un mensaje de commit recomendado en **Conventional Commits**, en español, listo para copiar:
   ```
   feat(scanner-angular): detectar wrappers de ng-zorro (4.4)

   - marca wraps: nz-select cuando el template usa ng-content y el uso proyecta nz-*
   - test con fixtures/ng17-wrappers
   Decisión: se ignoran estilos ::ng-deep fuera de :host
   ```
   - Tipos: feat, fix, refactor, test, docs, chore, build, ci.
   - Scope = paquete o carpeta (core, scanner-angular, cli, adapters, agent, fixtures).
   - Asunto ≤ 72 caracteres, en imperativo, con el número de tarea de TASKS.md.
   - Cuerpo: qué cambió y decisiones tomadas; sin relleno.
   - Nunca incluyas líneas Co-Authored-By, "Generated with Claude Code" ni ninguna atribución a Claude o Anthropic en mensajes de commit o PR.
3. Si los cambios mezclan cosas distintas, propón **varios commits** separados, cada uno con sus archivos y su mensaje.

## Cómo trabajar una tarea
1. Leer la tarea en TASKS.md y su criterio de aceptación.
2. Proponer un plan corto antes de tocar código.
3. Escribir o ajustar primero el test/fixture y después la implementación.
4. `pnpm build && pnpm test` en verde, y luego marcar la tarea `[x]`.
5. Cerrar con la lista de archivos y el mensaje de commit recomendado (sin hacer el commit).
