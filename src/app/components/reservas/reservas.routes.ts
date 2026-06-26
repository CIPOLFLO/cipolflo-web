import { Routes } from '@angular/router';

export const RESERVAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./listado-reservas/listado-reservas').then((m) => m.ListadoReservas),
  },
  {
    path: 'nueva',
    loadComponent: () => import('./nueva-reserva/nueva-reserva').then((m) => m.NuevaReserva),
  },
  {
    path: ':id/modificar',
    loadComponent: () =>
      import('./editar-reserva/editar-reserva').then((m) => m.EditarReserva),
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-reserva/detalle-reserva').then((m) => m.DetalleReserva),
  },
];
