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
