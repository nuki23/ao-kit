# Modales

Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>

<!-- ao: un archivo por necesidad con evidencia en index.patterns (o por patrón emergente que el agente decida documentar). Sin evidencia, no hay archivo: la necesidad va a recommendations.md como "No detectado". Título = la necesidad (Iconos, Modales, Notificaciones y errores, Formularios, API, Estado…). -->

## Forma oficial

<!-- ao: approach de index.patterns[necesidad]: fachada, directo, clase base… con conteos. -->

Usa la fachada **`ConfirmService`** (`src/app/shared/services/confirm.service.ts`), que envuelve `NzModalService`.
- `ConfirmService` en 2 archivos · `NzModalService` directo en 1 (excepción).

## API rápida

<!-- ao: solo lo que la fachada o el enfoque expone de verdad, con su archivo:línea. -->

| Para | Llama | Devuelve |
|---|---|---|
| Confirmar una acción | `confirmar({ titulo, mensaje })` (`confirm.service.ts:14`) | `Promise<boolean>` |
| Abrir un componente con datos | `abrir(Componente, data)` (`confirm.service.ts:27`) | resultado de `NzModalRef.close(valor)` |
| Leer los datos dentro del modal | `inject(NZ_MODAL_DATA)` (`contacto-modal.ts:12`) | el `data` que se pasó |

## Ejemplos reales

<!-- ao: 1–2 usos reales con archivo:línea y snippet corto; nunca del showcase, de deprecated ni de código unused. -->

`src/app/pages/proveedores/detalle/detalle.ts:31`
```ts
const ok = await this.confirm.confirmar({ titulo: 'Eliminar proveedor', mensaje: '¿Seguro?' });
if (ok) this.eliminar();
```

## Excepciones

<!-- ao: exceptions[] del índice, cada una con archivo:línea. Si se sabe por qué, decirlo; si no, no inventarlo. -->

- `src/app/pages/proveedores/listado/listado.ts:44`: usa `NzModalService.info` directo.

## Qué no hacer

- No inyectes `NzModalService` en una página: usa `ConfirmService`.
- No leas los datos del modal con `this.modalRef.getConfig().nzData`: usa `inject(NZ_MODAL_DATA)` como en `contacto-modal.ts:12`.
