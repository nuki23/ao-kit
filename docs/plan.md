# ao-kit — Plan (/ao:init y comandos futuros)

Estado: planeación, sin desarrollo. Basado en revisar angular-ao (skill), el proyecto A (Angular 17 standalone con wrappers de ng-zorro) y el proyecto B (Angular 21 con skill angular-ao y showcase en /ejemplos). En los ejemplos se usa el prefijo neutro `mimi-` en lugar de los nombres reales.

## 1. Diagnóstico

- **La skill genérica choca con proyectos que no la siguen.** angular-ao describe Angular 21 (signals, inject(), input(), lucide, theme.less). El proyecto A es Angular 17 con `@Input`, constructor DI (44 archivos con @Input, 41 con inject), SCSS, FontAwesome Pro, NgRx signals, una librería interna en `projects/` y wrappers propios de ng-zorro (aquí, `mimi-*`). Si la IA aplica angular-ao en el proyecto A, genera código que no encaja.
- **El patrón wrapper del proyecto A es invisible para la IA.** `<mimi-select>` es solo `<div mimi-group><ng-content>` con estilos `:host ::ng-deep .ant-select…`; el uso real es `<mimi-select><nz-select inputEffectDirective mimi-select mimiType="outline" [nzOptionHeightPx]="42" …>`. Nada de esto está escrito en ningún lado, sale de leer los usos.
- **La skill ya se bifurcó.** La copia en el proyecto B tiene `shared-components.md` y `styling.md`, que el repo original no tiene. Además el SKILL.md dice `lucide-angular` y `componentes.md` usa `@ng-icons/lucide`: la IA recibe dos instrucciones que se contradicen.
- **El proyecto B documenta con código ejecutable.** `/ejemplos` tiene unas 1.350 líneas de showcase más un ejemplo CRUD. Es lazy, así que no pesa en el bundle inicial, pero se compila, hay que mantenerlo y la IA lo tiene que leer completo para sacar una regla.
- **No hay un índice.** Sin un catálogo de "para X usa Y", el agente hace grep, encuentra la mitad de las cosas y termina creando componentes nuevos.

## 2. Solución

### Arquitectura recomendada: escáner determinista + comando del agente

1. **`ao scan`** (CLI en Node, sin IA): analiza el repo con AST y genera `.ao/index.json`.
   - Stack y versiones: versión de Angular, builder, librerías de UI (con sus prefijos), íconos, estado, estilos, tests y estructura del proyecto (`standalone` | `ngmodule` | `mixed`).
   - Aliases de tsconfig, rutas, servicios y endpoints, tokens (CSS vars, theme.less/scss, tailwind config).
   - Componentes: selector, inputs/outputs, si son standalone y su **tipo** (`kind`):
     - `wrapper` de X si cumple ≥ 2 de: (a) lo proyectado es el mismo elemento de la librería de UI X en ≥ 80 % de los usos; (b) sus estilos sobrescriben clases de esa librería (`::ng-deep .ant-*`, `.mat-*`…); (c) el elemento proyectado lleva un atributo con el mismo nombre del wrapper (`<mimi-select><nz-select mimi-select>`). Ejemplo: `mimi-select` → `wraps: nz-select`.
     - `slot-container` si proyecta contenido variado (por ejemplo `page-header`, que recibe botones distintos en cada página).
     - `component` en el resto de casos.
     - Las librerías se reconocen con una tabla de prefijos (`nz-`, `mat-`, `p-`, `ion-`) más los prefijos propios que el equipo declare en `.ao/config.json`.
   - En proyectos con NgModules: qué componentes ve cada template según `declarations`/`exports`/`imports`.
   - **Patrones por necesidad** (`patterns`): cómo resuelve el proyecto iconos, modales, notificaciones/errores, formularios, API, estado, auth, tablas, estilos y entornos, incluidas sus **fachadas** de servicios (ver más abajo).
   - Usos reales: cuántas veces se usa cada componente y los 2–3 sitios de uso más representativos (los del showcase no cuentan como uso real).
   - Estadísticas de convenciones: % de standalone, inject vs constructor, signals vs @Input, @if vs *ngIf y naming de archivos.
   - Es incremental (hash por archivo), barato, reproducible y no se inventa nada.
   - **Detecta patrones, no versiones.** La versión de Angular solo sirve para interpretar valores por defecto (standalone implícito desde v19, OnPush por defecto en v22). **Nunca usa nombres de proyectos concretos**: lo propio de cada repo entra por `.ao/config.json`.
2. **`/ao:init`** (prompt del agente): lee el índice, abre solo los archivos clave y escribe la documentación. Cuando una convención está dividida (la minoría es ≥ 30 %), pregunta al equipo cuál seguir en código nuevo, mostrando conteos y ejemplos de cada lado, y deja la respuesta en conventions.md. Si nadie responde (ejecución sin usuario presente), la convención queda como "pendiente de confirmar" con ambas opciones y su evidencia; nunca se inventa la respuesta. Los overrides de `conventions` en `.ao/config.json` evitan la pregunta y aparecen como "decisión del equipo" junto con el % observado.

### Qué genera en el proyecto

```
AGENTS.md                      ← fuente canónica (Codex y agy la leen)
CLAUDE.md                      ← @AGENTS.md + lo específico de Claude
.ao/
  config.json                  ← opcional, lo escribe el equipo: prefijos propios de UI, globs a ignorar, carpetas de showcase,
                                 deprecated (legacy: nunca es ejemplo, va a recommendations.md) y conventions (overrides del equipo)
  index.json                   ← salida del escáner
  conventions.md               ← "así se trabaja aquí" + evidencia (%, rutas)
  catalog.md                   ← intención → componente ("select con búsqueda" → mimi-select + …)
  components/<nombre>.md       ← una ficha por componente compartido (reemplaza el showcase)
  patterns/<necesidad>.md      ← "cómo se hace X aquí": forma del proyecto, 1–2 ejemplos reales, no hacer, excepciones
  recipes/listado.md, crear-editar.md, detalle.md, modal.md
  recommendations.md           ← mejoras sugeridas, priorizadas, que NO se aplican solas
.claude/skills/ao-project/SKILL.md (+ espejo para los otros agentes)
```

### Ficha de componente (ejemplo con fixtures/ng17-wrappers)

```md
---
selector: mimi-select
source: src/app/shared/components/ui/mimi-select/
wraps: nz-select
hash: …
---
## Uso en este proyecto
Nunca uses nz-select suelto. Siempre envuélvelo:
<mimi-select>
  <nz-select inputEffectDirective mimi-select mimiType="outline"
    [nzOptionHeightPx]="42" [nzOptionOverflowSize]="10"
    [ngClass]="{ 'input-error': ctrl.invalid && ctrl.dirty, fill: ctrl.value }">
## Visto en: pages/solicitudes, pages/pagos (+N)
## No hacer: estilos de .ant-select en el componente de la página
```

### Patrones por necesidad

Los componentes no son lo único que el agente reinventa: también abre modales, muestra errores o llama a la API "a su manera". Para cada **necesidad** el escáner reporta la forma dominante del proyecto (`approach`), la fachada si existe, la evidencia y las excepciones; `/ao:init` lo convierte en `.ao/patterns/<necesidad>.md`.

**Fachada.** Servicio propio que inyecta un servicio de librería (`NzModalService`, `MatDialog`, `HttpClient`, `NzMessageService`, `MatSnackBar`…) y que el resto del código usa más que el servicio de librería directo. Es "la forma oficial" del proyecto para esa necesidad. Se aplica el mismo criterio de evidencia que a los wrappers: archivos y conteos (`ConfirmService en 6 archivos; NzModalService directo en 1: pages/x`), y los usos directos se listan como excepciones. Un servicio de datos que solo envuelve `HttpClient` para un recurso no es fachada; sí lo es una clase base o un servicio genérico de API.

Necesidades, en orden de prioridad:

1. **Iconos**: librería, registro (`provideNzIcons`, `MatIconRegistry`) y sintaxis de uso.
2. **Modales**: fachada o directo, paso de datos y cierre con resultado.
3. **Notificaciones/errores**: servicio de mensajes, interceptor de errores y cómo suprimirlo en una llamada.
4. **Formularios**: reactive tipados o no, Signal Forms, template-driven, `FormBuilder` frente a `new`, validadores propios, layout de campos y carga de catálogos.
5. **API**: `HttpClient` directo, clase base o `httpResource`; origen de la URL; wrapper de respuesta y cómo se desempaqueta; interceptores; `HttpContext`; ubicación de los modelos.
6. Después: estado, auth/guards, tablas-filtros-paginación, estilos (dónde se sobrescribe la librería) y entornos.

Ejemplo de `.ao/patterns/modales.md` (con la fachada que agrega 2.6 en ng21-ao):

```md
## Modales en este proyecto
Usa ConfirmService (src/app/shared/services/confirm.service.ts), no NzModalService directo.
Visto en: pages/proveedores/detalle, pages/proveedores/listado
const ok = await this.confirm.ask({ titulo: '¿Eliminar?', mensaje: … });
## No hacer: inyectar NzModalService en una página
## Excepciones: pages/ejemplos (1 uso directo)
```

#### Matriz de cobertura de fixtures

✔ forma propia o fachada · ● uso directo de la librería · — sin cobertura · **2.6** se agrega en esa tarea.

| Necesidad | ng12-modules | ng17-wrappers | ng21-ao | ng-multi | ng22-modern |
|---|---|---|---|---|---|
| Iconos | ● `mat-icon` con ligaduras | — → **2.6** `provideNzIcons` | ● lucide-angular `[img]` | — | ✔ `@lucide/angular`, directivas importadas por componente (`<svg lucidePlus>`) |
| Modales | ● `MatDialog` + `MAT_DIALOG_DATA` + `afterClosed` | — | ● `nz-popconfirm`; ✔ `ConfirmService` → **2.6** | ● `prompt()` (antipatrón) | — |
| Notificaciones/errores | interceptor de auth (sin errores) | — → **2.6** interceptor de errores + `NotificacionesService` + `HttpContextToken` | — | — | ✔ fachada `Notificaciones` (`@Service`) sobre `MatSnackBar` en 3 sitios, 1 excepción directa; sin interceptor de errores ("no detectado") |
| Formularios | ● reactive sin tipar, `FormBuilder` + `new FormControl`; ✔ layout `app-field` | ● reactive tipados (`nonNullable`), `ngModel` en reportes, catálogos por servicio; ✔ layout `mimi-*`; validador propio → **2.6** | ● reactive tipados, layout `nz-form-item` | — | ● Signal Forms (`form`, `[formField]`, `submit`); ✔ validador propio `fechaFutura`; layout `mat-form-field` |
| API | ● `HttpClient` + `environment`; ✔ clase base + wrapper `{ data }` → **2.6** | ● `HttpClient` + `environment.apiUrl`, modelos en el servicio | ● `HttpClient`, URL constante, modelos en `data-access/` | ● `HttpClient`, URL constante | ● `httpResource` para lecturas (mayoría) + `HttpClient` para escrituras; URL por `InjectionToken` `API_URL` |
| Estado | — | — → **2.6** `signalStore` | signals locales + `rxResource` | — | ✔ `TareasStore` con signals (`@Service`, sin NgRx) |
| Auth/guards | guard de clase + interceptor de auth | guard funcional con `inject()` | — | — | — |
| Tablas | ● `mat-table` + filtro en cliente | — | ✔ `custom-table` (paginación en cliente); servidor → **2.6** | — | — |
| Estilos | `::ng-deep .mat-*` en `app-field`/`app-card` + tema SCSS | `::ng-deep .ant-*` solo en los wrappers | `theme.less` + Tailwind `@theme` | CSS por componente | tema `mat.theme` (Material 22) + variables CSS |
| Entornos | `environment` + `fileReplacements` | `environment.ts` sin reemplazos | — (URLs constantes) | — | — (URL por `InjectionToken`) |

### Regla de capas (lo que resuelve el proyecto A frente al proyecto B)

**Lo observado en el proyecto gana sobre el perfil.** angular-ao pasa a ser un *perfil recomendado*, `profiles/angular-modern`, no una regla. Cada regla del perfil declara su versión mínima de Angular (por ejemplo, `input()` ≥ 17.1, `@if` ≥ 17, Signal Forms ≥ 22) y solo se recomienda si el repo la cumple. El perfil solo se usa para `recommendations.md` y para código donde el proyecto no tiene un patrón propio. Así sirve el mismo instalador en el proyecto A y en el proyecto B.

### Niveles de soporte

| Nivel | Versiones | Qué significa |
|---|---|---|
| **1 — con fixture** | Angular 12, 17, 21 y 22 | Hay un fixture sintético con `expected.json` y tests de cada detector; un fallo bloquea el release. |
| **2 — best effort** | Angular 2 a 22 | Los detectores funcionan por patrones, así que deberían servir; se prueba con el corpus de repos públicos (`pnpm corpus`), sin garantía. Los fallos quedan en `warnings[]`. |
| **Fuera de alcance** | AngularJS 1.x | Es otro framework (sin decoradores ni templates de Angular); no se escanea. |

Fixtures de nivel 1: `ng12-modules` (NgModules + Material), `ng17-wrappers` (standalone con APIs viejas + wrappers), `ng21-ao` (signals + showcase), `ng22-modern` (Signal Forms, httpResource, OnPush por defecto) y `ng-multi` (varios proyectos + librería interna). Pendientes en el backlog: Ionic, PrimeNG y Nx.

### Alternativas

| Opción | Ventaja | Problema |
|---|---|---|
| A. Solo prompts (el agente lee todo) | Se arma en un día | Gasta muchos tokens, cada corrida da un resultado distinto y en repos grandes se salta cosas |
| **B. Escáner + prompt (recomendada)** | Preciso, incremental y funciona igual en todos los agentes | Hay que escribir un escáner por framework |
| C. B + servidor MCP (`ao.find_component`, `ao.get_card`) | Consultas puntuales durante /ao:view sin cargar todo el contexto | Más infraestructura; mejor dejarlo para la fase 4 |

### Comandos en cada agente (hay que verificar al desarrollar, estas APIs cambian)

- Claude Code: un plugin llamado `ao` con `commands/init.md` → `/ao:init`.
- Gemini CLI: `.gemini/commands/ao/init.toml` → `/ao:init`.
- Codex: custom prompts → algo como `/ao-init` (no tiene namespace con `:`).
- Antigravity: workflows `.agent/workflows/ao-init.md` → `/ao-init`.
- Se escribe **una sola fuente** de cada comando en markdown y el instalador (`npx ao-kit install --agents claude,codex,agy`) la traduce al formato de cada agente.

### Proyecto B: /ejemplos

- Pasar las secciones del showcase a `.ao/components/*.md` con el código de ejemplo dentro del md.
- Para el ejemplo CRUD, apuntar las recetas a un feature real y "dorado" (como `pages/proveedores` en ng21-ao) en lugar de mantener una copia; otra opción es dejarlo como una ruta solo de desarrollo, excluida del build de producción.

### Mantener la documentación al día

- `/ao:sync`: vuelve a escanear y solo regenera las fichas cuyo hash cambió.
- `ao scan --check` en un hook de pre-commit o en CI: avisa cuando hay fichas desactualizadas.

## 3. Comandos futuros

- **/ao:view <prompt | link de Figma>**: (1) interpreta la petición (Figma vía MCP: nodos → componentes y tokens); (2) consulta `catalog.md`; (3) presenta un **plan de reutilización** ("uso page-header, custom-table y quick-search; nuevo: X, por esta razón") y espera confirmación si hay algo nuevo; (4) genera siguiendo la receta; (5) se revisa con /ao:review; (6) crea la ficha si nació un componente nuevo.
- /ao:component: crea un componente compartido junto con su ficha.
- /ao:review: revisa el diff contra conventions.md y el catálogo (detecta duplicados de componentes que ya existen).
- /ao:explain <feature>: explica el flujo de un feature (rutas → componente → servicio → endpoint).
- /ao:migrate <regla>: aplica una recomendación de forma controlada (por ejemplo @Input → input()).
- /ao:api: genera servicios a partir del OpenAPI (por ejemplo, `localhost:8000/openapi.json` en el proyecto B).

## 4. Plan de acción

0. **Validar a mano (1–2 días):** escribir a mano conventions.md, catalog.md, 3 fichas y `patterns/modales.md` + `patterns/api.md` para el proyecto A y para el proyecto B. Probar en Claude Code con 3 tareas reales antes y después, midiendo cuántos componentes reutiliza frente a cuántos crea, cuántos archivos lee y cuántas correcciones necesitas hacerle. Si no mejora, ajustar el formato antes de programar nada.
1. **Congelar los formatos:** esquema de index.json (con `kind` por componente), `.ao/config.json`, plantilla de ficha, conventions.md y recipes.
2. **Escáner Angular:** ts-morph + `@angular/compiler` (parseTemplate) para templates; clasificación wrapper / slot-container / component, NgModules, conteo de usos, estadísticas de convenciones, fachadas y patrones por necesidad. Se valida contra los fixtures de nivel 1 (cada uno con su `expected.json`) y contra el corpus de repos públicos (`pnpm corpus`, en `.corpus/`, sin commitear nada).
3. **/ao:init + adaptador de Claude Code** (plugin). Reorganizar angular-ao como `profiles/angular-modern`, con versión mínima por regla, corrigiendo la contradicción lucide/ng-icons y uniendo shared-components y styling.
4. **Adaptadores para Codex, agy y Gemini + /ao:sync + check de CI.**
5. **/ao:view + Figma MCP**, y opcionalmente un MCP propio del catálogo.
6. **Escáneres para React** (babel/ts: componentes, props, librería de UI) **y Vue** (@vue/compiler-sfc).
