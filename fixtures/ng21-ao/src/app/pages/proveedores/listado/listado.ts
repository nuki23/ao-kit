import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CustomTable, TableColumn } from '@shared/components/custom-table/custom-table';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Proveedor } from '../data-access/proveedor.model';
import { ProveedoresService } from '../data-access/proveedores.service';

@Component({
  selector: 'app-proveedores-listado',
  imports: [NzButtonModule, NzInputModule, PageHeader, CustomTable, EmptyState],
  templateUrl: './listado.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Listado {
  private readonly service = inject(ProveedoresService);
  private readonly router = inject(Router);
  // Excepción: ayuda informativa con NzModalService directo, sin pasar por ConfirmService.
  private readonly modal = inject(NzModalService);

  protected readonly pagina = signal(1);
  protected readonly tamano = signal(10);
  protected readonly filtro = signal('');

  protected readonly proveedores = rxResource({
    params: () => ({ pagina: this.pagina(), tamano: this.tamano(), q: this.filtro().trim() }),
    stream: ({ params }) => this.service.listarPagina(params),
  });

  protected readonly columns: TableColumn<Proveedor>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'documento', header: 'Documento', width: '160px' },
    { key: 'ciudad', header: 'Ciudad', width: '160px' },
  ];

  protected buscar(texto: string): void {
    this.filtro.set(texto);
    this.pagina.set(1);
  }

  protected ayuda(): void {
    this.modal.info({
      nzTitle: 'Cómo buscar proveedores',
      nzContent: 'Escribe parte del nombre; la búsqueda se hace en el servidor y respeta la página actual.',
    });
  }

  protected crear(): void {
    void this.router.navigate(['/proveedores/nuevo']);
  }

  protected ver(proveedor: Proveedor): void {
    void this.router.navigate(['/proveedores', proveedor.id]);
  }
}
