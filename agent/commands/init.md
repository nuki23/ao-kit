---
description: Analiza este repo Angular y escribe el contexto del proyecto en .ao/ (convenciones, catálogo, fichas de componentes, patrones, recetas y recomendaciones), con evidencia archivo:línea. Agrega la sección de ao-kit en AGENTS.md y el import en CLAUDE.md.
argument-hint: '[carpeta del repo]'
---

# /ao:init — contexto del proyecto en `.ao/`

Vas a documentar **cómo se trabaja en este repo**, a partir de su código, para que un agente de código reutilice lo que ya existe en lugar de reinventarlo. Escribes en español.

- Raíz del repo: `$ARGUMENTS` si es una carpeta del repo; si no (o si ese texto no se reemplazó), el directorio actual.
- Plantillas: en {{templates}} (`README.md` con las reglas comunes, `conventions.md`, `catalog.md`, `card.md`, `pattern.md`, `recipe.md` y `recommendations.md`). Léelas **todas** antes de escribir; son el formato de salida. No las busques en otro sitio.
- Versión de ao-kit para la cabecera: `{{version}}`.

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

Para cada archivo, parte de su plantilla: sigue cada instrucción `<!-- ao: … -->` y **bórrala** del resultado; reemplaza cada `<…>` y cada ejemplo `mimi-*` de la plantilla por datos del repo; omite las secciones sin datos salvo las que la plantilla dice que van siempre. Primera línea tras el título de cada archivo: `Generado el <fecha> sobre <rama> · ao-kit {{version}} · conteos excluyen: <showcase, deprecated o "nada">`.

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

Generado con ao-kit {{version}}; para regenerarlo, corre `/ao:init`.
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
