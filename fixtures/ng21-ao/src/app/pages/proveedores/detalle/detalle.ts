import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { ProveedoresService } from '../data-access/proveedores.service';

@Component({
  selector: 'app-proveedores-detalle',
  imports: [
    RouterLink,
    NzButtonModule,
    NzDescriptionsModule,
    NzPopconfirmModule,
    NzTagModule,
    PageHeader,
    EmptyState,
  ],
  templateUrl: './detalle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Detalle {
  private readonly service = inject(ProveedoresService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly proveedor = rxResource({
    params: () => ({ id: Number(this.id()) }),
    stream: ({ params }) => this.service.obtener(params.id),
  });

  protected eliminar(): void {
    this.service.eliminar(Number(this.id())).subscribe(() => void this.router.navigate(['/proveedores']));
  }
}
