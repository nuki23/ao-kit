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
