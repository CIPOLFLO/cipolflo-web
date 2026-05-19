import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'reservas',
  },
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
  {
    path: '**',
    redirectTo: 'reservas',
  },
];
