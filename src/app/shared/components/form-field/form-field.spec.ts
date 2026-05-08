import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormField } from './form-field';
import { FormFieldConfig } from '../../models/form-field.model';

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
    setup({ key: 'metodo', label: 'Método', type: 'select', options: [{ label: 'A', value: 'a' }] });
    expect(el.querySelector('p-select')).not.toBeNull();
    expect(el.querySelector('input')).toBeNull();
  });

  it('debería renderizar un textarea para type textarea', () => {
    setup({ key: 'notas', label: 'Notas', type: 'textarea' });
    expect(el.querySelector('textarea')).not.toBeNull();
    expect(el.querySelector('input')).toBeNull();
  });

  it('debería aplicar la clase form-field--full al host cuando fullWidth es true', () => {
    setup({ key: 'dir', label: 'Dirección', type: 'text', fullWidth: true });
    expect((fixture.nativeElement as HTMLElement).classList.contains('form-field--full')).toBe(true);
  });

  it('no debería aplicar form-field--full cuando fullWidth no está definido', () => {
    setup({ key: 'nombre', label: 'Nombre', type: 'text' });
    expect((fixture.nativeElement as HTMLElement).classList.contains('form-field--full')).toBe(false);
  });
});
