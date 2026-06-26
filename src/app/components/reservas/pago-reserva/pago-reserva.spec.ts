import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { EstadoReserva } from '../../../shared/models/estado-reserva.model';
import { RegistroPagoReservaService } from '../services/registro-pago-reserva.service';
import { PagoReserva } from './pago-reserva';
import { ReservaRow, TipoReserva } from '../models/reserva.model';

const reservaMock: ReservaRow = {
  id: 1,
  clienteId: 10,
  nombreCliente: 'Juan Pérez',
  servicioId: 20,
  servicioNombre: 'Salón principal',
  fechaEntrada: '2026-06-26',
  fechaSalida: '2026-06-27',
  estadoReserva: EstadoReserva.Pendiente,
  tipoReserva: TipoReserva.Comun,
  montoImpago: 5000,
  fechaLimitePago: null,
  pago: false,
  pendienteDocumentacion: false,
};

describe('PagoReserva', () => {
  let fixture: ComponentFixture<PagoReserva>;
  let component: PagoReserva;

  let mockRegistroPagoReservaService: {
    registrarPago: ReturnType<typeof vi.fn>;
  };

  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockRegistroPagoReservaService = {
      registrarPago: vi.fn().mockReturnValue(of(void 0)),
    };

    mockErrorHandler = {
      handle: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PagoReserva],
      providers: [
        { provide: RegistroPagoReservaService, useValue: mockRegistroPagoReservaService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PagoReserva);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('reserva', reservaMock);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar los datos básicos de la reserva', () => {
    expect(fixture.nativeElement.textContent).toContain('Juan Pérez');
    expect(fixture.nativeElement.textContent).toContain('Salón principal');
    expect(fixture.nativeElement.textContent).toContain('5000');
  });

  it('debería precargar el importe con montoImpago y pago total activo', () => {
    expect(component['form'].controls.importe.value).toBe(5000);
    expect(component['form'].controls.esPagoTotal.value).toBe(true);
  });

  it('debería registrar pago y emitir pagoRegistrado', () => {
    let emitted = false;
    component.pagoRegistrado.subscribe(() => (emitted = true));

    component['form'].patchValue({
      importe: 3000,
      esPagoTotal: false,
      formaPago: FormaPago.Efectivo,
      notas: 'Pago parcial',
    });

    component['onConfirmar']();

    expect(mockRegistroPagoReservaService.registrarPago).toHaveBeenCalledWith(1, {
      importe: 3000,
      esPagoTotal: false,
      formaPago: FormaPago.Efectivo,
      notas: 'Pago parcial',
    });
    expect(emitted).toBe(true);
  });

  it('no debería registrar pago si el importe supera el monto impago', () => {
    component['form'].patchValue({
      importe: 6000,
      esPagoTotal: true,
      formaPago: FormaPago.Efectivo,
      notas: '',
    });

    component['onConfirmar']();

    expect(mockRegistroPagoReservaService.registrarPago).not.toHaveBeenCalled();
  });

  it('debería manejar error al registrar pago', () => {
    const error = new Error('Error al registrar pago');
    mockRegistroPagoReservaService.registrarPago.mockReturnValue(throwError(() => error));

    component['form'].patchValue({
      importe: 3000,
      esPagoTotal: true,
      formaPago: FormaPago.Efectivo,
      notas: '',
    });

    component['onConfirmar']();

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
  });

  it('debería emitir closed al cerrar', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));

    component['onCerrar']();

    expect(emitted).toBe(true);
  });
});
