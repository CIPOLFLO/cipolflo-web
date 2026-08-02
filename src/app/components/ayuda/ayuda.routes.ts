import { Routes } from '@angular/router';

export const AYUDA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ayuda/ayuda').then((m) => m.Ayuda),
  },
];
