import { Routes } from '@angular/router';

export const FINANZAS_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./detalle-finanza/detalle-finanza').then((m) => m.DetalleFinanza),
  },
];
