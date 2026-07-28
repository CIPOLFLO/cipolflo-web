import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@auth0/auth0-angular';
import { InactivityService } from './inactivity.service';

describe('InactivityService', () => {
  let service: InactivityService;
  let isAuthenticated$: BehaviorSubject<boolean>;
  let logoutMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    isAuthenticated$ = new BehaviorSubject<boolean>(false);
    logoutMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        InactivityService,
        {
          provide: AuthService,
          useValue: {
            isAuthenticated$,
            logout: logoutMock,
          },
        },
      ],
    });

    service = TestBed.inject(InactivityService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('no debería iniciar el monitoreo si el usuario no está autenticado', () => {
    service.iniciar();
    isAuthenticated$.next(false);

    vi.advanceTimersByTime(20 * 60 * 1000 + 1000);

    expect(logoutMock).not.toHaveBeenCalled();
  });

  it('debería cerrar sesión tras 20 minutos de inactividad estando autenticado', () => {
    service.iniciar();
    isAuthenticated$.next(true);

    vi.advanceTimersByTime(20 * 60 * 1000 + 1000);

    expect(logoutMock).toHaveBeenCalledWith({
      logoutParams: {
        returnTo: globalThis.location.origin,
      },
    });
  });

  it('no debería cerrar sesión si hay actividad antes de los 20 minutos', () => {
    service.iniciar();
    isAuthenticated$.next(true);

    vi.advanceTimersByTime(15 * 60 * 1000);
    document.dispatchEvent(new Event('click'));
    vi.advanceTimersByTime(15 * 60 * 1000);

    expect(logoutMock).not.toHaveBeenCalled();
  });

  it('debería cerrar sesión si, tras resetear con actividad, pasan otros 20 minutos completos', () => {
    service.iniciar();
    isAuthenticated$.next(true);

    vi.advanceTimersByTime(10 * 60 * 1000);
    document.dispatchEvent(new Event('mousemove'));
    vi.advanceTimersByTime(20 * 60 * 1000 + 1000);

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('debería detener el monitoreo cuando isAuthenticated$ pasa a false', () => {
    service.iniciar();
    isAuthenticated$.next(true);

    vi.advanceTimersByTime(5 * 60 * 1000);
    isAuthenticated$.next(false);

    vi.advanceTimersByTime(20 * 60 * 1000 + 1000);

    expect(logoutMock).not.toHaveBeenCalled();
  });

  it('no debería iniciar el monitoreo una segunda vez si ya estaba iniciado', () => {
    service.iniciar();
    isAuthenticated$.next(true);

    service.iniciar(); // segunda llamada, debería ser ignorada por el guard

    vi.advanceTimersByTime(20 * 60 * 1000 + 1000);

    expect(logoutMock).toHaveBeenCalledTimes(1); // solo una vez, no duplicado
  });
});
