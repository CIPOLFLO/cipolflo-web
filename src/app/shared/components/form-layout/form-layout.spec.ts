import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormLayout } from './form-layout';
import { FormSection } from '../form-section/form-section';
import { FormActions } from '../form-actions/form-actions';

@Component({
  template: `
    <app-form-layout>
      <app-form-section title="Sección A">
        <div class="test-field">Campo 1</div>
      </app-form-section>
      <app-form-section title="Sección B">
        <div class="test-field">Campo 2</div>
      </app-form-section>
      <app-form-actions actions>
        <button class="test-cancel">Cancelar</button>
        <button class="test-save">Guardar</button>
      </app-form-actions>
    </app-form-layout>
  `,
  imports: [FormLayout, FormSection, FormActions],
})
class TestHostFormLayout {}

describe('FormLayout', () => {
  let fixture: ComponentFixture<FormLayout>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(FormLayout);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería renderizar el contenedor .form-layout', () => {
    expect(el.querySelector('.form-layout')).not.toBeNull();
  });

  it('debería renderizar .form-layout__body', () => {
    expect(el.querySelector('.form-layout__body')).not.toBeNull();
  });

  it('debería renderizar .form-layout__footer', () => {
    expect(el.querySelector('.form-layout__footer')).not.toBeNull();
  });
});

describe('FormLayout - proyección de contenido', () => {
  let hostFixture: ComponentFixture<TestHostFormLayout>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostFormLayout],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostFormLayout);
    hostFixture.detectChanges();
    hostEl = hostFixture.nativeElement;
  });

  it('debería proyectar las secciones en .form-layout__body', () => {
    const body = hostEl.querySelector('.form-layout__body');
    const sections = body?.querySelectorAll('app-form-section');
    expect(sections?.length).toBe(2);
  });

  it('debería proyectar app-form-actions en .form-layout__footer a través del slot [actions]', () => {
    const footer = hostEl.querySelector('.form-layout__footer');
    expect(footer?.querySelector('app-form-actions')).not.toBeNull();
  });

  it('debería proyectar los botones dentro del footer', () => {
    const footer = hostEl.querySelector('.form-layout__footer');
    expect(footer?.querySelector('.test-cancel')).not.toBeNull();
    expect(footer?.querySelector('.test-save')).not.toBeNull();
  });

  it('no debería proyectar app-form-actions en .form-layout__body', () => {
    const body = hostEl.querySelector('.form-layout__body');
    expect(body?.querySelector('app-form-actions')).toBeNull();
  });
});
