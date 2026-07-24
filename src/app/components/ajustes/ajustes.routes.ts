import { Routes } from '@angular/router';

export const AJUSTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ajustes/ajustes').then((m) => m.Ajustes),
  },
];
