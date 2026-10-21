import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Observable, tap } from 'rxjs';
import { NuevaSolicitud, Solicitud, SolicitudesService } from '@core/services/solicitudes.service';

interface SolicitudesState {
  solicitudes: Solicitud[];
  cargando: boolean;
}

/** Estado del feature con @ngrx/signals; se provee en SolicitudesComponent. */
export const SolicitudesStore = signalStore(
  withState<SolicitudesState>({ solicitudes: [], cargando: false }),
  withComputed(({ solicitudes }) => ({
    pendientes: computed(() => solicitudes().filter((s) => s.estado === 'pendiente').length),
  })),
  withMethods((store, service = inject(SolicitudesService)) => {
    const cargar = (): void => {
      patchState(store, { cargando: true });
      service.listar().subscribe({
        next: (solicitudes) => patchState(store, { solicitudes, cargando: false }),
        error: () => patchState(store, { cargando: false }),
      });
    };
    const crear = (body: NuevaSolicitud): Observable<Solicitud> =>
      service.crear(body).pipe(tap(() => cargar()));
    return { cargar, crear };
  }),
);
