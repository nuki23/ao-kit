import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CustomTable, TableColumn } from '@shared/components/custom-table/custom-table';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { PageHeader } from '@shared/components/page-header/page-header';

interface Ejemplo {
  id: number;
  nombre: string;
  categoria: string;
}

/** Showcase de los componentes compartidos (documentación ejecutable). */
@Component({
  selector: 'app-ejemplos',
  imports: [PageHeader, CustomTable, EmptyState],
  templateUrl: './ejemplos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ejemplos {
  protected readonly clics = signal(0);

  protected readonly columns: TableColumn<Ejemplo>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'categoria', header: 'Categoría', width: '200px' },
  ];

  protected readonly filas: Ejemplo[] = [
    { id: 1, nombre: 'Elemento uno', categoria: 'A' },
    { id: 2, nombre: 'Elemento dos', categoria: 'B' },
    { id: 3, nombre: 'Elemento tres', categoria: 'A' },
  ];

  protected sumar(): void {
    this.clics.update((n) => n + 1);
  }
}
