---
# ao: frontmatter de la ficha (esquema en 3.2). Lo escribe /ao:init desde el índice; /ao:sync compara el hash.
selector: mimi-select
source: src/app/shared/components/ui/mimi-select/
kind: wrapper            # wrapper | slot-container | component
wraps: nz-select         # solo si kind: wrapper
hash: <hash del componente en index.json>
usedIn: 3                # usos reales (sin showcase ni deprecated)
---

# mimi-select

Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>

<!-- ao: no se generan fichas de componentes kind "unused". Secciones en este orden; "Qué envuelve" y "Contrato observado" solo para kind wrapper. -->

| | |
|---|---|
| Archivo | `src/app/shared/components/ui/mimi-select/mimi-select.component.ts` |
| Import | `import { MimiSelectComponent } from '<alias o ruta relativa>';` <!-- ao: o el NgModule que lo exporta --> |
| Usos | 3 en 3 archivos: `pages/pagos` 1 · `pages/perfil` 1 · `pages/solicitudes` 1 |

## Qué envuelve

Envuelve `nz-select` de ng-zorro-antd. Es wrapper porque cumple los 3 criterios:
- (a) proyecta `nz-select` en 3 de 3 usos;
- (b) sus estilos sobrescriben `.ant-select` (`mimi-select.component.scss:13`);
- (c) el `nz-select` proyectado lleva el atributo `mimi-select` (3 de 3).

Nunca uses `nz-select` suelto en una página: va siempre dentro de `mimi-select`.

## API

<!-- ao: inputs, outputs y slots del componente. "Uso real" es un valor que aparece en el repo, con archivo:línea. -->

| Input / output / slot | Tipo | Default | Uso real |
|---|---|---|---|
| slot por defecto | `nz-select` con `mimi-select` | — | ver "Usos reales" |

No tiene inputs ni outputs: la configuración va en el `nz-select` proyectado (ver "Contrato observado"). <!-- ao: si los tiene, una fila por input/output con su tipo, default y un valor real con archivo:línea -->



## Contrato observado

<!-- ao: solo kind wrapper. Sale de index.components[].contract: cada pieza (atributo o directiva del elemento proyectado, binding, elemento hermano) con su presencia sobre todos los usos reales. Obligatoria = presente en todos. Si una pieza es un atributo inerte (index.inertAttributes), se marca así. -->

Lo que llevan todos los usos reales (3). Copia las obligatorias tal cual.

| Pieza | Dónde | Obligatoria | Presencia |
|---|---|---|---|
| `mimi-select` | atributo en `nz-select` | sí | 3/3 |
| `inputEffectDirective` | directiva en `nz-select` | sí | 3/3 |
| `mimiType="outline"` | directiva en `nz-select` | sí | 3/3 |
| `formControlName` | directiva en `nz-select` | sí | 3/3 |
| `[nzOptionHeightPx]="42"` | binding en `nz-select` | sí | 3/3 |
| `[ngClass]="{ 'input-error': …, fill: … }"` | binding en `nz-select` | sí | 3/3 |
| `nzShowSearch` | atributo en `nz-select` | no | 2/3 |
| `appAutoFocus` | atributo en `nz-select` | no — **inerte**: se escribe, no tiene efecto | 1/3 |

## Usos reales

<!-- ao: 2–3 usos de index.usages[].representative, con archivo:línea y el snippet completo (atributos y directivas incluidos). Nunca del showcase. -->

`src/app/pages/pagos/pagos.component.html:5`
```html
<mimi-select>
  <nz-select
    mimi-select
    inputEffectDirective
    mimiType="outline"
    formControlName="banco"
    nzShowSearch
    nzPlaceHolder="Selecciona tu banco"
    [nzOptionHeightPx]="42"
    [nzOptionOverflowSize]="10"
    [ngClass]="{ 'input-error': form.controls.banco.invalid && form.controls.banco.dirty, fill: form.controls.banco.value }"
  >
    …
  </nz-select>
</mimi-select>
```

## Qué hacer

- Usa `mimi-select` para cualquier select del formulario, con todas las piezas obligatorias del contrato.
- Para búsqueda, agrega `nzShowSearch` (como en `pages/pagos/pagos.component.html:11`).

## Qué no hacer

- No uses `nz-select` sin `mimi-select` (0 usos así en el repo).
- No escribas estilos de `.ant-select` en el SCSS de la página: van solo en el wrapper.
- No copies `appAutoFocus`: no hay directiva con ese selector en el repo.
