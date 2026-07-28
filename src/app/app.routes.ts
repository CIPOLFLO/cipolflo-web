import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { mobileNotImplementedGuard } from './core/guards/mobile-not-implemented.guard';

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
        canActivate: [mobileNotImplementedGuard],
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
        canActivate: [mobileNotImplementedGuard],
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
        canActivate: [mobileNotImplementedGuard],
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
