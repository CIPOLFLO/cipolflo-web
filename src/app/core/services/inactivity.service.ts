import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Subscription, fromEvent, merge, timer } from 'rxjs';
import { startWith, switchMap, tap } from 'rxjs/operators';

const MINUTOS_INACTIVIDAD = 20;
const TIEMPO_LIMITE_MS = MINUTOS_INACTIVIDAD * 60 * 1000;

const EVENTOS_ACTIVIDAD = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

@Injectable({ providedIn: 'root' })
export class InactivityService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly ngZone = inject(NgZone);

  private suscripcionActividad?: Subscription;
  private suscripcionAuth?: Subscription;

  public iniciar(): void {
    if (this.suscripcionAuth) {
      return;
    }

    this.suscripcionAuth = this.authService.isAuthenticated$
      .pipe(
        switchMap((autenticado) => {
          this.detenerMonitoreo();

          if (autenticado) {
            this.iniciarMonitoreo();
          }

          return [];
        }),
      )
      .subscribe();
  }

  private iniciarMonitoreo(): void {
    this.ngZone.runOutsideAngular(() => {
      const actividad$ = merge(
        ...EVENTOS_ACTIVIDAD.map((evento) => fromEvent(document, evento)),
      ).pipe(
        startWith(null), // arranca el timer inmediatamente, sin esperar la primera actividad
      );

      this.suscripcionActividad = actividad$
        .pipe(
          switchMap(() => timer(TIEMPO_LIMITE_MS)),
          tap(() => this.ngZone.run(() => this.cerrarSesionPorInactividad())),
        )
        .subscribe();
    });
  }

  private detenerMonitoreo(): void {
    this.suscripcionActividad?.unsubscribe();
    this.suscripcionActividad = undefined;
  }

  private cerrarSesionPorInactividad(): void {
    this.detenerMonitoreo();
    this.authService.logout({
      logoutParams: {
        returnTo: globalThis.location.origin,
      },
    });
  }

  public ngOnDestroy(): void {
    this.suscripcionActividad?.unsubscribe();
    this.suscripcionAuth?.unsubscribe();
  }
}
