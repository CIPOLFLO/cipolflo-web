import { Routes } from '@angular/router';

export const FINANZAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./listado-finanzas/listado-finanzas').then((m) => m.ListadoFinanzas),
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-finanza/detalle-finanza').then((m) => m.DetalleFinanza),
  },
];
