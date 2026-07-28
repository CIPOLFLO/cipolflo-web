import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, provideAuth0 } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { App } from './app';
import { BreakpointService } from './core/services/breakpoint.service';
import { SidebarService } from './core/services/sidebar.service';
import { UserService } from './core/services/user.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideAuth0({
          domain: 'test.auth0.com',
          clientId: 'test-client-id',
          authorizationParams: { redirect_uri: 'http://localhost' },
        }),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

describe('App - sidebar mobile', () => {
  const mockAuthService = {
    user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
    isAuthenticated$: of(true),
    logout: vi.fn(),
  };

  const mockUserService = {
    userInitials: () => 'JP',
    userEmail: () => 'juan@example.com',
  };

  const mockBreakpointMobile = { isMobile: () => true };

  let fixture: ReturnType<typeof TestBed.createComponent<App>>;
  let sidebar: SidebarService;

  beforeEach(async () => {
    mockAuthService.logout.mockClear();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: BreakpointService, useValue: mockBreakpointMobile },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    sidebar = TestBed.inject(SidebarService);
    fixture.detectChanges();
  });

  it('renderiza el sidebar mobile', () => {
    expect(fixture.nativeElement.querySelector('app-mob-sidebar')).not.toBeNull();
  });

  it('el sidebar arranca cerrado y se muestra al abrirlo vía servicio', () => {
    // El drawer de PrimeNG se monta en document.body solo cuando está visible
    expect(document.body.querySelector('.mob-sidebar')).toBeNull();

    sidebar.open();
    fixture.detectChanges();

    expect(document.body.querySelector('.mob-sidebar')).not.toBeNull();
  });

  it('debería cerrar el sidebar al hacer click en un ítem de navegación', () => {
    sidebar.open();
    fixture.detectChanges();
    expect(document.body.querySelector('.mob-sidebar')).not.toBeNull();

    // ctrlKey evita que RouterLink navegue (la navegación async correría tras destruirse
    // el TestBed) y preventDefault evita que jsdom intente navegar por el <a href>;
    // el handler (click)="closed.emit()" igual cierra el sidebar.
    const navItem = document.body.querySelector('.mob-sidebar__nav-item') as HTMLAnchorElement;
    navItem.addEventListener('click', (e) => e.preventDefault(), { once: true });
    navItem.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
    );
    fixture.detectChanges();

    expect(document.body.querySelector('.mob-sidebar')).toBeNull();
  });

  it('debería desloguear al hacer click en Cerrar Sesión del sidebar', () => {
    sidebar.open();
    fixture.detectChanges();

    const logoutBtn = document.body.querySelector('.mob-sidebar__logout') as HTMLButtonElement;
    logoutBtn.click();

    expect(mockAuthService.logout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    });
  });
});
