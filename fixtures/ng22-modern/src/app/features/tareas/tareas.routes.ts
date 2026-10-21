import { Routes } from '@angular/router';

export const TAREAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./listado/listado').then((m) => m.Listado),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./formulario/formulario').then((m) => m.Formulario),
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle/detalle').then((m) => m.Detalle),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./formulario/formulario').then((m) => m.Formulario),
  },
];
