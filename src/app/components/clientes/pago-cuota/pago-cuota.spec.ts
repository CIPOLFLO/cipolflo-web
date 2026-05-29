import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoCuota } from './pago-cuota';
import { ClienteRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';

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
    const canceladoSpy = vi.spyOn(component.cancelado, 'emit');

    component['onCancelar']();

    expect(canceladoSpy).toHaveBeenCalled();
  });

  it('onConfirmar no emite si el formulario es inválido', () => {
    const confirmadoSpy = vi.spyOn(component.confirmado, 'emit');

    component['form'].controls.cantidadCuotas.setValue(0);
    component['onConfirmar']();

    expect(confirmadoSpy).not.toHaveBeenCalled();
  });

  it('onConfirmar no emite si la fecha es futura', () => {
    const confirmadoSpy = vi.spyOn(component.confirmado, 'emit');

    component['form'].controls.fechaPago.setValue('2999-01-01');
    component['onConfirmar']();

    expect(confirmadoSpy).not.toHaveBeenCalled();
  });

  it('onConfirmar emite los datos del pago si el formulario es válido', () => {
    const confirmadoSpy = vi.spyOn(component.confirmado, 'emit');

    component['form'].patchValue({
      cantidadCuotas: 2,
      formaPago: 'EFECTIVO',
      fechaPago: '2026-03-27',
    });

    component['onConfirmar']();

    expect(confirmadoSpy).toHaveBeenCalledWith({
      clienteId: mockCliente.id,
      cantidadCuotas: 2,
      formaPago: 'EFECTIVO',
      fechaPago: '2026-03-27',
      total: 10000,
    });
  });
});
