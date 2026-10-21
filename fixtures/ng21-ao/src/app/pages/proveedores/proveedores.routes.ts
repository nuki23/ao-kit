import { Routes } from '@angular/router';

export const PROVEEDORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./listado/listado').then((m) => m.Listado),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./crear-editar/crear-editar').then((m) => m.CrearEditar),
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle/detalle').then((m) => m.Detalle),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./crear-editar/crear-editar').then((m) => m.CrearEditar),
  },
];
