import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ClienteDetalleComponent } from './cliente-detalle/cliente-detalle.component';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';
import { ClientesListaComponent } from './clientes-lista/clientes-lista.component';
import { ClientesRoutingModule } from './clientes-routing.module';

@NgModule({
  declarations: [ClientesListaComponent, ClienteFormComponent, ClienteDetalleComponent],
  imports: [SharedModule, ClientesRoutingModule],
})
export class ClientesModule {}
