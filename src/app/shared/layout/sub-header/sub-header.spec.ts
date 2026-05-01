import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SubHeader } from './sub-header';

@Component({
  template: `
    <app-sub-header pageTitle="Listado" pageDescription="Descripción">
      <button actions>Exportar</button>
      <button actions>Nueva Reserva</button>
    </app-sub-header>
  `,
  imports: [SubHeader],
})
class TestHostWithActions {}

describe('SubHeader', () => {
  let component: SubHeader;
  let fixture: ComponentFixture<SubHeader>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(SubHeader);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('title', () => {
    it('should render the given title', () => {
      fixture.componentRef.setInput('pageTitle', 'Nueva Reserva');
      fixture.detectChanges();

      const title = el.querySelector('.sub-header__title');
      expect(title?.textContent?.trim()).toBe('Nueva Reserva');
    });

    it('should update the title when input changes', () => {
      fixture.componentRef.setInput('pageTitle', 'Listado de Reservas');
      fixture.detectChanges();
      expect(el.querySelector('.sub-header__title')?.textContent?.trim()).toBe(
        'Listado de Reservas',
      );

      fixture.componentRef.setInput('pageTitle', 'Clientes');
      fixture.detectChanges();
      expect(el.querySelector('.sub-header__title')?.textContent?.trim()).toBe('Clientes');
    });
  });

  describe('description', () => {
    it('should render the given description', () => {
      fixture.componentRef.setInput(
        'pageDescription',
        'Complete los datos para crear una nueva reserva',
      );
      fixture.detectChanges();

      const desc = el.querySelector('.sub-header__description');
      expect(desc?.textContent?.trim()).toBe('Complete los datos para crear una nueva reserva');
    });
  });

  describe('back button', () => {
    it('should not render the back button by default', () => {
      expect(el.querySelector('.sub-header__back-button')).toBeNull();
    });

    it('should render the back button when showBackButton is true', () => {
      fixture.componentRef.setInput('showBackButton', true);
      fixture.detectChanges();

      expect(el.querySelector('.sub-header__back-button')).not.toBeNull();
    });

    it('should hide the back button when showBackButton is false', () => {
      fixture.componentRef.setInput('showBackButton', true);
      fixture.detectChanges();
      expect(el.querySelector('.sub-header__back-button')).not.toBeNull();

      fixture.componentRef.setInput('showBackButton', false);
      fixture.detectChanges();
      expect(el.querySelector('.sub-header__back-button')).toBeNull();
    });

    it('should set the href from backButtonLink', () => {
      fixture.componentRef.setInput('showBackButton', true);
      fixture.componentRef.setInput('backButtonLink', '/reservas');
      fixture.detectChanges();

      const link = el.querySelector<HTMLAnchorElement>('.sub-header__back-button');
      expect(link?.getAttribute('href')).toBe('/reservas');
    });

    it('should default href to "/" when backButtonLink is not provided', () => {
      fixture.componentRef.setInput('showBackButton', true);
      fixture.detectChanges();

      const link = el.querySelector<HTMLAnchorElement>('.sub-header__back-button');
      expect(link?.getAttribute('href')).toBe('/');
    });
  });
});

describe('SubHeader - content projection', () => {
  let hostFixture: ComponentFixture<TestHostWithActions>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostWithActions],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostWithActions);
    hostFixture.detectChanges();
    el = hostFixture.nativeElement;
  });

  it('should project action buttons into the actions slot', () => {
    const actions = el.querySelector('.sub-header__actions');
    const buttons = actions?.querySelectorAll('button');
    expect(buttons?.length).toBe(2);
  });

  it('should render projected button labels', () => {
    const buttons = el.querySelectorAll('.sub-header__actions button');
    expect(buttons[0].textContent?.trim()).toBe('Exportar');
    expect(buttons[1].textContent?.trim()).toBe('Nueva Reserva');
  });
});
