import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CustomTable, TableColumn } from '@shared/components/custom-table/custom-table';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Proveedor } from '../data-access/proveedor.model';
import { ProveedoresService } from '../data-access/proveedores.service';

@Component({
  selector: 'app-proveedores-listado',
  imports: [NzInputModule, PageHeader, CustomTable, EmptyState],
  templateUrl: './listado.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Listado {
  private readonly service = inject(ProveedoresService);
  private readonly router = inject(Router);

  protected readonly proveedores = rxResource({ stream: () => this.service.listar() });
  protected readonly filtro = signal('');

  protected readonly filtrados = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    const lista = this.proveedores.value() ?? [];
    return q ? lista.filter((p) => p.nombre.toLowerCase().includes(q)) : lista;
  });

  protected readonly columns: TableColumn<Proveedor>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'documento', header: 'Documento', width: '160px' },
    { key: 'ciudad', header: 'Ciudad', width: '160px' },
  ];

  protected crear(): void {
    void this.router.navigate(['/proveedores/nuevo']);
  }

  protected ver(proveedor: Proveedor): void {
    void this.router.navigate(['/proveedores', proveedor.id]);
  }
}
