# fixture: ng-multi

Workspace Angular 20 **sintético** (no es código de ningún cliente) con dos aplicaciones y una librería interna, como lo dejan `ng new --create-application=false`, `ng g application` y `ng g library`. Cada proyecto tiene un estilo distinto, así que el repo da `projectStructure: "mixed"`.

No se instala ni se compila: el escáner solo lee los archivos. `dist/` no existe.

## Proyectos

| Proyecto | Tipo | Prefijo | Estilo |
|---|---|---|---|
| `acme-ui` (`projects/acme-ui`) | library (`ng-package.json`, `public-api.ts`) | `ui` | standalone implícito, `input()`/`output()`, `@if`, naming v20 (`button.ts`) |
| `portal` (`projects/portal`) | application | `app` | standalone **explícito** (`standalone: true`) con APIs viejas: `@Input`, constructor, `*ngIf`/`*ngFor` |
| `backoffice` (`projects/backoffice`) | application | `bo` | NgModules (`bootstrapModule`, `standalone: false`, `loadChildren` a módulo) |

## Patrones que representa

| Patrón | Dónde | Lo usa el detector |
|---|---|---|
| `angular.json` con 3 proyectos, cada uno con `root`, `sourceRoot` y `prefix` | `angular.json` | stack (`projects[]`) |
| **Alias a `dist`**: `"@acme/ui": ["./dist/acme-ui"]`, como lo genera `ng g library`; hay que resolverlo con el `dest` de `ng-package.json` → `projects/acme-ui/src/public-api.ts` | `tsconfig.json`, `projects/acme-ui/ng-package.json` | stack (aliases) |
| Las dos apps importan la librería por el alias, nunca por ruta relativa | `portal/pages/*`, `backoffice/shared/shared.module.ts` | usages por proyecto |
| **API pública**: `public-api.ts` exporta `Button`, `Card` y `Badge`; `Spinner` es interno (solo lo usa `ui-button`) | `projects/acme-ui/src/` | components (exportado / interno) |
| **Alcance de lo compartido**: la librería es compartida entre proyectos; cada `shared/` solo dentro de su app | `projects/*/src/app/shared/` | catálogo |
| **Duplicado por inputs**: `app-button` (portal) comparte `variant`, `disabled` y `loading` con `ui-button` | `portal/src/app/shared/button/` | duplicates (4.12) |
| **Duplicado por template**: `bo-card` (backoffice) tiene inputs con otros nombres (`titulo`, `elevada`) pero el mismo árbol que `ui-card` (section > header? > h3, div > ng-content, footer > ng-content[select]) | `backoffice/src/app/shared/card/` | duplicates (4.12) |
| **No duplicado**: `bo-button-group` contiene "button" en el nombre, pero su nombre base es `button-group`, tiene otros inputs y otro template | `backoffice/src/app/shared/button-group/` | duplicates (caso negativo) |
| Usos por proyecto: `ui-button` en las dos apps, `ui-card` solo en portal, `ui-badge` en ninguna (exportado sin usos) | templates de las apps | usages |
| Standalone de la librería (`Button`) importado y re-exportado por un `NgModule` | `backoffice/src/app/shared/shared.module.ts` | ngmodules (4.10) |
| `standalone` en tres formas: implícito (lib), `true` explícito (portal) y `false` obligatorio (backoffice) | todos los componentes | conventions (la versión interpreta el default) |

Los conteos exactos (usos por proyecto, duplicados con el criterio que cumplen, warnings y convenciones por proyecto) están en [`expected.json`](./expected.json).
