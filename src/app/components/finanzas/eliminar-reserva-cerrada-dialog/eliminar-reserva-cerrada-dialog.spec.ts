import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { EliminarReservaCerradaDialog } from './eliminar-reserva-cerrada-dialog';

describe('EliminarReservaCerradaDialog', () => {
  let fixture: ComponentFixture<EliminarReservaCerradaDialog>;
  let component: EliminarReservaCerradaDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarReservaCerradaDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EliminarReservaCerradaDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('message', 'La reserva ya está finalizada.');
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('registrarEgreso emite al llamar emit()', () => {
    let emitido = false;
    component.registrarEgreso.subscribe(() => (emitido = true));
    component.registrarEgreso.emit();
    expect(emitido).toBe(true);
  });

  it('eliminar emite al llamar emit()', () => {
    let emitido = false;
    component.eliminar.subscribe(() => (emitido = true));
    component.eliminar.emit();
    expect(emitido).toBe(true);
  });

  it('cancelar emite al llamar emit()', () => {
    let emitido = false;
    component.cancelar.subscribe(() => (emitido = true));
    component.cancelar.emit();
    expect(emitido).toBe(true);
  });
});
