import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgModel } from '@angular/forms';
import { FormField } from './form-field';
import { FormFieldConfig } from '../../models/form-field.model';
import { By } from '@angular/platform-browser';

describe('FormField', () => {
  let fixture: ComponentFixture<FormField>;
  let el: HTMLElement;

  function setup(config: FormFieldConfig): void {
    fixture = TestBed.createComponent(FormField);
    fixture.componentRef.setInput('config', config);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormField],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    setup({ key: 'nombre', label: 'Nombre', type: 'text' });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería renderizar el label', () => {
    setup({ key: 'nombre', label: 'Nombre', type: 'text' });
    expect(el.querySelector('.form-field__label')?.textContent).toContain('Nombre');
  });

  it('debería mostrar el asterisco cuando required es true', () => {
    setup({ key: 'nombre', label: 'Nombre', type: 'text', required: true });
    expect(el.querySelector('.form-field__required')).not.toBeNull();
  });

  it('no debería mostrar el asterisco cuando required es false', () => {
    setup({ key: 'email', label: 'Email', type: 'email' });
    expect(el.querySelector('.form-field__required')).toBeNull();
  });

  it('debería renderizar un input para type text', () => {
    setup({ key: 'nombre', label: 'Nombre', type: 'text' });
    expect(el.querySelector('input')).not.toBeNull();
    expect(el.querySelector('p-select')).toBeNull();
    expect(el.querySelector('textarea')).toBeNull();
  });

  it('debería renderizar un p-select para type select', () => {
    setup({
      key: 'metodo',
      label: 'Método',
      type: 'select',
      options: [{ label: 'A', value: 'a' }],
    });
    expect(el.querySelector('p-select')).not.toBeNull();
    expect(el.querySelector('input')).toBeNull();
  });

  it('debería deshabilitar el p-select cuando disabled es true', () => {
    setup({ key: 'metodo', label: 'Método', type: 'select', options: [], disabled: true });
    const select = fixture.debugElement.query(By.css('p-select'));
    // disabled es un signal input en PrimeNG 21 — se invoca como función
    expect(select.componentInstance.disabled()).toBe(true);
  });

  it('debería pasar defaultValue al p-select como valor inicial', () => {
    setup({
      key: 'metodo',
      label: 'Método',
      type: 'select',
      options: [{ label: 'A', value: 'a' }],
      defaultValue: 'a',
    });
    // dir.model es el valor crudo que llega al binding [ngModel]="..." antes de
    // que el CVA lo propague — suficiente para verificar que el template lo pasa
    const dir = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);
    expect(dir.model).toBe('a');
  });

  it('debería renderizar un textarea para type textarea', () => {
    setup({ key: 'notas', label: 'Notas', type: 'textarea' });
    expect(el.querySelector('textarea')).not.toBeNull();
    expect(el.querySelector('input')).toBeNull();
  });

  it('debería deshabilitar el textarea cuando disabled es true', () => {
    setup({ key: 'notas', label: 'Notas', type: 'textarea', disabled: true });
    expect(el.querySelector('textarea')?.disabled).toBe(true);
  });

  it('debería precargar el valor inicial en el textarea', () => {
    setup({ key: 'notas', label: 'Notas', type: 'textarea', defaultValue: 'texto inicial' });
    expect(el.querySelector('textarea')?.value).toBe('texto inicial');
  });

  it('debería propagar required al input nativo', () => {
    setup({ key: 'nombre', label: 'Nombre', type: 'text', required: true });
    expect(el.querySelector('input')?.required).toBe(true);
  });

  it('debería propagar required al textarea', () => {
    setup({ key: 'notas', label: 'Notas', type: 'textarea', required: true });
    expect(el.querySelector('textarea')?.required).toBe(true);
  });

  it('debería propagar required al p-select', () => {
    setup({ key: 'metodo', label: 'Método', type: 'select', options: [], required: true });
    const select = fixture.debugElement.query(By.css('p-select'));
    expect(select.componentInstance.required()).toBe(true);
  });

  it('debería aplicar la clase form-field--full al host cuando fullWidth es true', () => {
    setup({ key: 'dir', label: 'Dirección', type: 'text', fullWidth: true });
    expect((fixture.nativeElement as HTMLElement).classList.contains('form-field--full')).toBe(
      true,
    );
  });

  it('no debería aplicar form-field--full cuando fullWidth no está definido', () => {
    setup({ key: 'nombre', label: 'Nombre', type: 'text' });
    expect((fixture.nativeElement as HTMLElement).classList.contains('form-field--full')).toBe(
      false,
    );
  });

  it('debería actualizar el modelo al escribir en el input nativo', () => {
    setup({ key: 'nombre', label: 'Nombre', type: 'text' });
    const input = el.querySelector('input')!;
    input.value = 'Juan';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('Juan');
  });

  it('debería actualizar el modelo al escribir en el textarea', () => {
    setup({ key: 'notas', label: 'Notas', type: 'textarea' });
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'nuevo texto';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('nuevo texto');
  });

  it('debería actualizar el modelo al cambiar la selección del p-select', () => {
    setup({ key: 'estado', label: 'Estado', type: 'select', options: [{ label: 'A', value: 'a' }] });
    const ngModelDir = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);
    ngModelDir.update.emit('a');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('a');
  });

  it('debería usar array vacío cuando options no está definido en el select', () => {
    setup({ key: 'tipo', label: 'Tipo', type: 'select' });
    expect(el.querySelector('p-select')).not.toBeNull();
  });
});
