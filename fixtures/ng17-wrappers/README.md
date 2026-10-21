# fixture: ng17-wrappers

App Angular 17 **sintética** (no es código de ningún cliente). Reproduce un proyecto standalone que sigue usando las APIs anteriores a signals y que envuelve ng-zorro en componentes propios `mimi-*`.

No se instala ni se compila: el escáner solo lee los archivos.

## Patrones que representa

| Patrón | Dónde | Lo usa el detector |
|---|---|---|
| Standalone con APIs viejas: `standalone: true` + `imports: [CommonModule, …]`, `bootstrapApplication`, rutas con `loadComponent` | todos los componentes, `src/main.ts`, `src/app/app.routes.ts` | stack, components, routes |
| `@Input()` decorador (sin `input()`) | `status-badge`, `mimi-type.directive` | conventions (4.6) |
| DI por constructor (10 clases); un único `inject()`, en el guard funcional | `core/services/*`, `pages/*`, `input-effect.directive` · `core/guards/auth.guard.ts` | conventions |
| `*ngIf` / `*ngFor` (sin `@if`) | templates de `pages/*` y `status-badge` | conventions |
| **Wrappers de ng-zorro**: `mimi-select` y `mimi-input` tienen como template solo `<div mimi-group><ng-content></ng-content></div>` y estilos `:host ::ng-deep .ant-select…` / `.ant-input…` | `shared/components/ui/mimi-*` | wrappers (4.4) |
| **Doble uso del nombre**: el elemento `<mimi-select>` envuelve un `<nz-select mimi-select …>`; el atributo `mimi-select` es el gancho de los estilos del wrapper. Igual con `mimi-input` | `pages/solicitudes`, `pagos`, `perfil` | wrappers, usages (4.5) |
| Directivas propias en el control proyectado: `inputEffectDirective`, `mimiType="outline"`, `[ngClass]` con `input-error` / `fill`, `[nzOptionHeightPx]="42"` | mismos templates | usages (snippet representativo) |
| **Excepción**: `reportes` usa `nz-select` directo, sin wrapper → la regla se cumple en 3 de 4 | `pages/reportes/reportes.component.html` | conventions (evidencia "3 de 4") |
| SCSS con variables (`$color-primary`, `$control-height`…) e `includePaths: ["src"]` | `src/styles/_variables.scss` | tokens (4.7) |
| Aliases `@core/*`, `@shared/*`, `@env/*` | `tsconfig.json` | stack |
| Servicios con `HttpClient` y URLs sobre `environment.apiUrl` | `core/services/*` | services (4.8) |

Los conteos exactos (usos por selector, % standalone, @Input frente a input(), rutas) están en [`expected.json`](./expected.json).
