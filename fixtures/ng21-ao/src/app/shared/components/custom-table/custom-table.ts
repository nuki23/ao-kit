import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { EmptyState } from '../empty-state/empty-state';

export interface TableColumn<T> {
  key: keyof T & string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-custom-table',
  imports: [NzTableModule, EmptyState],
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTable<T extends { id: string | number }> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly loading = input(false);
  readonly pageSize = input(10);
  readonly emptyText = input('No hay registros para mostrar.');

  /** Paginación en servidor: `data` es solo la página actual y `total` el total de registros. */
  readonly serverPaging = input(false);
  readonly total = input(0);
  readonly pageIndex = input(1);

  readonly rowClick = output<T>();
  readonly pageChange = output<number>();

  protected readonly isEmpty = computed(() => !this.loading() && this.data().length === 0);
}
