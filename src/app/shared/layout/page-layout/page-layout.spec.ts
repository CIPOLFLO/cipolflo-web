import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { PageLayout } from './page-layout';
import { of } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';
import { BreakpointService } from '../../../core/services/breakpoint.service';

@Component({
  template: `
    <app-page-layout
      pageTitle="Listado de Reservas"
      pageDescription="Gestión del módulo de reservas"
      [showBackButton]="showBackButton()"
      [backButtonLink]="backButtonLink()"
    >
      <button actions>Exportar</button>
      <button actions>+ Nueva Reserva</button>

      <div class="test-content">Contenido de la página</div>
    </app-page-layout>
  `,
  imports: [PageLayout],
})
class TestHostPageLayout {
  showBackButton = signal(false);
  backButtonLink = signal('/');
}
const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
  logout: vi.fn(),
};

const mockUserService = {
  userInitials: () => 'JP',
  userEmail: () => 'juan@example.com',
};

describe('PageLayout', () => {
  let component: PageLayout;
  let fixture: ComponentFixture<PageLayout>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayout],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageLayout);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('SubHeader propagation', () => {
    it('should pass pageTitle to SubHeader', () => {
      fixture.componentRef.setInput('pageTitle', 'Mi Página');
      fixture.detectChanges();

      const title = el.querySelector('.sub-header__title');
      expect(title?.textContent?.trim()).toBe('Mi Página');
    });

    it('should pass pageDescription to SubHeader', () => {
      fixture.componentRef.setInput('pageDescription', 'Una descripción útil');
      fixture.detectChanges();

      const desc = el.querySelector('.sub-header__description');
      expect(desc?.textContent?.trim()).toBe('Una descripción útil');
    });

    it('should propagate showBackButton to SubHeader', () => {
      fixture.componentRef.setInput('showBackButton', false);
      fixture.detectChanges();
      expect(el.querySelector('.sub-header__back-button')).toBeNull();

      fixture.componentRef.setInput('showBackButton', true);
      fixture.detectChanges();
      expect(el.querySelector('.sub-header__back-button')).not.toBeNull();
    });

    it('should propagate backButtonLink to SubHeader', () => {
      fixture.componentRef.setInput('showBackButton', true);
      fixture.componentRef.setInput('backButtonLink', '/clientes');
      fixture.detectChanges();

      const link = el.querySelector<HTMLAnchorElement>('.sub-header__back-button');
      expect(link?.getAttribute('href')).toBe('/clientes');
    });
  });

  describe('content projection', () => {
    it('should render default content in .page-layout__content', () => {
      const content = el.querySelector('.page-layout__content');
      expect(content).not.toBeNull();
    });
  });
});

describe('PageLayout - actions and content projection', () => {
  let hostFixture: ComponentFixture<TestHostPageLayout>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostPageLayout],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostPageLayout);
    hostFixture.detectChanges();
    hostEl = hostFixture.nativeElement;
  });

  it('should re-project [actions] slot to SubHeader', () => {
    const subHeaderActions = hostEl.querySelector('.sub-header__actions');
    const buttons = subHeaderActions?.querySelectorAll('button[actions]');
    expect(buttons?.length).toBe(2);
  });

  it('should render action button labels correctly', () => {
    const buttons = hostEl.querySelectorAll('.sub-header__actions button');
    expect(buttons[0].textContent?.trim()).toBe('Exportar');
    expect(buttons[1].textContent?.trim()).toBe('+ Nueva Reserva');
  });

  it('should project default ng-content inside .page-layout__content', () => {
    const content = hostEl.querySelector('.page-layout__content');
    const testContent = content?.querySelector('.test-content');
    expect(testContent?.textContent?.trim()).toBe('Contenido de la página');
  });

  it('should render default content below SubHeader', () => {
    const contentDiv = hostEl.querySelector('.test-content');
    expect(contentDiv?.textContent?.trim()).toBe('Contenido de la página');
  });

  it('should render both SubHeader and content area', () => {
    const subHeader = hostEl.querySelector('app-sub-header');
    const contentArea = hostEl.querySelector('.page-layout__content');
    const testContent = hostEl.querySelector('.test-content');

    expect(subHeader).not.toBeNull();
    expect(contentArea).not.toBeNull();
    expect(testContent).not.toBeNull();
    expect(contentArea?.contains(testContent)).toBe(true);
  });

  it('should propagate showBackButton through the component hierarchy', () => {
    hostFixture.componentInstance.showBackButton.set(false);
    hostFixture.detectChanges();
    expect(hostEl.querySelector('.sub-header__back-button')).toBeNull();

    hostFixture.componentInstance.showBackButton.set(true);
    hostFixture.detectChanges();
    expect(hostEl.querySelector('.sub-header__back-button')).not.toBeNull();
  });

  it('should propagate backButtonLink through the component hierarchy', () => {
    hostFixture.componentInstance.showBackButton.set(true);
    hostFixture.componentInstance.backButtonLink.set('/reservas');
    hostFixture.detectChanges();

    const link = hostEl.querySelector<HTMLAnchorElement>('.sub-header__back-button');
    expect(link?.getAttribute('href')).toBe('/reservas');
  });
});

describe('PageLayout - vista mobile', () => {
  let fixture: ComponentFixture<PageLayout>;
  let el: HTMLElement;

  const mockBreakpointMobile = { isMobile: () => true };

  beforeEach(async () => {
    mockAuthService.logout.mockClear();

    await TestBed.configureTestingModule({
      imports: [PageLayout],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: BreakpointService, useValue: mockBreakpointMobile },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageLayout);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debería renderizar el header y el sidebar mobile, no el sub-header de desktop', () => {
    expect(el.querySelector('app-mob-page-header')).not.toBeNull();
    expect(el.querySelector('app-mob-sidebar')).not.toBeNull();
    expect(el.querySelector('app-sub-header')).toBeNull();
  });

  it('el sidebar arranca cerrado y se abre al togglear el menú del header', () => {
    // El drawer de PrimeNG se monta en document.body solo cuando está visible
    expect(document.body.querySelector('.mob-sidebar')).toBeNull();

    const menuBtn = el.querySelector('.mob-header__menu-btn') as HTMLButtonElement;
    menuBtn.click();
    fixture.detectChanges();

    expect(document.body.querySelector('.mob-sidebar')).not.toBeNull();
  });

  it('debería cerrar el sidebar al hacer click en un ítem de navegación', () => {
    (el.querySelector('.mob-header__menu-btn') as HTMLButtonElement).click();
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
    (el.querySelector('.mob-header__menu-btn') as HTMLButtonElement).click();
    fixture.detectChanges();

    const logoutBtn = document.body.querySelector('.mob-sidebar__logout') as HTMLButtonElement;
    logoutBtn.click();

    expect(mockAuthService.logout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    });
  });
});
