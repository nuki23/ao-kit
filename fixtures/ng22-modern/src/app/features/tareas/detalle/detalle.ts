import { httpResource } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucidePencil, LucideTrash } from '@lucide/angular';
import { API_URL } from '@core/api-url';
import { Notificaciones } from '@core/notificaciones';
import { EstadoChip } from '@shared/estado-chip/estado-chip';
import { Tarea } from '../data-access/tarea.model';
import { TareasApi } from '../data-access/tareas-api';

@Component({
  selector: 'app-tareas-detalle',
  imports: [RouterLink, MatButtonModule, LucideArrowLeft, LucidePencil, LucideTrash, EstadoChip],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
})
export class Detalle {
  private readonly apiUrl = inject(API_URL);
  private readonly api = inject(TareasApi);
  private readonly notificaciones = inject(Notificaciones);
  private readonly router = inject(Router);

  /** Viene del parámetro `:id` gracias a withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly tarea = httpResource<Tarea>(() => `${this.apiUrl}/tareas/${this.id()}`);

  protected eliminar(): void {
    this.api.eliminar(Number(this.id())).subscribe({
      next: () => {
        this.notificaciones.exito('Tarea eliminada.');
        void this.router.navigate(['/tareas']);
      },
      error: () => this.notificaciones.error('No se pudo eliminar la tarea.'),
    });
  }
}
