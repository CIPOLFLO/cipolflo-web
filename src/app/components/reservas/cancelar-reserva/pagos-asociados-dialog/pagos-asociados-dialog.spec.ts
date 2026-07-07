import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormaPago } from '../../../../shared/models/forma-pago.model';
import { PagosAsociadosDialog } from './pagos-asociados-dialog';

describe('PagosAsociadosDialog', () => {
  let component: PagosAsociadosDialog;
  let fixture: ComponentFixture<PagosAsociadosDialog>;

  const pagos = [
    {
      id: 1,
      fecha: '2026-07-01',
      importe: 5000,
      formaPago: FormaPago.Efectivo,
    },
    {
      id: 2,
      fecha: '2026-07-02',
      importe: 3000,
      formaPago: FormaPago.Transferencia,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosAsociadosDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PagosAsociadosDialog);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('numeroReserva', 42);
    fixture.componentRef.setInput('pagos', pagos);
    fixture.componentRef.setInput('importeTotalPagos', 8000);

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar los pagos asociados y el total', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Se encontraron pagos asociados');
    expect(text).toContain('Efectivo');
    expect(text).toContain('Transferencia');
    expect(text).toContain('8.000');
  });

  it('debería emitir cancelar al presionar cancelar', () => {
    const cancelarSpy = vi.spyOn(component.cancelar, 'emit');

    component.cancelar.emit();

    expect(cancelarSpy).toHaveBeenCalled();
  });

  it('debería emitir confirmar sin devolución por defecto', () => {
    const confirmarSpy = vi.spyOn(component.confirmar, 'emit');

    component['onConfirmar']();

    expect(confirmarSpy).toHaveBeenCalledWith({
      generarDevolucion: false,
      formaPago: undefined,
      importeDevolucion: undefined,
    });
  });

  it('debería deshabilitar confirmar si genera devolución sin forma de pago', () => {
    component['onGenerarDevolucionChange'](true);

    expect(component['confirmarDisabled']()).toBe(true);
  });

  it('debería emitir confirmar con devolución y forma de pago', () => {
    const confirmarSpy = vi.spyOn(component.confirmar, 'emit');

    component['onGenerarDevolucionChange'](true);
    component['formaPago'].set(FormaPago.Efectivo);

    component['onConfirmar']();

    expect(confirmarSpy).toHaveBeenCalledWith({
      generarDevolucion: true,
      formaPago: FormaPago.Efectivo,
      importeDevolucion: 8000,
    });
  });

  it('debería limpiar formaPago si se desactiva generar devolución', () => {
    component['onGenerarDevolucionChange'](true);
    component['formaPago'].set(FormaPago.Efectivo);

    component['onGenerarDevolucionChange'](false);

    expect(component['formaPago']()).toBeNull();
  });
});
