import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@auth0/auth0-angular';
import { ConfirmDialogService, EstadoReserva, Procedencia } from '../../../shared';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { TipoCliente } from '../../clientes/models/cliente.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { UserService } from '../../../core/services/user.service';
import { ReservasService } from '../services/reservas.service';
import { ServicioService } from '../../servicios/services/servicio.service';
import {
  TipoDocumento,
  TipoReserva,
  type ReservaDetalleRespuestaDto,
} from '../models/reserva.model';
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

const mockServicioCantidad = {
  id: 5,
  nombre: 'Cancha',
  procedencia: 'SEDE',
  precioParticular: 500,
  precioSocio: 300,
  modalidadPrecio: 'POR_HORA',
  estado: 'HABILITADO',
  capacidad: null,
  cantidad: 10,
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
  horaInicio: '14:00',
  horaFin: '10:00',
  cantidadTotal: 4,
  cantidadMenores: 1,
  cantidad: null,
  importe: 4500,
  montoImpago: 0,
  formaPago: FormaPago.Efectivo,
  pago: false,
  requiereDocumentacion: true,
  tieneDocumentacion: false,
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
  requiereSena: false,
  plazoConfirmacion: null,
  fechaLimiteConfirmacion: null,
};

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
  cantidadTotal: null,
  cantidadMenores: null,
};

/**
 * Helper base: monta el TestBed con mocks por defecto y permite overridear
 * puntualmente route (id), ReservasService y ServicioService cuando un test
 * necesita simular un caso especial (id inválido, error de backend, etc.).
 */
async function setupCustom(options: {
  reserva?: ReservaDetalleRespuestaDto;
  id?: string;
  reservasServiceOverrides?: Partial<{
    getById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    calcularCosto: ReturnType<typeof vi.fn>;
    descargarComprobante: ReturnType<typeof vi.fn>;
  }>;
  servicioServiceOverrides?: Partial<{
    getAll: ReturnType<typeof vi.fn>;
    getFechasOcupadas: ReturnType<typeof vi.fn>;
  }>;
  confirmDialogOpen?: ReturnType<typeof vi.fn>;
}) {
  const {
    reserva = mockReserva,
    id = '42',
    reservasServiceOverrides = {},
    servicioServiceOverrides = {},
    confirmDialogOpen = vi.fn().mockReturnValue(of(false)),
  } = options;
  const confirmDialogClose = vi.fn();

  const getByIdSpy = reservasServiceOverrides.getById ?? vi.fn().mockReturnValue(of(reserva));
  const updateSpy = reservasServiceOverrides.update ?? vi.fn().mockReturnValue(of(undefined));
  const calcularCostoSpy =
    reservasServiceOverrides.calcularCosto ?? vi.fn().mockReturnValue(of({ costoTotal: 0 }));
  const descargarComprobanteSpy =
    reservasServiceOverrides.descargarComprobante ?? vi.fn().mockReturnValue(of(undefined));

  const getAllSpy =
    servicioServiceOverrides.getAll ?? vi.fn().mockReturnValue(of(page([mockServicioCapacidad])));
  const getFechasOcupadasSpy =
    servicioServiceOverrides.getFechasOcupadas ?? vi.fn().mockReturnValue(of([]));

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
          paramMap: of(convertToParamMap({ id })),
          snapshot: {
            paramMap: { get: (key: string) => (key === 'id' ? id : null) },
            queryParamMap: { get: () => null },
          },
        },
      },
      { provide: Router, useValue: { navigate: navigateSpy, navigateByUrl: navigateSpy } },
      { provide: ErrorHandlerService, useValue: { handle: handleSpy } },
      {
        provide: ConfirmDialogService,
        useValue: { open: confirmDialogOpen, close: confirmDialogClose },
      },
      {
        provide: ServicioService,
        useValue: { getAll: getAllSpy, getFechasOcupadas: getFechasOcupadasSpy },
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
              getById: getByIdSpy,
              update: updateSpy,
              calcularCosto: calcularCostoSpy,
              descargarComprobante: descargarComprobanteSpy,
            },
          },
        ],
      },
    })
    .compileComponents();

  const fixture: ComponentFixture<EditarReserva> = TestBed.createComponent(EditarReserva);
  fixture.componentRef.setInput('id', id);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();

  return {
    fixture,
    component,
    getByIdSpy,
    updateSpy,
    navigateSpy,
    handleSpy,
    getAllSpy,
    descargarComprobanteSpy,
    confirmDialogOpenSpy: confirmDialogOpen,
    confirmDialogCloseSpy: confirmDialogClose,
  };
}

/** Setup por defecto: reserva y id válidos, todos los mocks en su comportamiento "feliz". */
function setup(reserva: ReservaDetalleRespuestaDto = mockReserva, id = '42') {
  return setupCustom({ reserva, id });
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
      expect.objectContaining({
        filters: expect.objectContaining({ procedencia: Procedencia.Camping }),
      }),
    );
    expect(component['form'].get('servicioId')?.value).toBe('3');
    expect(component['servicios']().length).toBeGreaterThan(0);
  });

  it('para reserva COMUN deja busquedaRealizada en true y clienteBusqueda con los datos', async () => {
    const { component } = await setup();
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()?.nombre).toBe('Carlos Martínez Gómez');
    expect(component['clienteBusqueda']()?.documento).toBe('12345678');
  });

  it('para reserva COLABORACION deja busquedaRealizada en true y clienteBusqueda con los datos de la Empresa', async () => {
    const { component } = await setup(mockColaboracion);
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()?.nombre).toBe('Org Solidaria S.A.');
    expect(component['clienteBusqueda']()?.tipoCliente).toBe(TipoCliente.Empresa);
    // La Empresa se identifica por RUT: el documento precargado es el RUT, no la cédula.
    expect(component['clienteBusqueda']()?.documento).toBe('211003420017');
    expect(component['clienteBusqueda']()?.tipoDocumento).toBe(TipoDocumento.Rut);
  });

  it('reserva sin cliente asociado deja busquedaRealizada en true sin precargar datos de cliente', async () => {
    const reservaSinCliente: ReservaDetalleRespuestaDto = { ...mockReserva, cliente: null };
    const { component } = await setup(reservaSinCliente);
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()).toBeNull();
  });

  it('reserva con cantidad (modo cantidad, no capacidad) popula el campo cantidad', async () => {
    const reservaConCantidad: ReservaDetalleRespuestaDto = {
      ...mockReserva,
      cantidadTotal: null,
      cantidadMenores: null,
      cantidad: 2,
      procedencia: Procedencia.Sede,
      servicio: {
        id: 5,
        nombre: 'Cancha',
        procedencia: Procedencia.Sede,
        modalidadPrecio: 'POR_HORA',
      },
    };
    const { component } = await setupCustom({
      reserva: reservaConCantidad,
      servicioServiceOverrides: {
        getAll: vi.fn().mockReturnValue(of(page([mockServicioCantidad]))),
      },
    });
    expect(component['form'].get('cantidad')?.value).toBe('2');
  });

  it('los validadores de cliente quedan limpios (cliente es de sólo lectura)', async () => {
    const { component } = await setup();
    component['form'].get('documento')?.setValue(null);
    component['form'].get('nombre')?.setValue(null);
    component['form'].get('celular')?.setValue(null);
    expect(component['form'].get('documento')?.valid).toBe(true);
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

    it('COLABORACION: incluye los datos de la Empresa asociada, con RUT en lugar de cédula', async () => {
      const { component } = await setup(mockColaboracion);
      const fields = component['clienteFields']();
      expect(fields.find((f) => f.key === 'tipoCliente')?.value).toBe('Empresa');
      expect(fields.find((f) => f.key === 'rut')?.value).toBe('211003420017');
      expect(fields.find((f) => f.key === 'cedula')).toBeUndefined();
      expect(fields.find((f) => f.key === 'nombre')?.value).toBe('Org Solidaria S.A.');
      expect(fields.find((f) => f.key === 'telefono')?.value).toBe('099222222');
      expect(fields.find((f) => f.key === 'email')?.value).toBe('org@mail.com');
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

  it('onRangoSeleccionado actualiza fechaInicio y fechaFin', async () => {
    const { component } = await setup();
    component['onRangoSeleccionado']({ inicio: '2026-09-01', fin: '2026-09-05' });
    expect(component['form'].get('fechaInicio')?.value).toBe('2026-09-01');
    expect(component['form'].get('fechaFin')?.value).toBe('2026-09-05');
  });

  it('onConfirmar llama a update con el DTO correcto', async () => {
    const { component, updateSpy } = await setup();
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
  });

  it('onConfirmar con formulario inválido no llama a update', async () => {
    const { component, updateSpy } = await setup();
    component['form'].get('procedencia')?.setValue(null);
    component['onConfirmar']();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('onConfirmar con error del backend en update llama al errorHandler', async () => {
    const { component, updateSpy, handleSpy } = await setup();
    const error = new Error('Server error');
    updateSpy.mockReturnValue(throwError(() => error));
    component['onConfirmar']();
    expect(handleSpy).toHaveBeenCalledWith(error);
  });

  it('onCancelar navega a /reservas/:id (detalle)', async () => {
    const { component, navigateSpy } = await setup();
    component['onCancelar']();
    expect(navigateSpy).toHaveBeenCalledWith('/reservas/42');
  });

  describe('ofrecerComprobante (tras confirmar la modificación)', () => {
    it('ofrece el comprobante y, si se acepta, lo descarga con el id y navega al detalle', async () => {
      const { component, confirmDialogOpenSpy, descargarComprobanteSpy, navigateSpy } =
        await setupCustom({ confirmDialogOpen: vi.fn().mockReturnValue(of(true)) });

      component['onConfirmar']();

      expect(confirmDialogOpenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Reserva actualizada',
        }),
      );
      expect(descargarComprobanteSpy).toHaveBeenCalledWith(42);
      expect(navigateSpy).toHaveBeenCalledWith('/reservas/42');
    });

    it('si se rechaza la descarga, navega al detalle sin descargar', async () => {
      const { component, descargarComprobanteSpy, navigateSpy } = await setup();

      component['onConfirmar']();

      expect(descargarComprobanteSpy).not.toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith('/reservas/42');
    });

    it('navega al detalle de inmediato sin esperar a que termine la descarga', async () => {
      const descargaEnCurso = new Subject<void>(); // nunca completa dentro del test
      const { component, descargarComprobanteSpy, navigateSpy } = await setupCustom({
        confirmDialogOpen: vi.fn().mockReturnValue(of(true)),
        reservasServiceOverrides: {
          descargarComprobante: vi.fn().mockReturnValue(descargaEnCurso.asObservable()),
        },
      });

      component['onConfirmar']();

      // La descarga sigue pendiente y, aun así, ya se navegó al detalle.
      expect(descargarComprobanteSpy).toHaveBeenCalledWith(42);
      expect(navigateSpy).toHaveBeenCalledWith('/reservas/42');
    });

    it('si la descarga del comprobante falla, igualmente navega al detalle', async () => {
      const error = new Error('download error');
      const { component, navigateSpy, handleSpy } = await setupCustom({
        confirmDialogOpen: vi.fn().mockReturnValue(of(true)),
        reservasServiceOverrides: {
          descargarComprobante: vi.fn().mockReturnValue(throwError(() => error)),
        },
      });

      component['onConfirmar']();

      expect(handleSpy).toHaveBeenCalledWith(error);
      expect(navigateSpy).toHaveBeenCalledWith('/reservas/42');
    });

    it('si el componente se destruye antes de que el usuario responda, cierra el diálogo huérfano', async () => {
      const dialogSinResponder = new Subject<boolean>(); // nunca responde dentro del test
      const { fixture, component, confirmDialogCloseSpy, navigateSpy } = await setupCustom({
        confirmDialogOpen: vi.fn().mockReturnValue(dialogSinResponder.asObservable()),
      });

      component['onConfirmar']();
      fixture.destroy();

      expect(confirmDialogCloseSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).not.toHaveBeenCalledWith('/reservas/42');
    });

    it('si el usuario ya respondió, destruir el componente después no vuelve a cerrar el diálogo', async () => {
      const { fixture, component, confirmDialogCloseSpy } = await setupCustom({
        confirmDialogOpen: vi.fn().mockReturnValue(of(false)),
      });

      component['onConfirmar']();
      fixture.destroy();

      expect(confirmDialogCloseSpy).not.toHaveBeenCalled();
    });
  });

  it('idParam ausente o inválido no llama a getById', async () => {
    const getByIdSpy = vi.fn().mockReturnValue(of(mockReserva));
    const { getByIdSpy: spy } = await setupCustom({
      id: 'abc',
      reservasServiceOverrides: { getById: getByIdSpy },
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('error al cargar servicios: llama al errorHandler y la lista queda vacía', async () => {
    const error = new Error('HTTP error');
    const { component, handleSpy } = await setupCustom({
      servicioServiceOverrides: { getAll: vi.fn().mockReturnValue(throwError(() => error)) },
    });
    expect(handleSpy).toHaveBeenCalledWith(error);
    expect(component['servicios']().length).toBe(0);
  });

  it('getById con error: llama al errorHandler y navega a /reservas', async () => {
    const error = new Error('Not found');
    const { navigateSpy, handleSpy } = await setupCustom({
      id: '99',
      reservasServiceOverrides: { getById: vi.fn().mockReturnValue(throwError(() => error)) },
    });

    expect(handleSpy).toHaveBeenCalledWith(error);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });
});
