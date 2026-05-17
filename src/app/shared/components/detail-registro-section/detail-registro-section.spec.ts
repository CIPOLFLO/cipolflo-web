import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DetailRegistroSection } from './detail-registro-section';
import { FormField } from '../form-field/form-field';
import { DetailRegistroData, DetailFieldConfig } from '../../models/detail-field.model';

describe('DetailRegistroSection', () => {
  let fixture: ComponentFixture<DetailRegistroSection>;
  let el: HTMLElement;

  const baseData: DetailRegistroData = {
    entityId: 'RSV-2026-001',
    fechaRegistro: '15 mar 2026, 14:30',
    registradoPor: 'Juan Pérez',
  };

  function setup(data: DetailRegistroData, extraFields: DetailFieldConfig[] = []): void {
    fixture = TestBed.createComponent(DetailRegistroSection);
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('extraFields', extraFields);
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailRegistroSection],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    setup(baseData);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería renderizar el título fijo "Información de Registro"', () => {
    setup(baseData);
    expect(el.querySelector('.detail-registro-section__title')?.textContent).toContain(
      'Información de Registro',
    );
  });

  it('debería renderizar 3 campos base', () => {
    setup(baseData);
    const formFields = fixture.debugElement.queryAll(By.directive(FormField));
    expect(formFields.length).toBe(3);
  });

  it('debería mostrar el entityId con label "ID" por defecto', () => {
    setup(baseData);
    const fields = fixture.componentInstance['allFields']();
    const idField = fields.find((f) => f.key === 'entityId');
    expect(idField?.defaultValue).toBe('RSV-2026-001');
    expect(idField?.label).toBe('ID');
  });

  it('debería usar entityIdLabel personalizado cuando se provee', () => {
    setup({ ...baseData, entityIdLabel: 'ID de la Reserva' });
    const fields = fixture.componentInstance['allFields']();
    const idField = fields.find((f) => f.key === 'entityId');
    expect(idField?.label).toBe('ID de la Reserva');
  });

  it('debería incluir el campo fechaRegistro con el valor correcto', () => {
    setup(baseData);
    const fields = fixture.componentInstance['allFields']();
    const field = fields.find((f) => f.key === 'fechaRegistro');
    expect(field?.defaultValue).toBe('15 mar 2026, 14:30');
  });

  it('debería incluir el campo registradoPor con el valor correcto', () => {
    setup(baseData);
    const fields = fixture.componentInstance['allFields']();
    const field = fields.find((f) => f.key === 'registradoPor');
    expect(field?.defaultValue).toBe('Juan Pérez');
  });

  it('debería agregar extraFields al final de los campos base', () => {
    const extra: DetailFieldConfig[] = [
      { key: 'tipoMovimiento', label: 'Tipo de Movimiento', value: 'Ingreso' },
    ];
    setup(baseData, extra);
    const formFields = fixture.debugElement.queryAll(By.directive(FormField));
    expect(formFields.length).toBe(4);
    const fields = fixture.componentInstance['allFields']();
    expect(fields[3].key).toBe('tipoMovimiento');
    expect(fields[3].defaultValue).toBe('Ingreso');
  });

  it('debería pasar displayOnly=true a todos los form-field', () => {
    setup(baseData);
    const formFields = fixture.debugElement.queryAll(By.directive(FormField));
    formFields.forEach((ff) => {
      expect(ff.componentInstance.displayOnly()).toBe(true);
    });
  });

  it('debería mostrar la nota fija de solo lectura', () => {
    setup(baseData);
    expect(el.querySelector('.detail-registro-section__note')?.textContent).toContain(
      'La información de registro no puede ser modificada',
    );
  });

  it('debería tener un contenedor de campos con fondo grisáceo', () => {
    setup(baseData);
    expect(el.querySelector('.detail-registro-section__content')).not.toBeNull();
  });

  it('debería mapear extraField con multiline=true a type textarea', () => {
    const extra: DetailFieldConfig[] = [
      { key: 'notas', label: 'Notas', value: 'texto largo', multiline: true },
    ];
    setup(baseData, extra);
    const fields = fixture.componentInstance['allFields']();
    const notasField = fields.find((f) => f.key === 'notas');
    expect(notasField?.type).toBe('textarea');
  });

  it('debería mapear value null de extraField a defaultValue undefined', () => {
    const extra: DetailFieldConfig[] = [{ key: 'obs', label: 'Observación', value: null }];
    setup(baseData, extra);
    const fields = fixture.componentInstance['allFields']();
    const obsField = fields.find((f) => f.key === 'obs');
    expect(obsField?.defaultValue).toBeUndefined();
  });
});
