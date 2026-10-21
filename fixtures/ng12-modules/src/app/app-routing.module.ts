import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clientes' },
  {
    path: 'clientes',
    loadChildren: () => import('./features/clientes/clientes.module').then((m) => m.ClientesModule),
  },
  {
    path: 'pedidos',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/pedidos/pedidos.module').then((m) => m.PedidosModule),
  },
  { path: '**', redirectTo: 'clientes' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
