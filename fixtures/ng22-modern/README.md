# fixture: ng22-modern

App Angular 22 **sintética** (`mimi-tareas`, no es código de ningún cliente) con las APIs y la sintaxis nuevas de v22, y con los patrones por necesidad propios de esa versión.

No se instala para escanearse: el escáner solo lee los archivos. Aun así, el código compila con `ngc` 22.2.3 y `strictTemplates` (verificado al crearlo en una copia fuera del repo).

## Patrones que representa

| Patrón | Dónde | Lo usa el detector |
|---|---|---|
| `@Service()` en todos los servicios, ningún `@Injectable` | `core/notificaciones.ts`, `data-access/tareas-api.ts`, `data-access/tareas-store.ts` | conventions |
| OnPush por defecto en v22: 4 componentes sin `changeDetection`; `estado-chip` con `ChangeDetectionStrategy.Eager` | todos los componentes | conventions (la versión interpreta el default) |
| Standalone implícito, `input()`/`input.required()`, `inject()`, zoneless (sin zone.js) | todo `src/app` | conventions, stack |
| **`@switch` de v22**: `@case ('pendiente')` sin cuerpo agrupado con `@case ('en-curso') { … }`, y `@default never;` exhaustivo sobre la unión `EstadoTarea` | `shared/estado-chip/estado-chip.html` | templates (sintaxis v22) |
| El chequeo exhaustivo necesita una expresión estrechable: `@let e = estado(); @switch (e)`. Con `@switch (estado())` falla aunque estén todos los casos | mismo archivo | recomendación del perfil |
| Arrow functions (`lista.filter((t) => …)`), spread de objeto (`{ ...claseBase, … }`) y `@let` en templates | `features/tareas/listado/listado.html` | templates |
| **API**: `httpResource` para lecturas (3 archivos) y `HttpClient` para escrituras (1 servicio) → mayoría `httpResource` | `listado`, `detalle`, `formulario` · `data-access/tareas-api.ts` | patterns.api |
| Origen de la URL con `InjectionToken` (`API_URL`), modelos en `data-access/` | `core/api-url.ts`, `app.config.ts` | patterns.api |
| **Formularios**: Signal Forms (`form()`, `[formField]`, `required`, `minLength`, `submit()`) con un validador propio `fechaFutura` | `features/tareas/formulario/`, `validators/fecha-futura.ts` | patterns.formularios |
| **Notificaciones**: fachada `Notificaciones` (`@Service`) sobre `MatSnackBar`, usada en 3 sitios; `app.ts` usa `MatSnackBar` directo una vez (excepción) | `core/notificaciones.ts`, `app.ts` | facades (4.13), patterns.notificaciones |
| **Estado**: `TareasStore` con `signal` + `asReadonly` + `computed`, sin NgRx | `data-access/tareas-store.ts` | patterns.estado |
| **Iconos**: `@lucide/angular`, cada componente importa las directivas de sus íconos y los usa como `<svg lucidePlus>` | 5 componentes | patterns.iconos |
| Sin interceptor de errores (necesidad de prioridad alta sin evidencia) | — | recommendations.md "no detectado" (6.1) |
| Material 22 (MDC) con `matButton="filled"` y tema `mat.theme` | templates, `styles.scss` | stack, tokens |

Los conteos exactos están en [`expected.json`](./expected.json).
