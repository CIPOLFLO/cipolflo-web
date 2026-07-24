import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'reservas',
  },
  {
    path: '',
    canActivate: [authGuardFn],
    children: [
      {
        path: 'servicios',
        loadChildren: () =>
          import('./components/servicios/servicios.routes').then((m) => m.SERVICIOS_ROUTES),
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./components/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
      },
      {
        path: 'finanzas',
        loadChildren: () =>
          import('./components/finanzas/finanzas.routes').then((m) => m.FINANZAS_ROUTES),
      },
      {
        path: 'reservas',
        loadChildren: () =>
          import('./components/reservas/reservas.routes').then((m) => m.RESERVAS_ROUTES),
      },
      {
        path: 'ajustes',
        loadChildren: () =>
          import('./components/ajustes/ajustes.routes').then((m) => m.AJUSTES_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'reservas',
  },
];
