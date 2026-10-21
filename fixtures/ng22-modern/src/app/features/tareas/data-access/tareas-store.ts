import { Service, computed, signal } from '@angular/core';
import { EstadoTarea } from './tarea.model';

export type FiltroEstado = EstadoTarea | 'todas';

/** Estado del feature con signals (sin NgRx): filtro activo y tareas seleccionadas. */
@Service()
export class TareasStore {
  private readonly _filtro = signal<FiltroEstado>('todas');
  private readonly _seleccion = signal<ReadonlySet<number>>(new Set());

  readonly filtro = this._filtro.asReadonly();
  readonly seleccion = this._seleccion.asReadonly();
  readonly totalSeleccionadas = computed(() => this._seleccion().size);

  filtrar(filtro: FiltroEstado): void {
    this._filtro.set(filtro);
    this._seleccion.set(new Set());
  }

  alternar(id: number): void {
    this._seleccion.update((actual) => {
      const nueva = new Set(actual);
      if (nueva.has(id)) {
        nueva.delete(id);
      } else {
        nueva.add(id);
      }
      return nueva;
    });
  }

  limpiarSeleccion(): void {
    this._seleccion.set(new Set());
  }
}
