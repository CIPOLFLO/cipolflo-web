import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DetailSection } from './detail-section';
import { FormField } from '../form-field/form-field';
import { DetailFieldConfig } from '../../models/detail-field.model';

describe('DetailSection', () => {
  let fixture: ComponentFixture<DetailSection>;
  let el: HTMLElement;

  function setup(title: string, fields: DetailFieldConfig[] = [], note = ''): void {
    fixture = TestBed.createComponent(DetailSection);
    fixture.componentRef.setInput('title', title);
    fixture.componentRef.setInput('fields', fields);
    fixture.componentRef.setInput('note', note);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSection],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    setup('Resumen');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería renderizar el título', () => {
    setup('Información del Cliente');
    expect(el.querySelector('.detail-section__title')?.textContent).toContain(
      'Información del Cliente',
    );
  });

  it('debería renderizar el separador del header', () => {
    setup('Datos');
    expect(el.querySelector('.detail-section__separator')).not.toBeNull();
  });

  it('debería renderizar un app-form-field por cada campo', () => {
    const fields: DetailFieldConfig[] = [
      { key: 'nombre', label: 'Nombre', value: 'Carlos' },
      { key: 'email', label: 'Email', value: 'carlos@mail.com' },
    ];
    setup('Datos', fields);
    const formFields = fixture.debugElement.queryAll(By.directive(FormField));
    expect(formFields.length).toBe(2);
  });

  it('debería pasar displayOnly=true a todos los form-field', () => {
    const fields: DetailFieldConfig[] = [{ key: 'nombre', label: 'Nombre', value: 'Ana' }];
    setup('Datos', fields);
    const formField = fixture.debugElement.query(By.directive(FormField));
    expect(formField.componentInstance.displayOnly()).toBe(true);
  });

  it('debería mapear value de DetailFieldConfig a defaultValue del FormFieldConfig', () => {
    const fields: DetailFieldConfig[] = [{ key: 'nombre', label: 'Nombre', value: 'Laura' }];
    setup('Datos', fields);
    const formField = fixture.debugElement.query(By.directive(FormField));
    expect(formField.componentInstance.config().defaultValue).toBe('Laura');
  });

  it('debería usar type textarea cuando el campo tiene multiline=true', () => {
    const fields: DetailFieldConfig[] = [
      { key: 'notas', label: 'Notas', value: 'texto', multiline: true },
    ];
    setup('Datos', fields);
    const formField = fixture.debugElement.query(By.directive(FormField));
    expect(formField.componentInstance.config().type).toBe('textarea');
  });

  it('debería mostrar la nota cuando se provee', () => {
    setup('Datos', [], 'La información no puede ser modificada');
    expect(el.querySelector('.detail-section__note')?.textContent).toContain(
      'La información no puede ser modificada',
    );
  });

  it('no debería mostrar la nota cuando está vacía', () => {
    setup('Datos', []);
    expect(el.querySelector('.detail-section__note')).toBeNull();
  });

  it('debería tener un contenedor de campos con fondo grisáceo', () => {
    setup('Datos', [{ key: 'nombre', label: 'Nombre', value: 'test' }]);
    expect(el.querySelector('.detail-section__content')).not.toBeNull();
  });
});
