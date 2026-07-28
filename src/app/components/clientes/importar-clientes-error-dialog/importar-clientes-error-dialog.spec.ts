import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportarClientesErrorDialog } from './importar-clientes-error-dialog';
import { FilaErrorImportacionDto } from '../models/importacion-socios.model';

const errores: FilaErrorImportacionDto[] = [
  { numeroFila: 2, codigoError: 'CEDULA_INVALIDA', motivo: 'La cédula ingresada no es válida' },
  { numeroFila: 5, codigoError: 'CAMPO_FALTANTE', motivo: 'Falta el nombre completo' },
];

describe('ImportarClientesErrorDialog', () => {
  let fixture: ComponentFixture<ImportarClientesErrorDialog>;
  let component: ImportarClientesErrorDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportarClientesErrorDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportarClientesErrorDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('errores', errores);
    fixture.detectChanges();
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza una fila por cada error recibido', () => {
    const filas = fixture.debugElement.queryAll(By.css('.import-errors__row'));
    expect(filas.length).toBe(errores.length);
    expect(filas[0].nativeElement.textContent).toContain('La cédula ingresada no es válida');
    expect(filas[1].nativeElement.textContent).toContain('Falta el nombre completo');
  });

  it('no renderiza filas cuando la lista de errores está vacía', () => {
    fixture.componentRef.setInput('errores', []);
    fixture.detectChanges();

    const filas = fixture.debugElement.queryAll(By.css('.import-errors__row'));
    expect(filas.length).toBe(0);
  });

  it('emite aceptar al hacer click en el botón Aceptar', () => {
    const spy = vi.fn();
    component.aceptar.subscribe(spy);

    component['aceptar'].emit();

    expect(spy).toHaveBeenCalled();
  });

  it('emite reintentar al hacer click en el link de reintento', () => {
    const spy = vi.fn();
    component.reintentar.subscribe(spy);

    const link = fixture.debugElement.query(By.css('.import-errors__link'));
    link.nativeElement.click();

    expect(spy).toHaveBeenCalled();
  });
});
