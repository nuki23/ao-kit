---
name: init
description: Analiza este repo Angular y escribe el contexto del proyecto en .ao/ (convenciones, catálogo, fichas de componentes, patrones, recetas y recomendaciones), con evidencia archivo:línea. Agrega la sección de ao-kit en AGENTS.md y el import en CLAUDE.md.
argument-hint: "[carpeta del repo]"
disable-model-invocation: true
---
<!-- Generado por @ao-kit/adapters desde agent/commands y agent/templates. No lo edites a mano: corre pnpm build. -->

# /ao:init — contexto del proyecto en `.ao/`

Vas a documentar **cómo se trabaja en este repo**, a partir de su código, para que un agente de código reutilice lo que ya existe en lugar de reinventarlo. Escribes en español.

- Raíz del repo: `$ARGUMENTS` si es una carpeta del repo; si no (o si ese texto no se reemplazó), el directorio actual.
- Plantillas: en «Anexo: plantillas», al final de este archivo (`README.md` con las reglas comunes, `conventions.md`, `catalog.md`, `card.md`, `pattern.md`, `recipe.md` y `recommendations.md`). Léelas **todas** antes de escribir; son el formato de salida. No las busques en otro sitio.
- Versión de ao-kit para la cabecera: `0.0.0`.

## Reglas que no se negocian

1. **Solo escribes** en `.ao/` (salvo `.ao/config.json` e `.ao/index.json`, que nunca tocas), en `AGENTS.md` y en `CLAUDE.md` de la raíz. Nunca modificas código, estilos, `package.json`, configuración ni otros documentos del proyecto. No instalas dependencias ni compilas.
2. **Lo observado gana sobre lo recomendado.** Describe lo que el repo hace. Lo que tú (o un perfil moderno de Angular) recomendarías va solo en "Recomendado" de conventions.md (con "en código nuevo" y la versión mínima de Angular) y en recommendations.md. Nunca escribas en fichas, patrones ni recetas una forma que el repo no usa. Ejemplo: si el repo usa `@Input()` y constructor, las fichas usan `@Input()` y constructor, aunque `input()` e `inject()` sean más modernos.
3. **Toda afirmación lleva evidencia**: `archivo:línea` relativo a la raíz y conteos (`usado en 4 archivos: pages/pagos/…`). Cada número que escribas lo contaste tú con Grep/Glob o lo leíste del índice; si no lo contaste, no lo escribas. Nada de "casi todos", "normalmente" ni porcentajes sin los conteos al lado.
4. **Excepciones con nombre**: "todas usan X salvo `features/a/b.ts:41`".
5. **El código manda sobre los documentos.** CLAUDE.md, AGENTS.md, README, skills (`.claude/skills/`, `.agent/`, `.agents/`, `.gemini/`, `.cursor/`) y comentarios son evidencia a contrastar, no verdad. Lo que contradiga al código va a "Contradicciones"; nunca se copia a conventions.md ni a las fichas sin verificarlo.
6. **Nunca como ejemplo**: el showcase, lo de `deprecated` y el código sin uso. No cuentan en los conteos de uso, no son "Referencia real", "Usos reales", "Ejemplos reales" ni "Plantilla dorada". Solo aparecen en "Heredado sin uso" (conventions.md) y "Legacy" (catalog.md).
7. **No inventes.** Si una necesidad, receta o sección no tiene evidencia, se omite (o va a "No detectado" / "No hay (todavía)" cuando la plantilla lo pide).

## Paso 1 — Preparar

1. **Fecha y rama** para la cabecera: fecha de hoy (AAAA-MM-DD) y `git rev-parse --abbrev-ref HEAD` (si no es un repo git, la cabecera omite "sobre <rama>").
2. **`.ao/config.json`** (opcional, lo escribe el equipo). Si existe, léelo; si no es JSON válido, dilo en el reporte final y sigue sin él. Campos que se respetan:
   - `uiPrefixes`: prefijos propios de librerías de UI, que se suman a `nz-` (ng-zorro), `mat-` (Angular Material), `p-` (PrimeNG) e `ion-` (Ionic);
   - `ignore`: globs que no se analizan;
   - `showcase`: rutas o carpetas de showcase (sus usos no cuentan);
   - `deprecated`: globs legacy (nunca son ejemplo; sus patrones van a recommendations.md como migración);
   - `conventions`: decisiones del equipo que fuerzan una forma aunque no sea mayoría (p. ej. `{ "inputs": "signal" }`). No se pregunta por ellas; en conventions.md van como "Decisión del equipo" junto con los conteos observados.
3. **Modo de trabajo.**
   - **Modo índice**: existe `.ao/index.json`, es JSON válido, tiene `schemaVersion: 1` y las claves `components`, `usages` y `conventions`. Úsalo como fuente de conteos, `kind`, contratos, `unused`, `inertAttributes`, `possibleIssues`, `docDrift`, `patterns` y `notDetected`; abre solo los archivos que cita para sacar snippets. Las fichas llevan `generatedBy: scan`, `hash` = `components[].hash` y `usedIn` del índice.
   - **Modo prompt** (no hay índice, o no es válido: dilo en el reporte): analizas el repo tú mismo (paso 2). Las fichas llevan `generatedBy: prompt`, `hash: null` y `usedIn` contado por ti. Nunca escribes `index.json`.
4. **Documentos del repo**: lee CLAUDE.md, AGENTS.md, README y las skills o reglas de agentes que existan (salvo las de ao-kit: `ao-init`, `ao-view` y el bloque `ao-kit` de AGENTS.md, que son tuyos). Anota cada afirmación verificable (rutas, nombres de exports, firmas, cómo se registran los íconos, rutas de la app, convenciones) para contrastarla en el paso 2.
5. **Salida anterior**: si ya existe `.ao/`, vas a regenerar sus archivos. Conserva las "Decisión del equipo" que ya estén en `.ao/conventions.md` (son respuestas del equipo) y no borres archivos de `.ao/` que no generes tú.

## Paso 2 — Analizar (modo prompt; en modo índice, verifica con el código lo que vayas a citar)

Trabaja con Glob, Grep y Read. En repos grandes no leas todo: inventaría con Glob/Grep y lee completos solo los componentes compartidos, los servicios transversales y 1–2 features representativas por tipo.

### 2.1 Stack y estructura
- `package.json`: versión de Angular, librería de UI y su versión, íconos, estado (NgRx, signals…), estilos (scss/less/css, Tailwind), tests.
- `angular.json` (o `project.json` en Nx): proyectos (application/library), `sourceRoot`, `prefix`, builder. `tsconfig*.json`: aliases de `paths`.
- Estructura: `standalone`, `ngmodule` o `mixed`. **La versión solo interpreta valores por defecto**, no decide patrones: desde Angular 19 un componente sin `standalone` es standalone; desde 22, sin `changeDetection` es OnPush.

### 2.2 Showcase, deprecated e ignorados
Además de lo que diga la config, una ruta o carpeta es **showcase** si su página solo muestra componentes compartidos con datos de ejemplo (nombres típicos: `ejemplos`, `showcase`, `demo`, `playground`, `kitchen-sink`, `styleguide`). Dilo en la cabecera (`conteos excluyen: showcase (src/app/pages/ejemplos/)`). Lo mismo con `deprecated`.

### 2.3 Componentes y usos
1. Inventario de cada `@Component` (y directivas y pipes propios): selector, clase, archivo, standalone, inputs/outputs (`@Input`/`input()`, `@Output`/`output()`), template (inline o `templateUrl`), si tiene `<ng-content>`.
2. **Usos reales** por selector: elementos `<selector` (y atributos, para directivas) en todos los templates, inline y `.html`, **fuera** del showcase, deprecated e ignorados. Anota el total, la distribución por archivo y 2–3 usos representativos con `archivo:línea`. Cuenta aparte los usos del showcase (no se publican como uso).
3. **Componentes compartidos** (tienen ficha): los de carpetas `shared/`, `ui/`, `components/` comunes o librerías del workspace, y cualquiera usado desde ≥ 2 features. Las páginas enrutadas no tienen ficha.
4. **`kind`** de cada compartido:
   - **wrapper** de X si cumple **≥ 2** de: (a) lo proyectado es el mismo elemento de una librería de UI (X, por prefijo) en ≥ 80 % de sus usos reales; (b) sus estilos sobrescriben clases de esa librería (`::ng-deep .ant-*`, `.mat-*`…); (c) el elemento proyectado lleva un atributo con el mismo nombre del wrapper (`<mimi-select><nz-select mimi-select>`). `wraps: X`. Di en la ficha qué criterios cumple, con evidencia.
   - **slot-container** si proyecta contenido variado (p. ej. una cabecera que recibe botones distintos en cada página).
   - **component** en el resto.
   - **unused** si tiene 0 usos reales (incluye "solo en el showcase" y "solo en deprecated"). Sin ficha; va a "Heredado sin uso" y "Legacy". Excepción: lo que exporta el public-api de una librería y nadie consume en el workspace no es código muerto: va en su grupo del catálogo con 0 usos, sin ficha.
5. **Contrato observado** de cada wrapper: por cada pieza que aparece en sus usos reales (atributo o directiva del elemento proyectado, binding, elemento hermano como un `label`), cuenta en cuántos usos está (`presente/total`). Es obligatoria si está en todos. Los usos del showcase y deprecated no cuentan.
6. **Atributos inertes**: atributos con forma de directiva (`appX`, `xDirective`, camelCase que no es atributo HTML ni input del componente, o prefijo propio de la config) que (1) coinciden con el selector de una directiva del repo que ese componente no importa (standalone) o que su módulo no ve (NgModules), o (2) no coinciden con ningún selector del repo, de las librerías instaladas ni de Angular. Verifícalo con Grep antes de afirmarlo. Nunca son inertes los atributos HTML estándar, `aria-*`, `data-*` ni los inputs del componente. En el contrato se marcan "**inerte**: se escribe, no tiene efecto" y van a recommendations.md.

### 2.4 Convenciones
Cuenta **archivos** por forma, separando por proyecto si hay varios: standalone/NgModule; `@Input()` frente a `input()`; `@Output()` frente a `output()`; constructor frente a `inject()`; `*ngIf`/`*ngFor` frente a `@if`/`@for`; change detection; nombres de archivo (`x.component.ts` frente a `x.ts`); estructura de carpetas de features; dónde se sobrescriben los estilos de la librería; tokens (variables CSS, `@theme`, less/scss).

Para cada convención con dos formas, con `total` = archivos que usan alguna y `minoría` = total − la forma mayoritaria:
- **dividida** si la minoría es ≥ 30 % del total (o hay empate) **y** total ≥ 5 **y** minoría ≥ 2;
- **muestra chica** (`lowSample`) si la minoría es ≥ 30 % pero falta muestra (total < 5 o minoría < 2): no se pregunta; se escriben los conteos con la nota "muestra chica" y se sigue la mayoría (o, si empatan, lo del archivo que se toca);
- **clara** en el resto: gana la mayoría y las excepciones van con nombre.

### 2.5 Patrones por necesidad
Necesidades, en orden: **iconos**, **modales**, **notificaciones/errores**, **formularios**, **api** (prioridad alta) y después estado, auth/guards, tablas-filtros-paginación, estilos y entornos. Para cada una, la forma dominante (`fachada`, `directo`, `clase base`…) con conteos, la API real, 1–2 ejemplos reales y las excepciones.
- **Fachada**: servicio propio que inyecta un servicio de librería (`NzModalService`, `MatDialog`, `NzMessageService`, `MatSnackBar`, `HttpClient`…) y que el resto del código inyecta en más archivos que el servicio de librería directo (sin contar la propia fachada). Los usos directos son excepciones. Un servicio de datos que solo envuelve `HttpClient` para un recurso no es fachada de API; sí lo es una clase base o un servicio genérico.
- **Patrones emergentes**: una función o servicio propio usado en ≥ 3 features distintas que no sea componente ni fachada de una necesidad (permisos, ids cifrados…). Si lo merece, documéntalo como `patterns/<nombre>.md`.
- Una necesidad **sin evidencia no tiene archivo**. Si es de prioridad alta, va a "No detectado" de recommendations.md diciendo qué falta.

### 2.6 Recetas
Por tipo (`listado`, `crear-editar`, `detalle`, `modal`), elige la **plantilla dorada**: la feature real que mejor sigue las convenciones observadas (nunca del showcase, deprecated ni con código sin uso). Si el repo no tiene una feature de ese tipo, no hay receta.

### 2.7 Contradicciones y posibles problemas
- **Docs ↔ código**: cada afirmación del paso 1.4 que el código desmiente, con lo que dice el documento (`archivo:línea`), lo que muestra el código (evidencia) y qué documento corregir. Las que coinciden no se anotan. Nunca corrijas el documento del equipo.
- **Internas**: dos implementaciones de lo mismo (dos componentes con el mismo nombre base y los mismos inputs o template, dos utilidades de modal…).
- **Posibles problemas** vistos al leer el código (atributo duplicado en un elemento, `x.set(true)` dentro de `tap()` de la request, `subscribe` sin limpieza sobre fuentes que no completan, `document.querySelector*` en un componente…). En modo índice, los de `possibleIssues`, `inertAttributes` y duplicados del índice se afirman ("Detectados por el escáner"). En modo prompt, esa tabla se llama "**Verificados en el código**" y solo lleva lo que comprobaste con evidencia exacta (atributos inertes verificados con Grep, atributos duplicados); el resto va a "A revisar", nunca como hecho.

## Paso 3 — Preguntar (solo convenciones divididas)

- Pregunta **solo** por convenciones divididas sin decisión del equipo (ni en la config ni ya en conventions.md). Nunca por las de muestra chica ni por las claras.
- Haz **una sola ronda** con todas juntas (con la herramienta de preguntas si la tienes). En cada una muestra los conteos y 1–2 archivos de ejemplo de cada lado y pregunta cuál seguir **en código nuevo**.
- La respuesta queda en conventions.md como `> **Decisión del equipo:** <forma> en código nuevo (observado: <a> en <n> archivos, <b> en <m>).`
- Si no hay nadie para responder (ejecución sin usuario, sin herramienta de preguntas o sin respuesta), **no elijas tú**: la convención queda `> **Pendiente de confirmar.** …` con las dos opciones, sus conteos y sus archivos, y lo dices en el reporte.

## Paso 4 — Escribir

Para cada archivo, parte de su plantilla: sigue cada instrucción `<!-- ao: … -->` y **bórrala** del resultado; reemplaza cada `<…>` y cada ejemplo `mimi-*` de la plantilla por datos del repo; omite las secciones sin datos salvo las que la plantilla dice que van siempre. Primera línea tras el título de cada archivo: `Generado el <fecha> sobre <rama> · ao-kit 0.0.0 · conteos excluyen: <showcase, deprecated o "nada">`.

| Archivo | Plantilla | Cuándo |
|---|---|---|
| `.ao/conventions.md` | `conventions.md` | siempre |
| `.ao/catalog.md` | `catalog.md` | siempre; con "No hay (todavía)" |
| `.ao/recommendations.md` | `recommendations.md` | siempre; con "No detectado (prioridad alta)" |
| `.ao/components/<selector>.md` | `card.md` | una por componente compartido no `unused` |
| `.ao/patterns/<necesidad>.md` | `pattern.md` | solo necesidades (o emergentes) con evidencia |
| `.ao/recipes/<tipo>.md` | `recipe.md` | solo tipos con plantilla dorada |

**Fichas.** El frontmatter es YAML plano (sin tags, anclas ni comentarios), con estos campos en este orden:

```yaml
---
schemaVersion: 1
id: src/app/shared/components/ui/mimi-select/mimi-select.component.ts#MimiSelectComponent
selector: mimi-select
source: src/app/shared/components/ui/mimi-select/
kind: wrapper
wraps: nz-select
generatedBy: prompt
hash: null
usedIn: 3
---
```

- `id`: `<ruta del .ts>#<Clase>`; `source`: la carpeta, terminada en `/`; `kind`: `wrapper`, `slot-container` o `component`; `wraps`: el elemento envuelto solo con `kind: wrapper`, si no `null`; `usedIn`: usos reales (sin showcase ni deprecated).
- Modo prompt: `generatedBy: prompt` y `hash: null`. Modo índice: `generatedBy: scan` y el `hash` del índice.
- El archivo se llama exactamente `components/<selector>.md` y su fila del catálogo lo enlaza con `(components/<selector>.md)`, como en la plantilla.
- "Qué envuelve" y "Contrato observado" solo en wrappers. La API lista los inputs/outputs reales con un valor de uso real (`archivo:línea`). Los snippets de "Usos reales" se copian completos del código (atributos y directivas incluidos), nunca del showcase.

**Enlaces.** Todo enlace entre archivos de `.ao/` es relativo y apunta a un archivo que escribiste. No enlaces patrones, recetas ni fichas que no existen.

**AGENTS.md** (raíz). Agrega, o reemplaza si ya está, este bloque, sin tocar nada fuera de él. Si AGENTS.md no existe, créalo solo con el bloque; si existe y no tiene el bloque, agrégalo al final.

```md
<!-- ao-kit:start -->
## Contexto del proyecto (ao-kit)

Antes de escribir código en este repo, lee `.ao/`:
- [.ao/conventions.md](.ao/conventions.md): cómo se trabaja aquí (lo observado manda sobre cualquier guía genérica).
- [.ao/catalog.md](.ao/catalog.md): qué componente usar para cada intención. Si no está, mira "No hay (todavía)" antes de crear uno.
- `.ao/components/<selector>.md`: API, contrato y usos reales de cada componente compartido.
- `.ao/patterns/`: cómo se resuelven aquí <necesidades documentadas>.
- `.ao/recipes/`: paso a paso de <tipos de receta> sobre una feature real.
- [.ao/recommendations.md](.ao/recommendations.md): mejoras sugeridas; no se aplican solas.

Reglas clave:
- <3 a 6 reglas observadas de más impacto, cada una con su evidencia corta: wrappers obligatorios, fachadas, forma de inputs/DI/control flow, estilos de la librería solo en wrappers…>

Generado con ao-kit 0.0.0; para regenerarlo, corre `/ao:init`.
<!-- ao-kit:end -->
```

Quita del bloque las líneas de patrones o recetas si no generaste ninguno.

**CLAUDE.md** (raíz). Si no existe, créalo con la línea `@AGENTS.md`. Si existe y no tiene una línea que sea exactamente `@AGENTS.md`, agrégala como primera línea (seguida de una línea en blanco), sin borrar ni cambiar nada más. Si su contenido contradice el código, eso va a "Contradicciones"; no lo corrijas.

## Paso 5 — Verificar

1. Valida con el CLI de ao-kit: corre directamente `ao validate .ao` (si el comando no existe, `npx --no-install ao validate .ao`). Si da errores, corrígelos y vuelve a correrlo hasta que pase. Si no está disponible o no te dejan correrlo, revisa tú lo mismo: existen los 3 archivos fijos, cada ficha tiene el frontmatter de arriba y se llama `<selector>.md`, cada ficha está enlazada desde catalog.md, todos los enlaces internos existen y no queda ningún `<!-- ao: … -->`.
2. Relee las fichas y las recetas buscando ejemplos del showcase, de deprecated o de código sin uso, y recomendaciones del perfil que se hayan colado como regla. Quítalos.
3. Si el repo es git, `git status --porcelain` solo puede mostrar `.ao/`, `AGENTS.md` y `CLAUDE.md`. Si tocaste otra cosa, deshaz tu cambio.

## Paso 6 — Reporte (breve, en el chat)

- Modo (índice o prompt) y, si no se usó el índice, por qué.
- Archivos escritos (cuántas fichas, patrones y recetas) y resultado de la validación.
- Convenciones "pendiente de confirmar" y "decisión del equipo" registradas.
- Contradicciones docs ↔ código encontradas y posibles problemas "a revisar" (solo cuántos y dónde verlos).
- Siguiente paso: pedir vistas con `/ao:view <descripción o link de Figma>`.

## Anexo: plantillas

Formato de salida. Cada plantilla va entera entre las vallas; no copies las vallas al archivo que escribas.

### `README.md`

````markdown
# agent/templates

Plantillas de los archivos que `/ao:init` (y después `/ao:sync`) escribe en `.ao/` del repo destino. Salen de la validación manual de M0 (`docs/m0-hallazgos.md`, sección 3).

| Plantilla | Archivo generado |
|---|---|
| `conventions.md` | `.ao/conventions.md` |
| `catalog.md` | `.ao/catalog.md` |
| `card.md` | `.ao/components/<selector>.md` (una por componente compartido) |
| `pattern.md` | `.ao/patterns/<necesidad>.md` (solo necesidades con evidencia) |
| `recipe.md` | `.ao/recipes/<tipo>.md` (`listado`, `crear-editar`, `detalle`, `modal`) |
| `recommendations.md` | `.ao/recommendations.md` |

## Cómo leerlas

- `<entre ángulos>`: lo reemplaza el agente con datos del índice o del código.
- `<!-- ao: … -->`: instrucción para el agente; no se copia al archivo generado.
- Los ejemplos usan `mimi-*` y nombres neutros. Nunca van nombres reales de clientes ni proyectos.
- Una sección sin datos se omite entera, salvo que la plantilla diga que va siempre (por ejemplo "No hay (todavía)" o "No detectado").

## Reglas comunes

1. **Cabecera común**, primera línea después del título:
   `Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>`
   La fecha y la rama las pone el agente; el índice no guarda fechas (es determinista).
2. **Toda afirmación lleva evidencia**: `archivo:línea` relativos a la raíz y conteos (`14 archivos: pages/solicitudes/…`). Sin evidencia, no se escribe.
3. **Observado gana sobre recomendado.** Lo que hace el repo va en "Observado"; lo del perfil (`profiles/angular-modern`) solo en "Recomendado" o en `recommendations.md`.
4. **Código sin uso, legacy y showcase nunca son ejemplo.** Lo `unused` y lo de `deprecated` solo aparece en "Heredado sin uso" / "Legacy"; el showcase no cuenta en los conteos.
5. **El código manda sobre los docs del repo.** Si CLAUDE.md, AGENTS.md o una skill dicen otra cosa que el código, se anota en "Contradicciones"; no se copia.
6. **Excepciones con nombre**: "todas usan X salvo `features/a/b.ts:241`", nunca "casi todas".
````

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

### `conventions.md`

````markdown
# Convenciones de <nombre del repo>

Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>

<!-- ao: una sección por tema con datos en index.conventions. Cada sección tiene siempre "Observado"; "Recomendado" solo si el perfil difiere de lo observado y el repo cumple la versión mínima de la regla. Con varios proyectos (index.projects), cada tema se divide por proyecto cuando difieren. -->

## 0. Qué es este repo

- Angular <versión> · <angular-cli | nx> · <standalone | ngmodule | mixed> · <zoneless sí/no>
- Proyectos: <nombre> (<application | library>, `<sourceRoot>`, prefijo `<prefix>`)
- UI: <librería> <versión> (`<prefijos>`) · íconos: <librería> · estado: <librería o "signals en servicios"> · estilos: <scss | less | css> <+ tailwind>
- Antes de crear algo, mira [catalog.md](catalog.md) y [patterns/](patterns/).

## 1. Componentes

**Observado**
- Standalone: <n> de <total> (<archivos de ejemplo>). <!-- ao: si es NgModules, en qué módulo se declara cada tipo de componente -->
- Inputs: `@Input()` en <n> archivos, `input()` en <m>. Ej.: `src/app/shared/components/ui/mimi-select/mimi-select.component.ts:12`
- Change detection: <OnPush n / Eager m> <!-- ao: en v22+ OnPush es el valor por defecto; decirlo así -->

**Recomendado** <!-- ao: solo si difiere; siempre con "en código nuevo" y la versión mínima -->
- `input()` en código nuevo (Angular ≥ 17.1). Ver [recommendations.md](recommendations.md).

## 2. Inyección de dependencias

**Observado**
- Constructor en <n> archivos, `inject()` en <m>: `src/app/pages/pagos/pagos.component.ts:18`, …

<!-- ao: convención con lowSample (minoría ≥ 30 % pero total < 5 o minoría < 2): sin pregunta, solo la nota. -->
- Muestra chica: <a> en <n> archivos, <b> en <m>. No alcanza para hablar de convención; sigue la mayoría.

<!-- ao: convención dividida (divided: minoría ≥ 30 %, total ≥ 5 y minoría ≥ 2) sin decisión del equipo: -->
> **Pendiente de confirmar.** <a> en <n> archivos (<ejemplos>) · <b> en <m> archivos (<ejemplos>). Hasta que el equipo decida, sigue lo del archivo que estás tocando.

<!-- ao: override de .ao/config.json: -->
> **Decisión del equipo:** <a> en código nuevo (observado: <n> % <a>, <m> % <b>).

## 3. Templates

**Observado**
- Control flow: `@if`/`@for` en <n> templates, `*ngIf`/`*ngFor` en <m>.
- <otras sintaxis de templateSyntax: @let, @switch con @default never, arrow functions…>

## 4. Archivos y carpetas

**Observado**
- Nombres: `<patrón>` (`mimi-select.component.ts`, `pagos.component.html`).
- Features: `<patrón de carpetas>` (`pages/<feature>/`, `data-access/`).

## 5. Estilos

**Observado**
- Sobrescrituras de la librería solo en los wrappers (`::ng-deep .ant-*` en <n> archivos: `…mimi-select.component.scss:3`). Excepciones: <archivo:línea>.
- Tokens: <variables CSS / less / scss / @theme> en `<archivo>`.

<!-- ao: más secciones según los temas con datos (rutas, servicios, formularios…); los patrones por necesidad van en patterns/, aquí solo se enlazan. -->

## Heredado sin uso

<!-- ao: index con kind "unused" (componentes, directivas, pipes, servicios, interceptores no registrados) y lo de deprecated. Nunca se usa como referencia. Excepción: unusedReason "exported-not-consumed" (export de una librería sin consumidores en el workspace) no es código muerto y no va aquí. -->
No lo tomes como referencia ni lo reutilices sin revisarlo:

| Qué | Archivo | Por qué |
|---|---|---|
| `mimi-old-table` | `src/app/shared/components/old-table/old-table.component.ts` | 0 usos en templates |
| `LegacyAuthInterceptor` | `src/app/core/interceptors/legacy-auth.interceptor.ts` | se importa pero no se registra en `withInterceptors` |

## Contradicciones

<!-- ao: index.docDrift (docs del repo ↔ código) y contradicciones internas (dos formas de lo mismo sin mayoría clara). El código manda. -->

**Docs ↔ código**

| Documento | Dice | El código muestra | Corregir |
|---|---|---|---|
| `CLAUDE.md:42` | los íconos se registran en `app.config.ts` | se registran en `src/app/core/icons.ts:8` | CLAUDE.md |

**Internas**
- Dos utilidades de modal: `src/app/shared/utils/modal.ts:5` y `src/app/core/modal-helper.ts:3` (ver duplicados en [recommendations.md](recommendations.md)).
````

### `pattern.md`

````markdown
# Modales

Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>

<!-- ao: un archivo por necesidad con evidencia en index.patterns (o por patrón emergente que el agente decida documentar). Sin evidencia, no hay archivo: la necesidad va a recommendations.md como "No detectado". Título = la necesidad (Iconos, Modales, Notificaciones y errores, Formularios, API, Estado…). -->

## Forma oficial

<!-- ao: approach de index.patterns[necesidad]: fachada, directo, clase base… con conteos. -->

Usa la fachada **`ConfirmService`** (`src/app/shared/services/confirm.service.ts`), que envuelve `NzModalService`.
- `ConfirmService` en 2 archivos · `NzModalService` directo en 1 (excepción).

## API rápida

<!-- ao: solo lo que la fachada o el enfoque expone de verdad, con su archivo:línea. -->

| Para | Llama | Devuelve |
|---|---|---|
| Confirmar una acción | `confirmar({ titulo, mensaje })` (`confirm.service.ts:14`) | `Promise<boolean>` |
| Abrir un componente con datos | `abrir(Componente, data)` (`confirm.service.ts:27`) | resultado de `NzModalRef.close(valor)` |
| Leer los datos dentro del modal | `inject(NZ_MODAL_DATA)` (`contacto-modal.ts:12`) | el `data` que se pasó |

## Ejemplos reales

<!-- ao: 1–2 usos reales con archivo:línea y snippet corto; nunca del showcase, de deprecated ni de código unused. -->

`src/app/pages/proveedores/detalle/detalle.ts:31`
```ts
const ok = await this.confirm.confirmar({ titulo: 'Eliminar proveedor', mensaje: '¿Seguro?' });
if (ok) this.eliminar();
```

## Excepciones

<!-- ao: exceptions[] del índice, cada una con archivo:línea. Si se sabe por qué, decirlo; si no, no inventarlo. -->

- `src/app/pages/proveedores/listado/listado.ts:44`: usa `NzModalService.info` directo.

## Qué no hacer

- No inyectes `NzModalService` en una página: usa `ConfirmService`.
- No leas los datos del modal con `this.modalRef.getConfig().nzData`: usa `inject(NZ_MODAL_DATA)` como en `contacto-modal.ts:12`.
````

### `recipe.md`

````markdown
# Receta: listado

Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>

<!-- ao: una receta por tipo (listado, crear-editar, detalle, modal). Se apoya en una feature real del repo, la "plantilla dorada": la que mejor sigue las convenciones observadas, nunca una del showcase, deprecated ni con código unused. Si el repo no tiene una feature de ese tipo, no se genera la receta. -->

## Plantilla dorada

`src/app/pages/proveedores/` — la feature de referencia para un listado. Cuando dudes, copia su forma.

## Archivos y responsabilidades

| Archivo | Responsabilidad |
|---|---|
| `listado/listado.ts` | página: filtros, paginación y navegación |
| `listado/listado.html` | `page-header` + `filter-drawer` + `custom-table` |
| `data-access/proveedores.service.ts` | llamadas HTTP (ver [patterns/api.md](../patterns/api.md)) |
| `data-access/proveedor.model.ts` | modelos de la API |
| `proveedores.routes.ts` | rutas de la feature, cargadas con `loadChildren` desde `app.routes.ts:12` |

## Paso a paso

1. Crea la carpeta `src/app/pages/<feature>/` con la misma estructura.
2. Modelo y servicio en `data-access/`, siguiendo [patterns/api.md](../patterns/api.md).
3. Página de listado con [`page-header`](../components/page-header.md) y [`custom-table`](../components/custom-table.md) (paginación en servidor: `[serverPaging]="true"`, como en `listado.html:12`).
4. Registra la ruta con `loadChildren` en `app.routes.ts`, como `proveedores`.

## Checklist

- [ ] Reutiliza los componentes del [catálogo](../catalog.md); nada nuevo sin pasar por "No hay (todavía)".
- [ ] Sigue [conventions.md](../conventions.md) (inyección, inputs, control flow, nombres de archivo).
- [ ] Modales, notificaciones y API con la forma de [patterns/](../patterns/).
- [ ] Sin código copiado de "Heredado sin uso" ni de "Legacy".
````

### `recommendations.md`

````markdown
# Recomendaciones

Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>

<!-- ao: nada de este archivo se aplica solo. Tres secciones fijas, en este orden. Cada punto con evidencia. -->

Sugerencias priorizadas. **No se aplican solas**: el código nuevo sigue [conventions.md](conventions.md) hasta que el equipo decida migrar.

## Migraciones

<!-- ao: diferencias entre el perfil (profiles/angular-modern) y lo observado. Solo reglas cuya versión mínima cumple el repo. También lo de deprecated (migrar a la forma actual). Orden: mayor impacto primero. -->

| Prioridad | Qué | Observado | Perfil | Desde |
|---|---|---|---|---|
| Alta | `input()` en lugar de `@Input()` en código nuevo | `@Input()` en 12 archivos (`mimi-select.component.ts:12`, …) | `input()` | Angular 17.1 |
| Media | `inject()` en lugar del constructor | constructor en 11 archivos, `inject()` en 4 | `inject()` | Angular 14 |

## Posibles problemas

<!-- ao: separado de las migraciones. (1) Lo que el escáner detecta con evidencia (index.possibleIssues, index.inertAttributes, index.duplicates): se afirma. (2) Lo que el agente ve al leer el código: va marcado "a revisar", nunca como hecho. -->

**Detectados por el escáner**

| Problema | Dónde | Detalle |
|---|---|---|
| Atributo inerte | `appAutoFocus` en 4 archivos (`pages/pagos/pagos.component.html:9`, …) | ninguna directiva del repo tiene ese selector; se escribe y no hace nada |
| Atributo duplicado | `src/app/pages/perfil/perfil.component.html:22` | `nzPlaceHolder` dos veces en el mismo elemento |
| Suscripción sin limpieza | `src/app/pages/solicitudes/solicitudes.component.ts:40` | `subscribe()` sin `takeUntilDestroyed` ni `unsubscribe` |
| Componentes duplicados | `app-button` ↔ `ui-button` | comparten los inputs `variant` y `disabled`; usa el de la librería (`ui-button`) |

**A revisar** (visto al leer el código; confírmalo antes de cambiarlo)
- `src/app/shared/components/ui/mimi-select/mimi-select.component.ts:30`: `document.querySelectorAll` global desde un wrapper; puede afectar a otras instancias.

## No detectado (prioridad alta)

<!-- ao: va siempre. Necesidades de prioridad alta (iconos, modales, notificaciones/errores, formularios, api) sin evidencia en index.patterns. Se dice qué falta; nunca se inventa una forma. -->

| Necesidad | Qué falta |
|---|---|
| Notificaciones/errores | sin interceptor de errores HTTP: cada pantalla maneja sus errores |
````
