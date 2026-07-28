import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BreakpointService } from '../services/breakpoint.service';

/**
 * Bloquea el acceso por URL directa desde mobile a módulos sin vista mobile
 * implementada, redirigiendo al listado de reservas (mismo destino que la ruta wildcard).
 */
export const mobileNotImplementedGuard: CanActivateFn = () => {
  const breakpoint = inject(BreakpointService);
  const router = inject(Router);

  return breakpoint.isMobile() ? router.parseUrl('/reservas') : true;
};
