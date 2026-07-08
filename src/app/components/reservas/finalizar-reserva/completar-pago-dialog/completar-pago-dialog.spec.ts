import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { CompletarPagoDialog } from './completar-pago-dialog';
import { FormaPago } from '../../../../shared/models/forma-pago.model';

describe('CompletarPagoDialog', () => {
  let fixture: ComponentFixture<CompletarPagoDialog>;
  let component: CompletarPagoDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletarPagoDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletarPagoDialog);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('numeroReserva', 45);
    fixture.componentRef.setInput('montoImpago', 1200);

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el saldo pendiente', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Finalización de reserva #45');
    expect(text).toContain('La reserva tiene saldo pendiente');
    expect(text).toContain('Saldo pendiente:');
    expect(text).toContain('1.200');
  });

  it('debería emitir cancelar al presionar Cancelar', () => {
    const cancelarSpy = vi.spyOn(component.cancelar, 'emit');

    component['onCancelar']();

    expect(cancelarSpy).toHaveBeenCalled();
  });

  it('debería emitir finalizar sin completar pago cuando no se marca el check', () => {
    const confirmarSpy = vi.spyOn(component.confirmar, 'emit');

    component['onConfirmar']();

    expect(confirmarSpy).toHaveBeenCalledWith({
      completarPago: false,
      formaPago: undefined,
      notas: undefined,
    });
  });

  it('debería requerir forma de pago cuando se completa el pago', () => {
    component['onCompletarPagoChange'](true);

    expect(component['confirmarDisabled']()).toBe(true);
  });

  it('debería emitir completarPago true con formaPago y notas', () => {
    const confirmarSpy = vi.spyOn(component.confirmar, 'emit');

    component['onCompletarPagoChange'](true);
    component['formaPago'].set(FormaPago.Efectivo);
    component['notas'].set('Pago al finalizar');

    component['onConfirmar']();

    expect(confirmarSpy).toHaveBeenCalledWith({
      completarPago: true,
      formaPago: FormaPago.Efectivo,
      notas: 'Pago al finalizar',
    });
  });

  it('debería limpiar forma de pago y notas cuando se desmarca completar pago', () => {
    component['onCompletarPagoChange'](true);
    component['formaPago'].set(FormaPago.Transferencia);
    component['notas'].set('Nota');

    component['onCompletarPagoChange'](false);

    expect(component['formaPago']()).toBeNull();
    expect(component['notas']()).toBe('');
  });

  it('debería mostrar el selector de forma de pago cuando se marca completar pago', () => {
    component['onCompletarPagoChange'](true);
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('p-select'));

    expect(select).toBeTruthy();
  });
});
