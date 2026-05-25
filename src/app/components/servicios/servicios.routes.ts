import { Routes } from '@angular/router';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./listado-servicios/listado-servicios').then((m) => m.ListadoServicios),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./nuevo-servicio/nuevo-servicio').then((m) => m.NuevoServicio),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detalle-servicio/detalle-servicio').then((m) => m.DetalleServicio),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./editar-servicio/editar-servicio').then((m) => m.EditarServicio),
  },
];
