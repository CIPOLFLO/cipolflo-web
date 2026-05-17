import { Routes } from '@angular/router';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./listado-servicios/listado-servicios').then((m) => m.ListadoServicios),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle-servicios/detalle-servicios').then((m) => m.DetalleServicios),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./editar-servicios/editar-servicios').then((m) => m.EditarServicios),
  },
];
