import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PedidosListaComponent } from './pedidos-lista/pedidos-lista.component';

const routes: Routes = [{ path: '', component: PedidosListaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PedidosRoutingModule {}
