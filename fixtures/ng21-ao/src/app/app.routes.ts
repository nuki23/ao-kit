import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'proveedores' },
  {
    path: 'proveedores',
    loadChildren: () =>
      import('./pages/proveedores/proveedores.routes').then((m) => m.PROVEEDORES_ROUTES),
  },
  {
    path: 'ejemplos',
    loadComponent: () => import('./pages/ejemplos/ejemplos').then((m) => m.Ejemplos),
  },
  { path: '**', redirectTo: 'proveedores' },
];
