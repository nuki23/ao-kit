import { httpResource } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormField, form, minLength, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { LucideCheck } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '@core/api-url';
import { Notificaciones } from '@core/notificaciones';
import { Categoria, Tarea, TareaPayload } from '../data-access/tarea.model';
import { TareasApi } from '../data-access/tareas-api';
import { fechaFutura } from '../validators/fecha-futura';

@Component({
  selector: 'app-tareas-formulario',
  imports: [
    RouterLink,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LucideCheck,
  ],
  templateUrl: './formulario.html',
  styleUrl: './formulario.scss',
})
export class Formulario {
  private readonly apiUrl = inject(API_URL);
  private readonly api = inject(TareasApi);
  private readonly notificaciones = inject(Notificaciones);
  private readonly router = inject(Router);

  /** Viene del parámetro `:id` (solo al editar). */
  readonly id = input<string>();

  protected readonly categorias = httpResource<Categoria[]>(() => `${this.apiUrl}/categorias`, {
    defaultValue: [],
  });

  private readonly existente = httpResource<Tarea>(() => {
    const id = this.id();
    return id ? `${this.apiUrl}/tareas/${id}` : undefined;
  });

  protected readonly modelo = signal<TareaPayload>({
    titulo: '',
    descripcion: '',
    categoriaId: '',
    vence: '',
    estado: 'pendiente',
  });

  protected readonly form = form(this.modelo, (p) => {
    required(p.titulo, { message: 'El título es obligatorio' });
    minLength(p.titulo, 3, { message: 'Usa al menos 3 caracteres' });
    required(p.categoriaId, { message: 'Elige una categoría' });
    required(p.vence, { message: 'La fecha es obligatoria' });
    fechaFutura(p.vence);
  });

  private readonly cargarExistente = effect(() => {
    const tarea = this.existente.value();
    if (tarea) {
      const { id: _id, ...payload } = tarea;
      this.modelo.set(payload);
    }
  });

  protected async guardar(): Promise<void> {
    await submit(this.form, async () => {
      const id = this.id();
      const peticion = id
        ? this.api.actualizar(Number(id), this.modelo())
        : this.api.crear(this.modelo());
      try {
        const tarea = await firstValueFrom(peticion);
        this.notificaciones.exito('Tarea guardada.');
        void this.router.navigate(['/tareas', tarea.id]);
      } catch {
        this.notificaciones.error('No se pudo guardar la tarea.');
      }
      return undefined;
    });
  }
}
