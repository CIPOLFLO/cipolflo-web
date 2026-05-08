import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormSection } from './form-section';
import { FormFieldConfig } from '../../models/form-field.model';

@Component({
  template: `
    <app-form-section title="Información del Cliente">
      <input class="test-input" type="text" placeholder="Nombre" />
      <input class="test-input" type="email" placeholder="Email" />
    </app-form-section>
  `,
  imports: [FormSection],
})
class TestHostFormSection {}

describe('FormSection', () => {
  let fixture: ComponentFixture<FormSection>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSection],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSection);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('title', 'Sección de prueba');
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería renderizar el título recibido por input', () => {
    const title = el.querySelector('.form-section__title');
    expect(title?.textContent?.trim()).toBe('Sección de prueba');
  });

  it('debería actualizar el título cuando cambia el input', () => {
    fixture.componentRef.setInput('title', 'Nuevo título');
    fixture.detectChanges();
    expect(el.querySelector('.form-section__title')?.textContent?.trim()).toBe('Nuevo título');
  });

  it('debería renderizar el separador horizontal', () => {
    expect(el.querySelector('.form-section__separator')).not.toBeNull();
  });

  it('debería renderizar el contenedor de campos .form-section__fields', () => {
    expect(el.querySelector('.form-section__fields')).not.toBeNull();
  });

  it('debería aceptar el input fields vacío sin errores', () => {
    const emptyFields: FormFieldConfig[] = [];
    expect(() => {
      fixture.componentRef.setInput('fields', emptyFields);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('debería aceptar el input fields con configuraciones válidas', () => {
    const fields: FormFieldConfig[] = [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
    ];
    expect(() => {
      fixture.componentRef.setInput('fields', fields);
      fixture.detectChanges();
    }).not.toThrow();
  });
});

describe('FormSection - proyección de contenido', () => {
  let hostFixture: ComponentFixture<TestHostFormSection>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostFormSection],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostFormSection);
    hostFixture.detectChanges();
    hostEl = hostFixture.nativeElement;
  });

  it('debería proyectar los campos en .form-section__fields', () => {
    const fields = hostEl.querySelector('.form-section__fields');
    const inputs = fields?.querySelectorAll('.test-input');
    expect(inputs?.length).toBe(2);
  });

  it('debería mostrar el título de la sección correctamente desde el host', () => {
    const title = hostEl.querySelector('.form-section__title');
    expect(title?.textContent?.trim()).toBe('Información del Cliente');
  });
});
