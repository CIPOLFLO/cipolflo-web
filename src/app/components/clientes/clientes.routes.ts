import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./listado-clientes/listado-clientes').then((m) => m.ListadoClientes),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./nuevo-cliente/nuevo-cliente').then((m) => m.NuevoCliente),
  },
  {
    path: 'nueva-empresa',
    loadComponent: () => import('./nueva-empresa/nueva-empresa').then((m) => m.NuevaEmpresa),
  },
  {
    path: ':id/modificar',
    loadComponent: () =>
      import('./modificar-cliente/modificar-cliente').then((m) => m.ModificarCliente),
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle-cliente/detalle-cliente').then((m) => m.DetalleCliente),
  },
];
