import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormSection } from './form-section';
import { FormFieldConfig } from '../../models/form-field.model';
import { By } from '@angular/platform-browser';
import { FormField } from '../form-field/form-field';
import { describe, it, expect, beforeEach } from 'vitest';

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

  it('debería mostrar el ícono de candado cuando el campo tiene locked: true', () => {
    const fields: FormFieldConfig[] = [{ key: 'nro', label: 'Número', type: 'text', locked: true }];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();
    expect(el.querySelector('.form-field__lock-icon')).not.toBeNull();
  });

  it('debería deshabilitar el input cuando el campo tiene locked: true', () => {
    const fields: FormFieldConfig[] = [{ key: 'nro', label: 'Número', type: 'text', locked: true }];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();
    expect(el.querySelector('input')?.disabled).toBe(true);
  });

  it('no debería mostrar el ícono de candado cuando el campo no tiene locked', () => {
    const fields: FormFieldConfig[] = [{ key: 'nro', label: 'Número', type: 'text' }];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();
    const formField = fixture.debugElement.query(By.directive(FormField));
    expect(formField.nativeElement.querySelector('.form-field__lock-icon')).toBeNull();
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

@Component({
  template: `<app-form-section title="Test" [fields]="fields" (valuesChange)="onValues($event)" />`,
  imports: [FormSection],
})
class TestHostWithValues {
  fields: FormFieldConfig[] = [{ key: 'nombre', label: 'Nombre', type: 'text' }];
  lastValues: Record<string, string | null> = {};
  onValues(v: Record<string, string | null>) {
    this.lastValues = v;
  }
}

describe('FormSection - output valuesChange', () => {
  let hostFixture: ComponentFixture<TestHostWithValues>;
  let hostComponent: TestHostWithValues;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostWithValues],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostWithValues);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('emite valuesChange cuando un FormField cambia su valor', () => {
    const formFieldDebug = hostFixture.debugElement.query(By.directive(FormField));
    formFieldDebug.triggerEventHandler('valueChange', 'Nuevo valor');
    expect(hostComponent.lastValues).toEqual({ nombre: 'Nuevo valor' });
  });

  it('emite el mapa completo de valores al cambiar un campo', () => {
    const formFieldDebug = hostFixture.debugElement.query(By.directive(FormField));
    formFieldDebug.triggerEventHandler('valueChange', 'Cipolflo');
    expect(hostComponent.lastValues['nombre']).toBe('Cipolflo');
  });
});

describe('FormSection - input errors', () => {
  let fixture: ComponentFixture<FormSection>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSection],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSection);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('title', 'Sección');
    fixture.componentRef.setInput('fields', [{ key: 'nombre', label: 'Nombre', type: 'text' }]);
    fixture.detectChanges();
  });

  it('el FormField recibe el error cuando errors tiene un error para esa clave', () => {
    fixture.componentRef.setInput('errors', { nombre: 'Campo obligatorio' });
    fixture.detectChanges();
    expect(el.querySelector('.form-field__error')).not.toBeNull();
    expect(el.querySelector('.form-field__error')?.textContent?.trim()).toBe('Campo obligatorio');
  });

  it('el FormField no muestra error cuando errors está vacío', () => {
    fixture.componentRef.setInput('errors', {});
    fixture.detectChanges();
    expect(el.querySelector('.form-field__error')).toBeNull();
  });
});
