import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoCuota } from './pago-cuota';
import { ClienteRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';
import { FormaPago } from 'src/app/shared/models/forma-pago.model';

const mockCliente: ClienteRespuestaDto = {
  id: 1,
  nombreCompleto: 'Lucía Rodríguez',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 123,
  cedula: '5.191.926-8',
  email: 'lucia@example.com',
  estado: EstadoSocio.Activo,
  fechaNacimiento: '1990-01-01',
  telefono: '099123456',
  metodoPago: 'COBRADORA',
};

describe('PagoCuota', () => {
  let component: PagoCuota;
  let fixture: ComponentFixture<PagoCuota>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoCuota],
    }).compileComponents();

    fixture = TestBed.createComponent(PagoCuota);
    fixture.componentRef.setInput('cliente', mockCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('onCancelar emite cancelado', () => {
    const canceladoSpy = vi.spyOn(component.cerrado, 'emit');

    component['onCancelar']();

    expect(canceladoSpy).toHaveBeenCalled();
  });

  it('onConfirmar no confirma si el formulario es inválido', () => {
    component['form'].controls.cantidadCuotas.setValue(0);

    component['onConfirmar']();

    expect(component['pagoConfirmado']()).toBeNull();
  });

  it('onConfirmar no confirma si la fecha es futura', () => {
    component['form'].controls.fechaPago.setValue(new Date(2999, 0, 1));

    component['onConfirmar']();

    expect(component['pagoConfirmado']()).toBeNull();
  });

  it('onConfirmar guarda el pago confirmado si el formulario es válido', () => {
    component['form'].patchValue({
      cantidadCuotas: 2,
      formaPago: FormaPago.Efectivo,
      fechaPago: new Date(2026, 2, 27),
    });

    component['onConfirmar']();

    expect(component['pagoConfirmado']()).toEqual({
      clienteId: mockCliente.id,
      cantidadCuotas: 2,
      formaPago: FormaPago.Efectivo,
      fechaPago: '2026-03-27',
      total: 10000,
    });
  });

  it('cerrarConfirmacion limpia el pago confirmado y emite cerrado', () => {
    const cerradoSpy = vi.spyOn(component.cerrado, 'emit');

    component['pagoConfirmado'].set({
      clienteId: mockCliente.id,
      cantidadCuotas: 1,
      formaPago: FormaPago.Efectivo,
      fechaPago: '2026-03-27',
      total: 5000,
    });

    component['cerrarConfirmacion']();

    expect(component['pagoConfirmado']()).toBeNull();
    expect(cerradoSpy).toHaveBeenCalled();
  });
});
