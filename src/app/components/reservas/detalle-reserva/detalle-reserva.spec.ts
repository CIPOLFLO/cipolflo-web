import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { EstadoReserva, Procedencia } from '../../../shared';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { TipoCliente } from '../../clientes/models/cliente.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { UserService } from '../../../core/services/user.service';
import { ReservasService } from '../services/reservas.service';
import { TipoReserva, type ReservaDetalleRespuestaDto } from '../models/reserva.model';
import { DetalleReserva } from './detalle-reserva';

const mockReserva: ReservaDetalleRespuestaDto = {
  id: 42,
  tipoReserva: TipoReserva.Comun,
  estado: EstadoReserva.Confirmada,
  procedencia: Procedencia.Camping,
  fechaEntrada: '2026-08-10',
  fechaSalida: '2026-08-15',
  horaInicio: null,
  horaFin: null,
  cantidadTotal: 4,
  cantidadMenores: 1,
  cantidad: null,
  importe: 4500,
  formaPago: FormaPago.Efectivo,
  pago: false,
  requiereDocumentacion: true,
  tieneDocumentacion: false,
  rut: null,
  notas: 'Llegan a las 14hs',
  cliente: {
    id: 10,
    nombre: 'Carlos Martínez Gómez',
    cedula: '12345678',
    telefono: '+598 99 123 456',
    email: 'carlos.martinez@email.com',
    tipoCliente: TipoCliente.Socio,
  },
  servicio: {
    id: 3,
    nombre: 'Hospedaje en camping',
    procedencia: Procedencia.Camping,
    modalidadPrecio: 'POR_DIA',
  },
  createdAt: '2026-03-15T14:30:00Z',
  updatedAt: '2026-03-15T14:30:00Z',
  createdBy: 'Juan Pérez',
  updatedBy: 'Juan Pérez',
};

const mockAuthService = {
  user$: of({ name: 'Juan Pérez', email: 'juan@example.com' }),
  logout: vi.fn(),
};

const mockUserService = {
  userInitials: () => 'JP',
  userEmail: () => 'juan@example.com',
};

async function setup(reserva: ReservaDetalleRespuestaDto = mockReserva, id = '42') {
  const getByIdSpy = vi.fn().mockReturnValue(of(reserva));
  const navigateSpy = vi.fn();
  const handleSpy = vi.fn();

  await TestBed.configureTestingModule({
    imports: [DetalleReserva],
    providers: [
      { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id })) } },
      { provide: Router, useValue: { navigate: navigateSpy } },
      { provide: ErrorHandlerService, useValue: { handle: handleSpy } },
      { provide: AuthService, useValue: mockAuthService },
      { provide: UserService, useValue: mockUserService },
    ],
  })
    .overrideComponent(DetalleReserva, {
      set: { providers: [{ provide: ReservasService, useValue: { getById: getByIdSpy } }] },
    })
    .compileComponents();

  const fixture: ComponentFixture<DetalleReserva> = TestBed.createComponent(DetalleReserva);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, component, getByIdSpy, navigateSpy, handleSpy };
}

describe('DetalleReserva', () => {
  it('debería crear el componente', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('debería llamar a getById con el id numérico de la ruta', async () => {
    const { getByIdSpy } = await setup();
    expect(getByIdSpy).toHaveBeenCalledWith(42);
  });

  it('debería mostrar el nombre del servicio', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('Hospedaje en camping');
  });

  it('debería mostrar el nombre del cliente', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('Carlos Martínez Gómez');
  });

  it('debería mostrar la cédula del cliente', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('12345678');
  });

  it('debería mostrar las notas de la reserva', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.textContent).toContain('Llegan a las 14hs');
  });

  describe('reservaFields', () => {
    it('muestra el estado con label legible', async () => {
      const { component } = await setup();
      const estadoField = component['reservaFields']().find((f) => f.key === 'estado');
      expect(estadoField?.value).toBe('Confirmada');
    });

    it('asigna valueClass success al estado Confirmada', async () => {
      const { component } = await setup();
      const estadoField = component['reservaFields']().find((f) => f.key === 'estado');
      expect(estadoField?.valueClass).toBe('success');
    });

    it('muestra el tipo de reserva con label legible', async () => {
      const { component } = await setup();
      const field = component['reservaFields']().find((f) => f.key === 'tipoReserva');
      expect(field?.value).toBe('Común');
    });

    it('muestra Pago: No con valueClass danger cuando pago es false', async () => {
      const { component } = await setup();
      const field = component['reservaFields']().find((f) => f.key === 'pago');
      expect(field?.value).toBe('No');
      expect(field?.valueClass).toBe('danger');
    });

    it('muestra Pago: Sí con valueClass success cuando pago es true', async () => {
      const { component } = await setup({ ...mockReserva, pago: true });
      const field = component['reservaFields']().find((f) => f.key === 'pago');
      expect(field?.value).toBe('Sí');
      expect(field?.valueClass).toBe('success');
    });

    it('muestra Requiere Documentación: Sí', async () => {
      const { component } = await setup();
      const field = component['reservaFields']().find((f) => f.key === 'requiereDocumentacion');
      expect(field?.value).toBe('Sí');
    });

    it('muestra Tiene Documentación: No con valueClass danger cuando requiere y no tiene', async () => {
      const { component } = await setup();
      const field = component['reservaFields']().find((f) => f.key === 'tieneDocumentacion');
      expect(field?.value).toBe('No');
      expect(field?.valueClass).toBe('danger');
    });

    it('no incluye Tiene Documentación cuando requiereDocumentacion es false', async () => {
      const { component } = await setup({ ...mockReserva, requiereDocumentacion: false });
      const field = component['reservaFields']().find((f) => f.key === 'tieneDocumentacion');
      expect(field).toBeUndefined();
    });

    it('incluye cantidadTotal y cantidadMenores en modo capacidad', async () => {
      const { component } = await setup();
      const fields = component['reservaFields']();
      expect(fields.find((f) => f.key === 'cantidadTotal')?.value).toBe('4');
      expect(fields.find((f) => f.key === 'cantidadMenores')?.value).toBe('1');
      expect(fields.find((f) => f.key === 'cantidad')).toBeUndefined();
    });

    it('incluye cantidad y omite cantidadTotal en modo cantidad', async () => {
      const { component } = await setup({
        ...mockReserva,
        cantidadTotal: null,
        cantidadMenores: null,
        cantidad: 5,
      });
      const fields = component['reservaFields']();
      expect(fields.find((f) => f.key === 'cantidad')?.value).toBe('5');
      expect(fields.find((f) => f.key === 'cantidadTotal')).toBeUndefined();
    });

    it('omite el campo importe cuando es null', async () => {
      const { component } = await setup({ ...mockReserva, importe: null });
      const field = component['reservaFields']().find((f) => f.key === 'importe');
      expect(field).toBeUndefined();
    });

    it('omite el campo formaPago cuando es null', async () => {
      const { component } = await setup({ ...mockReserva, formaPago: null });
      const field = component['reservaFields']().find((f) => f.key === 'formaPago');
      expect(field).toBeUndefined();
    });
  });

  describe('clienteFields — reserva COMUN', () => {
    it('muestra tipoCliente, cedula, nombre, telefono y email del cliente', async () => {
      const { component } = await setup();
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'tipoCliente')?.value).toBe('Socio');
      expect(fields.find((f) => f.key === 'cedula')?.value).toBe('12345678');
      expect(fields.find((f) => f.key === 'nombre')?.value).toBe('Carlos Martínez Gómez');
      expect(fields.find((f) => f.key === 'telefono')?.value).toBe('+598 99 123 456');
      expect(fields.find((f) => f.key === 'email')?.value).toBe('carlos.martinez@email.com');
    });
  });

  describe('clienteFields — reserva COLABORACION', () => {
    const mockColaboracion: ReservaDetalleRespuestaDto = {
      ...mockReserva,
      tipoReserva: TipoReserva.ColaboracionSinFines,
      cliente: null,
      rut: '21-123456-7',
    };

    it('muestra el RUT', async () => {
      const { component } = await setup(mockColaboracion);
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'rut')?.value).toBe('21-123456-7');
    });

    it('no incluye campos de cliente COMUN', async () => {
      const { component } = await setup(mockColaboracion);
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'cedula')).toBeUndefined();
      expect(fields.find((f) => f.key === 'nombre')).toBeUndefined();
    });
  });

  describe('registroData', () => {
    it('formatea el entityId como RSV-042', async () => {
      const { component } = await setup();
      expect(component['registroData']()?.entityId).toBe('RSV-042');
    });

    it('propaga createdBy como registradoPor', async () => {
      const { component } = await setup();
      expect(component['registroData']()?.registradoPor).toBe('Juan Pérez');
    });
  });

  it('onModificar navega a /reservas/:id/editar con queryParam from=detalle', async () => {
    const { component, navigateSpy } = await setup();
    component['onModificar']();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', '42', 'editar'], {
      queryParams: { from: 'detalle' },
    });
  });

  it('debería manejar error en getById: llama a errorHandler y navega a /reservas', async () => {
    const error = new Error('Not found');
    const getByIdSpy = vi.fn().mockReturnValue(throwError(() => error));
    const navigateSpy = vi.fn();
    const handleSpy = vi.fn();

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DetalleReserva],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '99' })) } },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: ErrorHandlerService, useValue: { handle: handleSpy } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideComponent(DetalleReserva, {
        set: { providers: [{ provide: ReservasService, useValue: { getById: getByIdSpy } }] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(DetalleReserva);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(handleSpy).toHaveBeenCalledWith(error);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });
});
