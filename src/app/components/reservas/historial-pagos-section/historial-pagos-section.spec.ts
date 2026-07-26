import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { HistorialPagosSection } from './historial-pagos-section';

describe('HistorialPagosSection', () => {
  let fixture: ComponentFixture<HistorialPagosSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPagosSection],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialPagosSection);
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería mostrar el mensaje cuando no hay pagos', () => {
    fixture.componentRef.setInput('pagos', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay pagos registrados');
  });

  it('debería renderizar una fila por cada pago', () => {
    fixture.componentRef.setInput('pagos', [
      {
        id: 1,
        fecha: '2026-08-01',
        importe: 2000,
        formaPago: FormaPago.Efectivo,
      },
      {
        id: 2,
        fecha: '2026-08-03',
        importe: 1500,
        formaPago: FormaPago.Transferencia,
      },
    ]);

    fixture.detectChanges();

    const filas = fixture.nativeElement.querySelectorAll('.pago-row');

    expect(filas.length).toBe(2);
  });

  it('debería mostrar la forma de pago y el importe', () => {
    fixture.componentRef.setInput('pagos', [
      {
        id: 1,
        fecha: '2026-08-01',
        importe: 2000,
        formaPago: FormaPago.Efectivo,
      },
    ]);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Efectivo');
    expect(fixture.nativeElement.textContent).toContain('2.000,00');
  });
});
