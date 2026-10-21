import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tareas' },
  {
    path: 'tareas',
    loadChildren: () => import('./features/tareas/tareas.routes').then((m) => m.TAREAS_ROUTES),
  },
  { path: '**', redirectTo: 'tareas' },
];
