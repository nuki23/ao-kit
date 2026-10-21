# fixture: ng12-modules

App Angular 12 **sintética** (no es código de ningún cliente). Reproduce un proyecto clásico con NgModules y Angular Material 12 (clases `.mat-*` anteriores a MDC).

No se instala ni se compila: el escáner solo lee los archivos.

## Patrones que representa

| Patrón | Dónde | Lo usa el detector |
|---|---|---|
| Arranque con `platformBrowserDynamic().bootstrapModule(AppModule)` y builder `:browser` | `src/main.ts`, `angular.json` | stack (`projectStructure: ngmodule`) |
| `CoreModule` (interceptor en `providers`, guard contra doble import), `SharedModule`, `MaterialModule` y módulos de feature | `src/app/**/*.module.ts` | ngmodules (4.10) |
| `MaterialModule` con `imports`/`exports` desde una constante (`MATERIAL_MODULES`) | `shared/material.module.ts` | ngmodules (resolver identificadores) |
| `SharedModule` re-exporta `MaterialModule`, `CommonModule` y `ReactiveFormsModule` → `ClientesModule` los ve de forma transitiva | `shared/shared.module.ts`, `features/clientes/clientes.module.ts` | ngmodules |
| **Declarado y no exportado**: `app-field-error` solo existe dentro del template de `app-field`; no es visible en `ClientesModule` ni en `PedidosModule` | `shared/components/field-error/` | ngmodules, catálogo (no ofrecerlo) |
| **Módulo que no importa lo compartido**: `PedidosModule` importa solo `MatTableModule` y `MatButtonModule`, tiene `schemas: [CUSTOM_ELEMENTS_SCHEMA]` y aun así `pedidos-lista` usa `<app-card>` → warning esperado | `features/pedidos/` | ngmodules (`warnings[]`) |
| **Wrapper de `mat-form-field`**: `app-field` proyecta siempre un `mat-form-field` (5 de 5) y sus estilos tocan `::ng-deep .mat-form-field…`; no lleva atributo con su nombre → wrapper por (a)+(b), sin (c) | `shared/components/field/` | wrappers (4.4) |
| **Slot-container**: `app-card` proyecta contenido variado (tabla, form, `<dl>`) y tiene un slot `[cardActions]`; sus estilos tocan `.mat-card-*` → solo cumple (b) | `shared/components/card/` | wrappers (caso negativo) |
| `@Input()` y `@Output()` con `EventEmitter` | `card`, `field`, `field-error` | conventions |
| DI por constructor en todo (también `@Inject(MAT_DIALOG_DATA)` y `@Optional() @SkipSelf()`) | servicios, componentes, guard, `CoreModule` | conventions |
| `*ngIf` / `*ngFor`, `ng-template #cargando` con `else`, microsintaxis de `mat-table` (`*matCellDef`) | templates | conventions (no contar `*mat*` como control flow) |
| Forms reactivos sin tipar (`FormGroup`, `FormControl`) | `cliente-form`, `clientes-lista` | conventions |
| Guard de clase (`implements CanActivate`) | `core/guards/auth.guard.ts` | routes |
| `entryComponents` (deprecated, todavía presente en repos viejos) para el diálogo | `shared/shared.module.ts` | ngmodules (tolerarlo) |
| Servicio provisto en `providers` del módulo (`@Injectable()` sin `providedIn`) frente a `providedIn: 'root'` | `features/pedidos/pedidos.service.ts` | services |
| Rutas con `loadChildren` a módulo y `RouterModule.forChild` | `app-routing.module.ts`, `*-routing.module.ts` | routes |
| Tema de Material en SCSS (`mat.define-palette`, `define-light-theme`) y variables SCSS | `src/styles/_theme.scss`, `_variables.scss` | tokens |

Los conteos exactos (usos por selector, módulos y lo que ve cada uno, warnings y rutas) están en [`expected.json`](./expected.json).
