# fixture: ng21-ao

App Angular 21 **sintética** (no es código de ningún cliente). Reproduce un proyecto que sigue el perfil moderno: signals, `inject()`, control flow nuevo, Tailwind v4 y componentes compartidos documentados con un showcase en `/ejemplos`.

No se instala ni se compila: el escáner solo lee los archivos.

## Patrones que representa

| Patrón | Dónde | Lo usa el detector |
|---|---|---|
| Standalone **implícito** (ningún componente declara `standalone`; es el valor por defecto desde v19) | todos los componentes | components, conventions (la versión interpreta el default) |
| `input()` / `input.required()` / `output()`; `signal`, `computed`, `rxResource` | `shared/components/*`, `pages/proveedores/*` | conventions (4.6) |
| `inject()` en todas las clases; ningún constructor con parámetros | `data-access/proveedores.service.ts`, páginas | conventions |
| `@if` / `@else if` / `@else` / `@for … track` (sin `*ngIf`) | todos los templates | conventions |
| `ChangeDetectionStrategy.OnPush` explícito en todos | todos los componentes | conventions |
| Nombres de archivo estilo v20+: `page-header.ts` sin sufijo `.component`, clases sin sufijo (`PageHeader`) | todo `src/app` | conventions (naming) |
| 3 shared components con `templateUrl` (+ `styleUrl` en custom-table): `app-page-header`, `app-custom-table`, `app-empty-state` | `src/app/shared/components/` | components, usages |
| **No son wrappers**: `page-header` tiene `<ng-content />` y en `detalle` se le proyectan botones `nz-button`, pero su template tiene contenido propio; `custom-table` usa `nz-table` por dentro, no la proyecta | `shared/components/*` | wrappers (caso negativo) |
| Feature CRUD: `listado`, `crear-editar`, `detalle` y `data-access` (modelo + servicio HTTP) con rutas hijas lazy | `src/app/pages/proveedores/` | routes, services, recetas |
| Inputs de ruta con `withComponentInputBinding` (`id = input<string>()`) | `crear-editar`, `detalle` | routes |
| Showcase `/ejemplos` (`loadComponent`): sus usos no son usos reales | `src/app/pages/ejemplos/` | usages (separar showcase) |
| Tailwind v4 con `@theme` (`--color-brand-*`, `--radius-card`, `--spacing-page`) y `.postcssrc.json` | `src/styles.css` | tokens (4.7) |
| Tema de ng-zorro en less (`@primary-color`…) | `src/theme.less` | tokens |
| Íconos con `lucide-angular` | `page-header`, `empty-state` | stack |
| Builder `@angular/build:application` | `angular.json` | stack |

Los conteos exactos (usos por selector, % standalone, @Input frente a input(), rutas) están en [`expected.json`](./expected.json).
