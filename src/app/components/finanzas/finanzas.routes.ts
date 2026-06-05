import { Routes } from '@angular/router';

export const FINANZAS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '1',
    pathMatch: 'full',
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-finanza/detalle-finanza').then((m) => m.DetalleFinanza),
  },
  {
    path: ':id/editar',
    redirectTo: ':id',
  },
];
