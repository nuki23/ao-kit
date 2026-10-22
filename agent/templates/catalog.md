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
