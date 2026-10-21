import { httpResource } from '@angular/common/http';
import { Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { LucidePlus } from '@lucide/angular';
import { API_URL } from '@core/api-url';
import { Notificaciones } from '@core/notificaciones';
import { EstadoChip } from '@shared/estado-chip/estado-chip';
import { Tarea } from '../data-access/tarea.model';
import { FiltroEstado, TareasStore } from '../data-access/tareas-store';

@Component({
  selector: 'app-tareas-listado',
  imports: [RouterLink, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, LucidePlus, EstadoChip],
  templateUrl: './listado.html',
  styleUrl: './listado.scss',
})
export class Listado {
  private readonly apiUrl = inject(API_URL);
  private readonly notificaciones = inject(Notificaciones);
  protected readonly store = inject(TareasStore);

  protected readonly filtros: { valor: FiltroEstado; etiqueta: string }[] = [
    { valor: 'todas', etiqueta: 'Todas' },
    { valor: 'pendiente', etiqueta: 'Pendientes' },
    { valor: 'en-curso', etiqueta: 'En curso' },
    { valor: 'hecha', etiqueta: 'Hechas' },
  ];

  protected readonly claseBase = { lista__item: true };

  protected readonly tareas = httpResource<Tarea[]>(
    () => {
      const filtro = this.store.filtro();
      return {
        url: `${this.apiUrl}/tareas`,
        params: filtro === 'todas' ? undefined : { estado: filtro },
      };
    },
    { defaultValue: [] },
  );

  private readonly avisarError = effect(() => {
    if (this.tareas.error()) {
      this.notificaciones.error('No se pudieron cargar las tareas.');
    }
  });
}
