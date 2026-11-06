---
name: view
description: Crea una vista (pantalla, sección o feature) a partir de una descripción o un link de Figma, reutilizando los componentes, patrones y recetas documentados en .ao/. Primero muestra el plan de reutilización y solo pregunta si hay que crear algo nuevo.
argument-hint: <descripción de la vista | link de Figma>
disable-model-invocation: true
---
<!-- Generado por @ao-kit/adapters desde agent/commands y agent/templates. No lo edites a mano: corre pnpm build. -->

# /ao:view — vista nueva que reutiliza lo que ya existe

Petición: **$ARGUMENTS** (si aquí no aparece una petición, es lo que pidió el usuario en su mensaje; si no pidió nada concreto, pregúntale qué vista quiere).

Vas a construir esa vista **como la haría alguien del equipo**: con los componentes, wrappers, fachadas y la estructura que el repo ya usa, documentados en `.ao/`. Escribes en español.

- Plantillas (para fichas y filas del catálogo nuevas): en «Anexo: plantillas», al final de este archivo.
- Versión de ao-kit para la cabecera de lo que generes en `.ao/`: `0.0.0`.

## Reglas que no se negocian

1. **Reutilizar antes que crear.** Un componente, servicio o utilidad nuevo solo nace si el catálogo, las fichas y una búsqueda en el repo confirman que no existe nada que cubra esa intención.
2. **Lo observado manda.** Se sigue `.ao/conventions.md` (o la "Decisión del equipo" si la hay), nunca una guía genérica ni `.ao/recommendations.md`: las recomendaciones no se aplican solas.
3. **Nunca como ejemplo**: el showcase, lo que esté en "Heredado sin uso" o "Legacy" y el código de `deprecated`. Si la única referencia de algo es de ahí, dilo y pregunta.
4. **Contratos completos.** Cada wrapper se usa con todas las piezas obligatorias de su "Contrato observado". Los atributos marcados **inertes** no se copian.
5. Tocas solo los archivos de la vista (y la ruta que la registra). No refactorizas ni "mejoras" código existente, no cambias componentes compartidos salvo que el plan lo diga, y no instalas dependencias.

## Paso 0 — Leer el contexto

1. Si no existe `.ao/conventions.md` o `.ao/catalog.md`, **detente**: pide correr `/ao:init` primero y no escribas nada.
2. Lee `.ao/conventions.md`, `.ao/catalog.md`, la sección "Posibles problemas" de `.ao/recommendations.md` y, si existe, `.ao/config.json` (overrides de `conventions`, `showcase`, `deprecated`).
3. Según la petición, lee las fichas (`.ao/components/<selector>.md`) de los componentes que vas a usar, los patrones que aplican (`.ao/patterns/`: api, modales, formularios, notificaciones, tablas…) y la receta del tipo de vista (`.ao/recipes/listado.md`, `crear-editar.md`, `detalle.md`, `modal.md`), con su **plantilla dorada**.
4. Abre los archivos de la plantilla dorada: son el molde de estructura, nombres, inyección, inputs, control flow y estilos.

### Si la petición es un link de Figma
- Si tienes las herramientas del MCP de Figma (y la skill de Figma para pasar diseño a código, si está), úsalas para leer el nodo del link: estructura, textos, componentes y tokens. Traduce cada parte del diseño a una **intención** ("cabecera con título y acción", "tabla paginada", "select con búsqueda") y búscala en el catálogo. El diseño es una referencia: los componentes y tokens son los del proyecto, no se copian estilos sueltos del diseño si hay un token o un componente equivalente.
- Si no tienes el MCP de Figma, pide una captura de la pantalla (o una descripción). Si no hay nadie para responder, detente y dilo en el reporte.

## Fase 1 — Plan de reutilización

Arma el plan **antes de escribir código**:

| Parte de la vista | Usar | Fuente |
|---|---|---|
| Cabecera con título y botón "Nuevo" | `app-page-header` (slot de acciones) | `.ao/components/app-page-header.md` |
| Llamadas a la API | servicio en `data-access/` con la forma del proyecto | `.ao/patterns/api.md` |
| Estructura de la feature | receta listado, plantilla dorada `src/app/pages/<feature>/` | `.ao/recipes/listado.md` |
| **Nuevo:** <pieza> | <dónde va: local a la feature o compartido> | <por qué no sirve nada existente: qué buscaste> |

- Cada fila apunta a la ruta de su ficha, patrón o receta. Si algo no tiene ficha pero existe en el código (lo encontraste con Grep), cita su archivo.
- Antes de marcar algo como **Nuevo**, búscalo: en el catálogo (incluida "No hay (todavía)") y en el repo con Grep por nombre e intención. Lo nuevo va **local a la feature** salvo que haga falta en más de un sitio.
- **Si todo existe**, muestra el plan y sigue sin preguntar.
- **Si hay algo nuevo**, muestra el plan y pregunta **una sola vez** si lo apruebas (con la herramienta de preguntas si la tienes). Si no hay nadie para responder, sigue con el plan, crea lo nuevo local a la feature (nunca compartido) y márcalo como pendiente en el reporte.

## Fase 2 — Generar

1. Sigue el **paso a paso de la receta** y copia la forma de la plantilla dorada: carpetas, nombres de archivo, rutas (`loadChildren`/`loadComponent` como las demás), modelo y servicio según `patterns/api.md`, y cómo se conectan página, servicio y componentes.
2. Usa cada componente como dice su ficha: inputs y outputs reales, slots, y en los wrappers **todas** las piezas obligatorias del contrato, sin los atributos inertes. Nunca uses suelto el elemento que un wrapper envuelve.
3. Modales, notificaciones, formularios, íconos y API con la forma de su patrón (la fachada, si la hay; nunca el servicio de la librería directo cuando existe fachada).
4. Convenciones: las de conventions.md o la "Decisión del equipo". Si una convención está "Pendiente de confirmar", sigue la forma de la plantilla dorada y dilo en el reporte.
5. Datos que la petición no da (endpoint, campos del modelo, textos): toma lo que haya en el repo; si no hay, usa un valor razonable, nómbralo igual que el resto del código y anótalo en el reporte como supuesto.
6. **Componente compartido nuevo** (solo si el plan lo aprobó): créalo como los demás compartidos y documéntalo: escribe `.ao/components/<selector>.md` con la plantilla `card.md` (frontmatter con `generatedBy: prompt`, `hash: null` y `usedIn` con sus usos reales) y agrega su fila en el grupo que corresponda de `.ao/catalog.md`, enlazando `(components/<selector>.md)`. Si existe el CLI, corre `ao validate .ao` (o `npx --no-install ao validate .ao`) y corrige hasta que pase.

## Fase 3 — Autorrevisión

Revisa lo que escribiste contra esta lista y corrige antes de terminar:

- [ ] Ningún componente, servicio o utilidad duplica algo del catálogo o del repo (mismo propósito con otro nombre).
- [ ] Ningún elemento de librería suelto donde hay wrapper; ningún servicio de librería directo donde hay fachada.
- [ ] Cada wrapper lleva todas las piezas obligatorias de su contrato y ningún atributo inerte.
- [ ] Nada copiado del showcase, de "Heredado sin uso", "Legacy" ni `deprecated`.
- [ ] Convenciones observadas (o decisión del equipo) en inyección, inputs/outputs, control flow, change detection, nombres de archivo y estilos; las sobrescrituras de la librería solo donde el repo las pone.
- [ ] Cada componente usado está importado donde corresponde (`imports` del componente standalone o el NgModule que lo declara).
- [ ] Ningún patrón de "Posibles problemas" de recommendations.md repetido en el código nuevo.
- Si el proyecto tiene sus dependencias instaladas, compila lo que tocaste con su propio comando (por ejemplo `npx ng build` o `npx ngc -p tsconfig.app.json --noEmit`) y corrige los errores. Si no puedes compilar, dilo.

## Reporte (breve, en el chat)

- El plan de reutilización final (la tabla).
- Archivos creados y modificados.
- Lo nuevo y por qué; si se creó un compartido, su ficha y su fila del catálogo.
- Supuestos (endpoint, campos, textos) y convenciones pendientes que seguiste por la plantilla dorada.
- Resultado de la autorrevisión y de la compilación (o por qué no se compiló).

## Anexo: plantillas

Formato de salida. Cada plantilla va entera entre las vallas; no copies las vallas al archivo que escribas.

### `card.md`

````markdown
---
# ao: frontmatter de la ficha (esquema CardFrontmatter de core). Lo escribe /ao:init; /ao:sync compara el hash. Solo YAML plano: sin tags, anclas ni "---js".
schemaVersion: 1
id: <components[].id del índice, "<ruta>#<Clase>">
selector: mimi-select
source: src/app/shared/components/ui/mimi-select/
kind: wrapper            # wrapper | slot-container | component
wraps: nz-select         # solo si kind: wrapper; si no, null
generatedBy: scan        # scan (desde index.json) | prompt (sin índice: el agente analizó el repo)
hash: <hash del componente en index.json; null con generatedBy: prompt>
usedIn: 3                # usos reales (sin showcase ni deprecated); con prompt, los cuenta el agente
---

# mimi-select

Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>

<!-- ao: no se generan fichas de componentes kind "unused". Secciones en este orden; "Qué envuelve" y "Contrato observado" solo para kind wrapper. -->

| | |
|---|---|
| Archivo | `src/app/shared/components/ui/mimi-select/mimi-select.component.ts` |
| Import | `import { MimiSelectComponent } from '<alias o ruta relativa>';` <!-- ao: o el NgModule que lo exporta --> |
| Usos | 3 en 3 archivos: `pages/pagos` 1 · `pages/perfil` 1 · `pages/solicitudes` 1 |

## Qué envuelve

Envuelve `nz-select` de ng-zorro-antd. Es wrapper porque cumple los 3 criterios:
- (a) proyecta `nz-select` en 3 de 3 usos;
- (b) sus estilos sobrescriben `.ant-select` (`mimi-select.component.scss:13`);
- (c) el `nz-select` proyectado lleva el atributo `mimi-select` (3 de 3).

Nunca uses `nz-select` suelto en una página: va siempre dentro de `mimi-select`.

## API

<!-- ao: inputs, outputs y slots del componente. "Uso real" es un valor que aparece en el repo, con archivo:línea. -->

| Input / output / slot | Tipo | Default | Uso real |
|---|---|---|---|
| slot por defecto | `nz-select` con `mimi-select` | — | ver "Usos reales" |

No tiene inputs ni outputs: la configuración va en el `nz-select` proyectado (ver "Contrato observado"). <!-- ao: si los tiene, una fila por input/output con su tipo, default y un valor real con archivo:línea -->



## Contrato observado

<!-- ao: solo kind wrapper. Sale de index.components[].contract: cada pieza (atributo o directiva del elemento proyectado, binding, elemento hermano) con su presencia sobre todos los usos reales. Obligatoria = presente en todos. Si una pieza es un atributo inerte (index.inertAttributes), se marca así. -->

Lo que llevan todos los usos reales (3). Copia las obligatorias tal cual.

| Pieza | Dónde | Obligatoria | Presencia |
|---|---|---|---|
| `mimi-select` | atributo en `nz-select` | sí | 3/3 |
| `inputEffectDirective` | directiva en `nz-select` | sí | 3/3 |
| `mimiType="outline"` | directiva en `nz-select` | sí | 3/3 |
| `formControlName` | directiva en `nz-select` | sí | 3/3 |
| `[nzOptionHeightPx]="42"` | binding en `nz-select` | sí | 3/3 |
| `[ngClass]="{ 'input-error': …, fill: … }"` | binding en `nz-select` | sí | 3/3 |
| `nzShowSearch` | atributo en `nz-select` | no | 2/3 |
| `appAutoFocus` | atributo en `nz-select` | no — **inerte**: se escribe, no tiene efecto | 1/3 |

## Usos reales

<!-- ao: 2–3 usos de index.usages[].representative, con archivo:línea y el snippet completo (atributos y directivas incluidos). Nunca del showcase. -->

`src/app/pages/pagos/pagos.component.html:5`
```html
<mimi-select>
  <nz-select
    mimi-select
    inputEffectDirective
    mimiType="outline"
    formControlName="banco"
    nzShowSearch
    nzPlaceHolder="Selecciona tu banco"
    [nzOptionHeightPx]="42"
    [nzOptionOverflowSize]="10"
    [ngClass]="{ 'input-error': form.controls.banco.invalid && form.controls.banco.dirty, fill: form.controls.banco.value }"
  >
    …
  </nz-select>
</mimi-select>
```

## Qué hacer

- Usa `mimi-select` para cualquier select del formulario, con todas las piezas obligatorias del contrato.
- Para búsqueda, agrega `nzShowSearch` (como en `pages/pagos/pagos.component.html:11`).

## Qué no hacer

- No uses `nz-select` sin `mimi-select` (0 usos así en el repo).
- No escribas estilos de `.ant-select` en el SCSS de la página: van solo en el wrapper.
- No copies `appAutoFocus`: no hay directiva con ese selector en el repo.
````

### `catalog.md`

````markdown
# Catálogo de componentes

Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>

<!-- ao: intención → qué usar. Una tabla por grupo; se omiten los grupos sin componentes. "Usos" sale de index.usages (sin showcase). "Referencia real" es un archivo:línea de un uso real, nunca del showcase ni de código unused/deprecated. Si no hay componente propio y se usa la librería directo, va igual, con la librería en "Usar". -->

Antes de crear un componente, busca aquí la intención. Si no está, mira "No hay (todavía)".

## Estructura de página

| Intención | Usar | Usos | Referencia real |
|---|---|---|---|
| Cabecera de página con título y acciones | [`page-header`](components/page-header.md) | 6 | `src/app/pages/proveedores/listado/listado.html:1` |

## Datos

| Intención | Usar | Usos | Referencia real |
|---|---|---|---|
| Tabla con paginación en servidor | [`custom-table`](components/custom-table.md) con `[serverPaging]="true"` | 3 | `src/app/pages/proveedores/listado/listado.html:12` |

## Filtros y búsqueda

| Intención | Usar | Usos | Referencia real |
|---|---|---|---|
| Select con búsqueda | [`mimi-select`](components/mimi-select.md) + `nz-select nzShowSearch` | 2 | `src/app/pages/pagos/pagos.component.html:5` |

## Carga y vacío

| Intención | Usar | Usos | Referencia real |
|---|---|---|---|

## Formularios

| Intención | Usar | Usos | Referencia real |
|---|---|---|---|
| Campo de texto con estilos del proyecto | [`mimi-input`](components/mimi-input.md) + `input nz-input` | 5 | `src/app/pages/perfil/perfil.component.html:12` |

## Diálogos

| Intención | Usar | Usos | Referencia real |
|---|---|---|---|
| Confirmar una acción | `ConfirmService.confirmar()` (ver [patterns/modales.md](patterns/modales.md)) | 2 | `src/app/pages/proveedores/detalle/detalle.ts:31` |

## Íconos

| Intención | Usar | Usos | Referencia real |
|---|---|---|---|
| Ícono en un botón | `<span nz-icon nzType="…">` (ver [patterns/iconos.md](patterns/iconos.md)) | 9 | `src/app/pages/solicitudes/solicitudes.component.html:30` |

## Legacy

<!-- ao: componentes kind "unused" o en deprecated. Siempre tachados y con el reemplazo si existe. Los "exported-not-consumed" no son legacy: van en su grupo con 0 usos. -->

| Componente | Archivo | Usos | En su lugar |
|---|---|---|---|
| ~~`mimi-old-table`~~ | `src/app/shared/components/old-table/` | 0 | `custom-table` |

## No hay (todavía)

<!-- ao: va siempre. Intenciones habituales sin componente propio ni uso de la librería en el repo (p. ej. a partir de lo que pide una receta). Nunca se inventa un componente; se dice qué usar mientras tanto. -->

| Intención | Mientras tanto |
|---|---|
| Estado vacío de una lista | no hay componente; cada página escribe su mensaje (`src/app/pages/pagos/pagos.component.html:40`). Si hace falta en más de un sitio, propón crear uno con /ao:component |
````
