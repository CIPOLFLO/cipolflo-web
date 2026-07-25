import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { mobileNotImplementedGuard } from './mobile-not-implemented.guard';
import { BreakpointService } from '../services/breakpoint.service';

describe('mobileNotImplementedGuard', () => {
  let router: Router;

  function configure(isMobile: boolean): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: BreakpointService, useValue: { isMobile: () => isMobile } },
      ],
    });
    router = TestBed.inject(Router);
  }

  it('permite el acceso cuando no es mobile', () => {
    configure(false);

    const result = TestBed.runInInjectionContext(() =>
      mobileNotImplementedGuard({} as never, { url: '/finanzas' } as never),
    );

    expect(result).toBe(true);
  });

  it('redirige a /reservas cuando es mobile', () => {
    configure(true);

    const result = TestBed.runInInjectionContext(() =>
      mobileNotImplementedGuard({} as never, { url: '/finanzas' } as never),
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/reservas');
  });
});
