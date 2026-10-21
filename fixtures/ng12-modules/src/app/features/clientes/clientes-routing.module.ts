import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteDetalleComponent } from './cliente-detalle/cliente-detalle.component';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';
import { ClientesListaComponent } from './clientes-lista/clientes-lista.component';

const routes: Routes = [
  { path: '', component: ClientesListaComponent },
  { path: 'nuevo', component: ClienteFormComponent },
  { path: ':id', component: ClienteDetalleComponent },
  { path: ':id/editar', component: ClienteFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientesRoutingModule {}
