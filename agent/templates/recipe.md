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
