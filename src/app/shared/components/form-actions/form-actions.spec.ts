import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormActions } from './form-actions';
import { AppButton } from '../button/button';

@Component({
  template: `
    <app-form-actions>
      <app-button label="Cancelar" intent="secondary" />
      <app-button label="Guardar" intent="primary" />
    </app-form-actions>
  `,
  imports: [FormActions, AppButton],
})
class TestHostFormActions {}

@Component({
  template: `<app-form-actions></app-form-actions>`,
  imports: [FormActions],
})
class TestHostFormActionsEmpty {}

describe('FormActions', () => {
  let fixture: ComponentFixture<FormActions>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormActions],
    }).compileComponents();

    fixture = TestBed.createComponent(FormActions);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería renderizar el contenedor .form-actions', () => {
    expect(el.querySelector('.form-actions')).not.toBeNull();
  });
});

describe('FormActions - proyección de contenido', () => {
  let hostFixture: ComponentFixture<TestHostFormActions>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostFormActions],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostFormActions);
    hostFixture.detectChanges();
    hostEl = hostFixture.nativeElement;
  });

  it('debería proyectar los botones dentro de .form-actions', () => {
    const actions = hostEl.querySelector('.form-actions');
    const buttons = actions?.querySelectorAll('app-button');
    expect(buttons?.length).toBe(2);
  });

  it('debería proyectar el botón Cancelar con intent secondary', () => {
    const buttons = hostEl.querySelectorAll('app-button');
    expect(buttons[0].querySelector('.button--secondary')).not.toBeNull();
  });

  it('debería proyectar el botón Guardar con intent primary', () => {
    const buttons = hostEl.querySelectorAll('app-button');
    expect(buttons[1].querySelector('.button--primary')).not.toBeNull();
  });
});

describe('FormActions - sin contenido proyectado', () => {
  let hostFixture: ComponentFixture<TestHostFormActionsEmpty>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostFormActionsEmpty],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostFormActionsEmpty);
    hostFixture.detectChanges();
    hostEl = hostFixture.nativeElement;
  });

  it('debería renderizar el contenedor vacío sin errores', () => {
    expect(hostEl.querySelector('.form-actions')).not.toBeNull();
  });
});
