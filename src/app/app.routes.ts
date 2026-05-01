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
			import('../components/reservas/listado-reservas/listado-reservas').then(
				(module) => module.ListadoReservas,
			),
	},
	{
		path: '**',
		redirectTo: 'reservas',
	},
];
