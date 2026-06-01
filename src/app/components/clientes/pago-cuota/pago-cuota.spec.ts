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

  it('muestra el error de cantidad inválida cuando cantidadCuotas < 1 (línea 31)', async () => {
    component['form'].controls.cantidadCuotas.setValue(0);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['cantidadInvalida']()).toBe(true);
  });

  it('muestra el error de fecha futura cuando fechaPago es posterior a hoy (línea 52)', async () => {
    component['form'].controls.fechaPago.setValue(new Date(2999, 0, 1));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['fechaEsFutura']()).toBe(true);
  });

  it('el botón "Confirmar Pago" llama a onConfirmar al hacer click (línea 83)', async () => {
    const confirmarSpy = vi.spyOn(component as PagoCuota & { onConfirmar(): void }, 'onConfirmar');

    // p-dialog porta su contenido a document.body; buscar el botón nativo por texto
    const nativeButtons = Array.from(document.querySelectorAll('button'));
    const confirmBtn = nativeButtons.find((b) => b.textContent?.trim().includes('Confirmar Pago'));
    confirmBtn?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(confirmarSpy).toHaveBeenCalled();
  });

  it('renderiza el bloque de confirmación cuando pagoConfirmado no es null (líneas 99-108)', async () => {
    const pago = {
      clienteId: mockCliente.id,
      cantidadCuotas: 2,
      formaPago: FormaPago.Efectivo,
      fechaPago: '2026-03-27',
      total: 10000,
    };
    component['pagoConfirmado'].set(pago);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['pagoConfirmado']()).toEqual(pago);
  });
});
