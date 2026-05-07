import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { PageLayout } from './page-layout';

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

describe('PageLayout', () => {
  let component: PageLayout;
  let fixture: ComponentFixture<PageLayout>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayout],
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
