import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { EstadoReserva, Procedencia } from '../../../shared';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { TipoCliente } from '../../clientes/models/cliente.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { UserService } from '../../../core/services/user.service';
import { ReservasService } from '../services/reservas.service';
import {
  PlazoConfirmacion,
  TipoReserva,
  type ReservaDetalleRespuestaDto,
} from '../models/reserva.model';
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
  montoImpago: 0,
  formaPago: FormaPago.Efectivo,
  pago: false,
  requiereDocumentacion: true,
  tieneDocumentacion: false,
  requiereSena: false,
  plazoConfirmacion: PlazoConfirmacion.TresMeses,
  fechaLimiteConfirmacion: '2026-05-10T00:00:00',
  notas: 'Llegan a las 14hs',
  cliente: {
    id: 10,
    nombre: 'Carlos Martínez Gómez',
    cedula: '12345678',
    rut: null,
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
  const descargarComprobanteSpy = vi.fn().mockReturnValue(of(undefined));
  const navigateSpy = vi.fn();
  const handleSpy = vi.fn();
  const getHistorialPagosSpy = vi.fn().mockReturnValue(
    of([
      {
        id: 1,
        fecha: '2026-08-01',
        importe: 2000,
        formaPago: FormaPago.Efectivo,
      },
      {
        id: 2,
        fecha: '2026-08-03',
        importe: 2500,
        formaPago: FormaPago.Transferencia,
      },
    ]),
  );

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
      set: {
        providers: [
          {
            provide: ReservasService,
            useValue: { getById: getByIdSpy, getHistorialPagos: getHistorialPagosSpy, descargarComprobante: descargarComprobanteSpy },
          },
        ],
      },
    })
    .compileComponents();

  const fixture: ComponentFixture<DetalleReserva> = TestBed.createComponent(DetalleReserva);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, component, getByIdSpy, descargarComprobanteSpy, navigateSpy, getHistorialPagosSpy, handleSpy };
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
      const { component } = await setup({
        ...mockReserva,
        requiereDocumentacion: false,
        plazoConfirmacion: null,
        fechaLimiteConfirmacion: null,
      });
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

    it('oculta pago, importe y formaPago en reserva ColaboracionSinFines', async () => {
      const { component } = await setup({
        ...mockReserva,
        tipoReserva: TipoReserva.ColaboracionSinFines,
        cliente: {
          id: 20,
          nombre: 'Org Solidaria S.A.',
          cedula: null,
          rut: '211003420017',
          telefono: '099222222',
          email: 'org@mail.com',
          tipoCliente: TipoCliente.Empresa,
        },
      });
      const fields = component['reservaFields']();
      expect(fields.find((f) => f.key === 'pago')).toBeUndefined();
      expect(fields.find((f) => f.key === 'importe')).toBeUndefined();
      expect(fields.find((f) => f.key === 'formaPago')).toBeUndefined();
    });

    // --- Plazo de confirmación ---

    it('muestra el plazo de confirmación cuando requiere documentación y hay plazo', async () => {
      const { component } = await setup();
      const field = component['reservaFields']().find((f) => f.key === 'plazoConfirmacion');
      expect(field?.value).toBe('3 meses antes de la fecha de inicio');
    });

    it('muestra la fecha límite de confirmación formateada cuando corresponde', async () => {
      const { component } = await setup();
      const field = component['reservaFields']().find((f) => f.key === 'fechaLimiteConfirmacion');
      expect(field?.value).toBe('10/05/2026 00:00 hs');
    });

    it('muestra el plazo con label "24 horas antes de la fecha de inicio" para PlazoConfirmacion.VeinticuatroHoras', async () => {
      const { component } = await setup({
        ...mockReserva,
        plazoConfirmacion: PlazoConfirmacion.VeinticuatroHoras,
      });
      const field = component['reservaFields']().find((f) => f.key === 'plazoConfirmacion');
      expect(field?.value).toBe('24 horas antes de la fecha de inicio');
    });

    it('oculta el plazo y la fecha límite cuando no requiere ni seña ni documentación', async () => {
      const { component } = await setup({
        ...mockReserva,
        requiereDocumentacion: false,
        requiereSena: false,
        plazoConfirmacion: null,
        fechaLimiteConfirmacion: null,
      });
      const fields = component['reservaFields']();
      expect(fields.find((f) => f.key === 'plazoConfirmacion')).toBeUndefined();
      expect(fields.find((f) => f.key === 'fechaLimiteConfirmacion')).toBeUndefined();
    });

    it('oculta el plazo y la fecha límite si el back todavía no los seteó, aunque requiera documentación', async () => {
      const { component } = await setup({
        ...mockReserva,
        requiereDocumentacion: true,
        plazoConfirmacion: null,
        fechaLimiteConfirmacion: null,
      });
      const fields = component['reservaFields']();
      expect(fields.find((f) => f.key === 'plazoConfirmacion')).toBeUndefined();
      expect(fields.find((f) => f.key === 'fechaLimiteConfirmacion')).toBeUndefined();
    });

    it('muestra el plazo cuando requiere seña (aunque no requiera documentación)', async () => {
      const { component } = await setup({
        ...mockReserva,
        requiereDocumentacion: false,
        requiereSena: true,
        plazoConfirmacion: PlazoConfirmacion.VeinticuatroHoras,
        fechaLimiteConfirmacion: '2026-08-09T00:00:00',
      });
      const field = component['reservaFields']().find((f) => f.key === 'plazoConfirmacion');
      expect(field?.value).toBe('24 horas antes de la fecha de inicio');
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

  describe('clienteFields — reserva COLABORACION (cliente Empresa)', () => {
    const mockColaboracion: ReservaDetalleRespuestaDto = {
      ...mockReserva,
      tipoReserva: TipoReserva.ColaboracionSinFines,
      cliente: {
        id: 20,
        nombre: 'Org Solidaria S.A.',
        cedula: null,
        rut: '211003420017',
        telefono: '099222222',
        email: 'org@mail.com',
        tipoCliente: TipoCliente.Empresa,
      },
    };

    it('muestra el tipo de cliente Empresa', async () => {
      const { component } = await setup(mockColaboracion);
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'tipoCliente')?.value).toBe('Empresa');
    });

    it('muestra el RUT de la Empresa (no el campo cédula)', async () => {
      const { component } = await setup(mockColaboracion);
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'rut')?.value).toBe('211003420017');
      expect(fields.find((f) => f.key === 'cedula')).toBeUndefined();
    });

    it('muestra el nombre de la organización', async () => {
      const { component } = await setup(mockColaboracion);
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'nombre')?.value).toBe('Org Solidaria S.A.');
    });

    it('muestra teléfono y email de la Empresa', async () => {
      const { component } = await setup(mockColaboracion);
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'telefono')?.value).toBe('099222222');
      expect(fields.find((f) => f.key === 'email')?.value).toBe('org@mail.com');
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
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', '42', 'modificar'], {
      queryParams: { from: 'detalle' },
    });
  });

  it('onDescargarComprobante dispara la descarga con el id de la reserva en pantalla', async () => {
    const { component, descargarComprobanteSpy } = await setup();
    component['onDescargarComprobante']();
    expect(descargarComprobanteSpy).toHaveBeenCalledWith(42);
  });

  it('un error en la descarga se maneja vía errorHandler sin romper la vista', async () => {
    const { component, descargarComprobanteSpy, handleSpy } = await setup();
    const error = new Error('download error');
    descargarComprobanteSpy.mockReturnValue(throwError(() => error));
    component['onDescargarComprobante']();
    expect(handleSpy).toHaveBeenCalledWith(error);
  });

  it('marca descargando mientras la descarga está en curso y lo libera al terminar', async () => {
    const { component, descargarComprobanteSpy } = await setup();
    const descarga = new Subject<void>();
    descargarComprobanteSpy.mockReturnValue(descarga.asObservable());
    component['onDescargarComprobante']();
    expect(component['descargando']()).toBe(true);
    descarga.complete();
    expect(component['descargando']()).toBe(false);
  });

  it('un error en la descarga también libera el estado descargando', async () => {
    const { component, descargarComprobanteSpy } = await setup();
    descargarComprobanteSpy.mockReturnValue(throwError(() => new Error('download error')));
    component['onDescargarComprobante']();
    expect(component['descargando']()).toBe(false);
  });

  it('no dispara una segunda descarga si ya hay una en curso', async () => {
    const { component, descargarComprobanteSpy } = await setup();
    descargarComprobanteSpy.mockReturnValue(new Subject<void>().asObservable());
    component['onDescargarComprobante']();
    component['onDescargarComprobante']();
    expect(descargarComprobanteSpy).toHaveBeenCalledTimes(1);
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
        set: {
          providers: [{
            provide: ReservasService, useValue: {
              getById: getByIdSpy,
              getHistorialPagos: vi.fn().mockReturnValue(of([])),
              descargarComprobante: vi.fn(),
            },
          }]
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(DetalleReserva);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(handleSpy).toHaveBeenCalledWith(error);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('muestra "Requiere Seña: Sí" cuando requiereSena es true', async () => {
    const { component } = await setup({ ...mockReserva, requiereSena: true });
    const field = component['reservaFields']().find((f) => f.key === 'requiereSena');
    expect(field?.value).toBe('Sí');
  });

  it('muestra "Requiere Seña: No" cuando requiereSena es false', async () => {
    const { component } = await setup({ ...mockReserva, requiereSena: false });
    const field = component['reservaFields']().find((f) => f.key === 'requiereSena');
    expect(field?.value).toBe('No');
  });
});
