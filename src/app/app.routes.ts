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
        path: 'reservas',
        loadComponent: () =>
          import('./components/reservas/listado-reservas/listado-reservas').then(
            (module) => module.ListadoReservas,
          ),
      },
      {
        path: 'reservas/:id',
        loadComponent: () =>
          import('./components/reservas/detalle-reserva/detalle-reserva').then(
            (module) => module.DetalleReserva,
          ),
      },
      {
        path: 'reservas/:id/editar',
        loadComponent: () =>
          import('./components/reservas/editar-reserva/editar-reserva').then(
            (module) => module.EditarReserva,
          ),
      },
      {
        path: 'servicios',
        loadChildren: () =>
          import('./components/servicios/servicios.routes').then((m) => m.SERVICIOS_ROUTES),
      },
    ],
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./components/clientes/listado-clientes/listado-clientes').then(
        (module) => module.ListadoClientes,
      ),
  },
  {
    path: 'clientes/nuevo',
    loadComponent: () =>
      import('./components/clientes/nuevo-cliente/nuevo-cliente').then((m) => m.NuevoCliente),
  },
  {
    path: 'clientes/:id',
    loadComponent: () =>
      import('./components/clientes/detalle-cliente/detalle-cliente').then((m) => m.DetalleCliente),
  },
  {
    path: '**',
    redirectTo: 'reservas',
  },
];
