import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@auth0/auth0-angular';
import { EstadoReserva, Procedencia } from '../../../shared';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { TipoCliente } from '../../clientes/models/cliente.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { UserService } from '../../../core/services/user.service';
import { ReservasService } from '../services/reservas.service';
import { ServicioService } from '../../servicios/services/servicio.service';
import { TipoReserva, type ReservaDetalleRespuestaDto } from '../models/reserva.model';
import { EditarReserva } from './editar-reserva';

const mockAuthService = {
  user$: of({ name: 'Juan Pérez', email: 'juan@example.com' }),
  logout: vi.fn(),
};
const mockUserService = { userInitials: () => 'JP', userEmail: () => 'juan@example.com' };

const mockServicioCapacidad = {
  id: 3,
  nombre: 'Hospedaje en camping',
  procedencia: 'CAMPING',
  precioParticular: 1500,
  precioSocio: 1000,
  modalidadPrecio: 'POR_DIA',
  estado: 'HABILITADO',
  capacidad: 20,
  cantidad: null,
};

const page = <T>(content: T[]) => ({
  content,
  page: 0,
  size: content.length,
  totalElements: content.length,
  totalPages: 1,
  first: true,
  last: true,
});

const mockReserva: ReservaDetalleRespuestaDto = {
  id: 42,
  tipoReserva: TipoReserva.Comun,
  estado: EstadoReserva.Confirmada,
  procedencia: Procedencia.Camping,
  fechaEntrada: '2026-08-10',
  fechaSalida: '2026-08-15',
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

const mockColaboracion: ReservaDetalleRespuestaDto = {
  ...mockReserva,
  tipoReserva: TipoReserva.ColaboracionSinFines,
  cliente: null,
  rut: '21-123456-7',
  cantidadTotal: null,
  cantidadMenores: null,
};

async function setup(reserva: ReservaDetalleRespuestaDto = mockReserva, id = '42') {
  const getByIdSpy = vi.fn().mockReturnValue(of(reserva));
  const updateSpy = vi.fn().mockReturnValue(of(undefined));
  const calcularCostoSpy = vi.fn().mockReturnValue(of({ costo: 0 }));
  const navigateSpy = vi.fn();
  const handleSpy = vi.fn();
  const getAllSpy = vi.fn().mockReturnValue(of(page([mockServicioCapacidad])));
  const getFechasOcupadasSpy = vi.fn().mockReturnValue(of([]));

  await TestBed.configureTestingModule({
    imports: [EditarReserva],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ id })),
          snapshot: { paramMap: { get: (key: string) => (key === 'id' ? id : null) } },
        },
      },
      { provide: Router, useValue: { navigate: navigateSpy } },
      { provide: ErrorHandlerService, useValue: { handle: handleSpy } },
      { provide: ServicioService, useValue: { getAll: getAllSpy, getFechasOcupadas: getFechasOcupadasSpy } },
      { provide: AuthService, useValue: mockAuthService },
      { provide: UserService, useValue: mockUserService },
    ],
  })
    .overrideComponent(EditarReserva, {
      set: {
        providers: [
          {
            provide: ReservasService,
            useValue: { getById: getByIdSpy, update: updateSpy, calcularCosto: calcularCostoSpy },
          },
        ],
      },
    })
    .compileComponents();

  const fixture: ComponentFixture<EditarReserva> = TestBed.createComponent(EditarReserva);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, component, getByIdSpy, updateSpy, navigateSpy, handleSpy, getAllSpy };
}

describe('EditarReserva', () => {
  it('debería crear el componente', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('llama a getById con el id numérico de la ruta', async () => {
    const { getByIdSpy } = await setup();
    expect(getByIdSpy).toHaveBeenCalledWith(42);
  });

  it('popula el formulario con las fechas y notas de la reserva', async () => {
    const { component } = await setup();
    expect(component['form'].get('fechaInicio')?.value).toBe('2026-08-10');
    expect(component['form'].get('fechaFin')?.value).toBe('2026-08-15');
    expect(component['form'].get('notas')?.value).toBe('Llegan a las 14hs');
    expect(component['form'].get('procedencia')?.value).toBe(Procedencia.Camping);
  });

  it('carga los servicios y setea el servicioId después de cargar la reserva', async () => {
    const { component, getAllSpy } = await setup();
    expect(getAllSpy).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.objectContaining({ procedencia: Procedencia.Camping }) }),
    );
    expect(component['form'].get('servicioId')?.value).toBe('3');
    expect(component['servicios']().length).toBeGreaterThan(0);
  });

  it('para reserva COMUN deja busquedaRealizada en true y clienteBusqueda con los datos', async () => {
    const { component } = await setup();
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()?.nombre).toBe('Carlos Martínez Gómez');
    expect(component['clienteBusqueda']()?.cedula).toBe('12345678');
  });

  it('para reserva COLABORACION deja busquedaRealizada en true y clienteBusqueda en null', async () => {
    const { component } = await setup(mockColaboracion);
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()).toBeNull();
  });

  it('los validadores de cliente quedan limpios (cliente es de sólo lectura)', async () => {
    const { component } = await setup();
    component['form'].get('cedula')?.setValue(null);
    component['form'].get('nombre')?.setValue(null);
    component['form'].get('celular')?.setValue(null);
    expect(component['form'].get('cedula')?.valid).toBe(true);
    expect(component['form'].get('nombre')?.valid).toBe(true);
    expect(component['form'].get('celular')?.valid).toBe(true);
  });

  describe('clienteFields', () => {
    it('COMUN: incluye tipoCliente, cedula, nombre, telefono y email del DTO', async () => {
      const { component } = await setup();
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'cedula')?.value).toBe('12345678');
      expect(fields.find((f) => f.key === 'nombre')?.value).toBe('Carlos Martínez Gómez');
      expect(fields.find((f) => f.key === 'tipoCliente')?.value).toBe('Socio');
      expect(fields.find((f) => f.key === 'telefono')?.value).toBe('+598 99 123 456');
      expect(fields.find((f) => f.key === 'email')?.value).toBe('carlos.martinez@email.com');
    });

    it('COLABORACION: incluye sólo el RUT', async () => {
      const { component } = await setup(mockColaboracion);
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'rut')?.value).toBe('21-123456-7');
      expect(fields.find((f) => f.key === 'cedula')).toBeUndefined();
      expect(fields.find((f) => f.key === 'nombre')).toBeUndefined();
    });
  });

  it('tipoReservaLabel devuelve el label legible del tipo de reserva', async () => {
    const { component } = await setup();
    expect(component['tipoReservaLabel']()).toBe('Común');
  });

  it('registroData formatea el entityId como RSV-042', async () => {
    const { component } = await setup();
    expect(component['registroData']()?.entityId).toBe('RSV-042');
    expect(component['registroData']()?.registradoPor).toBe('Juan Pérez');
  });

  it('onConfirmar llama a update con el DTO correcto y navega al detalle', async () => {
    const { component, updateSpy, navigateSpy } = await setup();
    component['onConfirmar']();
    expect(updateSpy).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        procedencia: Procedencia.Camping,
        servicioId: 3,
        fechaInicio: '2026-08-10',
        fechaFin: '2026-08-15',
        cantidadTotal: 4,
        cantidadMenores: 1,
        cantidad: null,
        notas: 'Llegan a las 14hs',
      }),
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', '42']);
  });

  it('onCancelar navega a /reservas/:id (detalle)', async () => {
    const { component, navigateSpy } = await setup();
    component['onCancelar']();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', '42']);
  });

  it('getById con error: llama al errorHandler y navega a /reservas', async () => {
    const error = new Error('Not found');
    const navigateSpy = vi.fn();
    const handleSpy = vi.fn();

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [EditarReserva],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '99' })),
            snapshot: { paramMap: { get: (key: string) => (key === 'id' ? '99' : null) } },
          },
        },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: ErrorHandlerService, useValue: { handle: handleSpy } },
        {
          provide: ServicioService,
          useValue: { getAll: vi.fn().mockReturnValue(of(page([]))), getFechasOcupadas: vi.fn().mockReturnValue(of([])) },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideComponent(EditarReserva, {
        set: {
          providers: [
            {
              provide: ReservasService,
              useValue: {
                getById: vi.fn().mockReturnValue(throwError(() => error)),
                update: vi.fn(),
                calcularCosto: vi.fn().mockReturnValue(of({ costo: 0 })),
              },
            },
          ],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(EditarReserva);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(handleSpy).toHaveBeenCalledWith(error);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });
});
