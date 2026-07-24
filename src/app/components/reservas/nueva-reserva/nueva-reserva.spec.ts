import { ActivatedRoute, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@auth0/auth0-angular';
import { NuevaReserva } from './nueva-reserva';
import { FormField } from '../../../shared';
import { ReservasService } from '../services/reservas.service';
import { ReservaClienteBusquedaService } from '../services/reserva-cliente-busqueda.service';
import { ServicioService } from '../../servicios/services/servicio.service';
import { ClientesService } from '../../clientes/services/cliente.service';
import { Procedencia } from '../../../shared';
import { EstadoSocio, TipoCliente } from '../../clientes/models/cliente.model';
import { PlazoConfirmacion, TipoDocumento, TipoReserva } from '../models/reserva.model';
import { UserService } from '../../../core/services/user.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { signal } from '@angular/core';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { SidebarService } from '../../../core/services/sidebar.service';

const mockAuthService = { user$: of({ name: 'Juan', email: 'j@e.com' }), logout: vi.fn() };
const mockUserService = { userInitials: () => 'JP', userEmail: () => 'j@e.com' };

const serviciosSede = [
  {
    id: 2,
    nombre: 'Salón',
    procedencia: 'SEDE',
    precioParticular: 1,
    precioSocio: 1,
    modalidadPrecio: 'POR_DIA',
    estado: 'HABILITADO',
    capacidad: 80,
    cantidad: null,
  },
  {
    id: 3,
    nombre: 'Cancha',
    procedencia: 'SEDE',
    precioParticular: 1,
    precioSocio: 1,
    modalidadPrecio: 'POR_HORA',
    estado: 'HABILITADO',
    capacidad: null,
    cantidad: 2,
  },
];

const detalleSocio = {
  id: 1,
  nombre: 'Juan Pérez',
  cedula: '12345672', // dígito verificador correcto: 2
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 5,
  estado: EstadoSocio.Activo,
  telefono: '099111111',
  email: 'juan@mail.com',
  observaciones: 'Cliente frecuente.',
};
const detalleParticular = {
  id: 2,
  nombre: 'Laura Fernández',
  cedula: '67890127', // dígito verificador correcto: 7
  tipoCliente: TipoCliente.Particular,
  numeroSocio: null,
  estado: null,
  telefono: '099222222',
  email: null,
  observaciones: null,
};
const detalleEmpresaPrecarga = {
  id: 3,
  nombre: 'Org Solidaria S.A.',
  cedula: null,
  rut: '211003420017',
  tipoCliente: TipoCliente.Empresa,
  numeroSocio: null,
  estado: null,
  telefono: '099333333',
  email: 'org@mail.com',
  observaciones: null,
};

const busquedaEmpresa = {
  id: 3,
  nombre: 'Org Solidaria S.A.',
  rut: '211003420017',
  telefono: '099333333',
  mail: 'org@mail.com',
  observaciones: null,
  tipoCliente: TipoCliente.Empresa,
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

describe('NuevaReserva', () => {
  let fixture: ComponentFixture<NuevaReserva>;
  let component: NuevaReserva;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let queryParamGet: ReturnType<typeof vi.fn>;
  let mockServicioService: {
    getAll: ReturnType<typeof vi.fn>;
    getFechasOcupadas: ReturnType<typeof vi.fn>;
  };
  let mockClientesService: {
    getAll: ReturnType<typeof vi.fn>;
    getByCedula: ReturnType<typeof vi.fn>;
    getByRut: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    getEstadoSocio: ReturnType<typeof vi.fn>;
  };
  let mockReservasService: {
    crear: ReturnType<typeof vi.fn>;
    calcularCosto: ReturnType<typeof vi.fn>;
    descargarComprobante: ReturnType<typeof vi.fn>;
  };
  let isMobile: ReturnType<typeof signal<boolean>>;
  let sidebarOpenSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigateSpy = vi.fn();
    queryParamGet = vi.fn().mockReturnValue(null);
    mockServicioService = {
      getAll: vi.fn(() => of(page(serviciosSede))),
      getFechasOcupadas: vi.fn(() => of([])),
    };
    mockClientesService = {
      getAll: vi.fn((params: { filters?: Record<string, string> }) =>
        of(page(params.filters?.['identificador'] === '12345678' ? [{ id: 1 }] : [])),
      ),
      getByCedula: vi.fn((cedula: string) => of(page(cedula === '12345672' ? [{ id: 1 }] : []))),
      getByRut: vi.fn((rut: string) =>
        rut === '211003420017'
          ? of(busquedaEmpresa)
          : throwError(() => new HttpErrorResponse({ status: 404 })),
      ),
      getById: vi.fn((id: number) =>
        of(id === 2 ? detalleParticular : id === 3 ? detalleEmpresaPrecarga : detalleSocio),
      ),
      getEstadoSocio: vi.fn(() => of({ id: 1, estado: EstadoSocio.Activo, numeroSocio: 5 })),
    };
    mockReservasService = {
      crear: vi.fn(() => of({ id: 99 })),
      calcularCosto: vi.fn(() => of({ costoTotal: 5000 })),
      descargarComprobante: vi.fn(() => of(undefined)),
    };
    isMobile = signal(false);
    sidebarOpenSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [NuevaReserva],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: navigateSpy } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: queryParamGet } } },
        },
        { provide: ErrorHandlerService, useValue: { handle: vi.fn() } },
        { provide: ServicioService, useValue: mockServicioService },
        { provide: ClientesService, useValue: mockClientesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: BreakpointService, useValue: { isMobile } },
        { provide: SidebarService, useValue: { open: sidebarOpenSpy } },
      ],
    })
      .overrideComponent(NuevaReserva, {
        set: {
          providers: [
            { provide: ReservasService, useValue: mockReservasService },
            ReservaClienteBusquedaService,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NuevaReserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  /** Campo "Tipo de cliente" renderizado, o `undefined` si no está presente. */
  const tipoClienteField = (): FormField | undefined => {
    fixture.detectChanges();
    return fixture.debugElement
      .queryAll(By.directive(FormField))
      .map((f) => f.componentInstance as FormField)
      .find((c) => c.config().key === 'tipoCliente');
  };

  /** Campo "Plazo para confirmar la reserva" renderizado, o `undefined` si no está presente. */
  const plazoConfirmacionField = (): FormField | undefined => {
    fixture.detectChanges();
    return fixture.debugElement
      .queryAll(By.directive(FormField))
      .map((f) => f.componentInstance as FormField)
      .find((c) => c.config().key === 'plazoConfirmacion');
  };

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el tipo de reserva por defecto es Común', () => {
    expect(component['form'].get('tipoReserva')?.value).toBe(TipoReserva.Comun);
  });

  it('el tipo de documento por defecto es Cédula', () => {
    expect(component['form'].get('tipoDocumento')?.value).toBe(TipoDocumento.Cedula);
  });

  it('al entrar desde Nueva Reserva se ofrece Colaboración sin fines de lucro', () => {
    const opciones = component['tipoReservaField']().options ?? [];
    expect(opciones.some((o) => o.value === TipoReserva.ColaboracionSinFines)).toBe(true);
  });

  it('confirmDisabled es true al inicio (form incompleto)', () => {
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('elegir procedencia pide los servicios a ServicioService y limpia el servicio elegido', () => {
    component['form'].get('servicioId')?.setValue('99');
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    expect(mockServicioService.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ procedencia: Procedencia.Sede }),
      }),
    );
    expect(component['servicios']()).toHaveLength(2);
    expect(component['form'].get('servicioId')?.value).toBeNull();
  });

  it('servicio con capacidad activa el modo capacidad', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('2');
    expect(component['modoCapacidad']()).toBe(true);
    expect(component['modoCantidad']()).toBe(false);
  });

  it('servicio con cantidad activa el modo cantidad', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('3');
    expect(component['modoCantidad']()).toBe(true);
    expect(component['modoCapacidad']()).toBe(false);
  });

  it('al seleccionar el rango de fechas calcula y muestra el costo de la reserva', () => {
    vi.useFakeTimers();
    try {
      component['form'].get('procedencia')?.setValue(Procedencia.Sede);
      component['form'].get('servicioId')?.setValue('2');
      component['onRangoSeleccionado']({ inicio: '2026-07-01', fin: '2026-07-03' });
      vi.advanceTimersByTime(300);
    } finally {
      vi.useRealTimers();
    }
    expect(mockReservasService.calcularCosto).toHaveBeenCalled();
    expect(component['costo']()).toBe(5000);
  });

  it('cambiar la cantidad vuelve a pedir el costo al backend', () => {
    vi.useFakeTimers();
    try {
      component['form'].get('procedencia')?.setValue(Procedencia.Sede);
      component['form'].get('servicioId')?.setValue('3');
      component['onRangoSeleccionado']({ inicio: '2026-07-01', fin: '2026-07-03' });
      component['form'].get('horaInicio')?.setValue('10:00');
      component['form'].get('horaFin')?.setValue('12:00');
      vi.advanceTimersByTime(300);
      mockReservasService.calcularCosto.mockClear();

      component['onControlChange']('cantidad', '4');
      vi.advanceTimersByTime(300);
    } finally {
      vi.useRealTimers();
    }
    expect(mockReservasService.calcularCosto).toHaveBeenCalled();
  });

  it('una cantidad negativa muestra error de inmediato', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('2');
    component['onControlChange']('cantidadTotal', '-1');
    fixture.detectChanges();
    expect(component['reservaErrors']()['cantidadTotal']).toBe(
      'La cantidad no puede ser negativa.',
    );
  });

  it('buscarCliente con cédula existente completa los datos y los deja readonly', () => {
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    expect(mockClientesService.getById).toHaveBeenCalledWith(1);
    expect(component['clienteBusqueda']()?.nombre).toBe('Juan Pérez');
    expect(component['clienteCamposReadonly']()).toBe(true);
    expect(component['esSocio']()).toBe(true);
  });

  it('al encontrar cliente por cédula muestra el tipo en sólo lectura (no se puede elegir)', () => {
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    const tipo = tipoClienteField();
    expect(tipo?.displayOnly()).toBe(true);
    expect(component['tipoClienteLabel']()).toBe('Socio');
  });

  it('buscarCliente sin coincidencia (cédula) habilita la carga manual', () => {
    component['form'].get('documento')?.setValue('00000000');
    component['buscarCliente']();
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()).toBeNull();
    expect(component['clienteCamposReadonly']()).toBe(false);
  });

  it('sin coincidencia no se muestra el campo tipo de cliente y se registra como Particular', () => {
    component['form'].get('documento')?.setValue('00000000');
    component['buscarCliente']();
    expect(component['mostrarFormularioManual']()).toBe(true);
    expect(tipoClienteField()).toBeUndefined();
    expect(component['form'].get('tipoCliente')?.value).toBe(TipoCliente.Particular);
  });

  it('sin coincidencia el DTO marca crearCliente y no envía clienteId', () => {
    component['form'].get('documento')?.setValue('00000000');
    component['buscarCliente']();
    const dto = component['construirDto']();
    expect(dto.crearCliente).toBe(true);
    expect(dto.clienteId).toBeNull();
  });

  it('con cliente encontrado el DTO no marca crearCliente y envía el clienteId', () => {
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    const dto = component['construirDto']();
    expect(dto.crearCliente).toBe(false);
    expect(dto.clienteId).toBe(1);
  });

  it('editar el documento después de verificar invalida la búsqueda y limpia los datos', () => {
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()).not.toBeNull();

    component['form'].get('documento')?.setValue('1234567');

    expect(component['busquedaRealizada']()).toBe(false);
    expect(component['clienteBusqueda']()).toBeNull();
    expect(component['form'].get('nombre')?.value).toBeNull();
  });

  it('calcula el costo como Particular cuando todavía no hay cliente encontrado', () => {
    vi.useFakeTimers();

    try {
      component['form'].get('procedencia')?.setValue(Procedencia.Sede);
      component['form'].get('servicioId')?.setValue('2');
      component['onRangoSeleccionado']({
        inicio: '2026-08-01',
        fin: '2026-08-03',
      });
      component['form'].get('cantidadTotal')?.setValue('4');

      vi.advanceTimersByTime(300);
    } finally {
      vi.useRealTimers();
    }

    expect(mockReservasService.calcularCosto).toHaveBeenCalledWith(
      expect.objectContaining({
        servicioId: 2,
        clienteId: null,
      }),
    );
  });

  it('recalcula el costo enviando el clienteId del cliente encontrado', () => {
    vi.useFakeTimers();

    try {
      component['form'].get('procedencia')?.setValue(Procedencia.Sede);
      component['form'].get('servicioId')?.setValue('2');
      component['onRangoSeleccionado']({
        inicio: '2026-08-01',
        fin: '2026-08-03',
      });
      component['form'].get('cantidadTotal')?.setValue('4');

      component['form'].get('documento')?.setValue('12345672');
      component['buscarCliente']();

      vi.advanceTimersByTime(300);
    } finally {
      vi.useRealTimers();
    }

    expect(mockReservasService.calcularCosto).toHaveBeenLastCalledWith(
      expect.objectContaining({
        servicioId: 2,
        clienteId: 1,
      }),
    );
  });

  it('al crear un cliente inline recalcula el costo con clienteId null', () => {
    vi.useFakeTimers();

    try {
      component['form'].get('procedencia')?.setValue(Procedencia.Sede);
      component['form'].get('servicioId')?.setValue('2');
      component['onRangoSeleccionado']({
        inicio: '2026-08-01',
        fin: '2026-08-03',
      });
      component['form'].get('cantidadTotal')?.setValue('4');

      component['form'].get('documento')?.setValue('00000000');
      component['buscarCliente']();

      vi.advanceTimersByTime(300);
    } finally {
      vi.useRealTimers();
    }

    expect(component['clienteBusqueda']()).toBeNull();

    expect(mockReservasService.calcularCosto).toHaveBeenLastCalledWith(
      expect.objectContaining({
        clienteId: null,
      }),
    );
  });

  // --- RUT / Empresa ---

  it('RUT inválido no dispara la búsqueda al backend', () => {
    component['form'].get('tipoDocumento')?.setValue(TipoDocumento.Rut);
    component['form'].get('documento')?.setValue('123'); // formato inválido
    component['buscarCliente']();
    expect(mockClientesService.getByRut).not.toHaveBeenCalled();
    expect(component['form'].get('documento')?.hasError('rutInvalido')).toBe(true);
  });

  it('Común con RUT de Empresa encontrada confirma con el clienteId de la Empresa', () => {
    component['form'].get('tipoDocumento')?.setValue(TipoDocumento.Rut);
    component['form'].get('documento')?.setValue('211003420017');
    component['buscarCliente']();
    expect(mockClientesService.getByRut).toHaveBeenCalledWith('211003420017');
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()?.tipoCliente).toBe(TipoCliente.Empresa);
    const dto = component['construirDto']();
    expect(dto.clienteId).toBe(3);
    expect(dto.crearCliente).toBe(false);
  });

  it('RUT válido no encontrado bloquea: muestra diálogo, no habilita campos manuales', () => {
    const errorSpy = vi.spyOn(component['errorDialog'], 'open');
    component['form'].get('tipoDocumento')?.setValue(TipoDocumento.Rut);
    component['form'].get('documento')?.setValue('999999999997'); // formato válido, no existe
    component['buscarCliente']();
    expect(mockClientesService.getByRut).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(component['busquedaRealizada']()).toBe(false);
    expect(component['mostrarFormularioManual']()).toBe(false);
  });

  it('RUT válido no encontrado marca el campo en rojo con el error visible tras el diálogo', () => {
    vi.spyOn(component['errorDialog'], 'open');
    component['form'].get('tipoDocumento')?.setValue(TipoDocumento.Rut);
    component['form'].get('documento')?.setValue('999999999997');
    component['buscarCliente']();
    fixture.detectChanges();
    expect(component['form'].get('documento')?.hasError('rutNoEncontrado')).toBe(true);
    expect(component['clienteErrors']()['documento']).toBe(
      'No se encontró ninguna Empresa registrada con ese RUT.',
    );
  });

  it('al editar el documento tras un RUT no encontrado se limpia el error', () => {
    vi.spyOn(component['errorDialog'], 'open');
    component['form'].get('tipoDocumento')?.setValue(TipoDocumento.Rut);
    component['form'].get('documento')?.setValue('999999999997');
    component['buscarCliente']();
    expect(component['form'].get('documento')?.hasError('rutNoEncontrado')).toBe(true);

    component['form'].get('documento')?.setValue('211003420018');
    expect(component['form'].get('documento')?.hasError('rutNoEncontrado')).toBe(false);
  });

  it('en Colaboración el tipoDocumento queda fijo en RUT y deshabilitado', () => {
    component['form'].get('tipoReserva')?.setValue(TipoReserva.ColaboracionSinFines);
    expect(component['form'].get('tipoDocumento')?.value).toBe(TipoDocumento.Rut);
    expect(component['form'].get('tipoDocumento')?.disabled).toBe(true);
    expect(component['documentoRadioDisabled']()).toBe(true);
  });

  it('Colaboración con RUT de Empresa encontrada confirma con clienteId real', () => {
    component['form'].get('tipoReserva')?.setValue(TipoReserva.ColaboracionSinFines);
    component['form'].get('documento')?.setValue('211003420017');
    component['buscarCliente']();
    expect(mockClientesService.getByRut).toHaveBeenCalledWith('211003420017');
    const dto = component['construirDto']();
    expect(dto.clienteId).toBe(3);
    expect(dto.crearCliente).toBe(false);
  });

  it('confirmar con socio DE_BAJA muestra error bloqueante y no crea la reserva', () => {
    mockClientesService.getEstadoSocio.mockReturnValue(
      of({ id: 1, estado: EstadoSocio.Baja, numeroSocio: 5 }),
    );
    const errorSpy = vi.spyOn(component['errorDialog'], 'open');
    component['verificarSocioYGuardar'](1);
    expect(errorSpy).toHaveBeenCalled();
    expect(mockReservasService.crear).not.toHaveBeenCalled();
  });

  it('confirmar con socio INACTIVO advierte y, si se confirma, crea la reserva', () => {
    mockClientesService.getEstadoSocio.mockReturnValue(
      of({ id: 1, estado: EstadoSocio.Inactivo, numeroSocio: 5 }),
    );
    vi.spyOn(component['confirmDialog'], 'open').mockReturnValue(of(true));
    component['verificarSocioYGuardar'](1);
    expect(mockReservasService.crear).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('socio ACTIVO crea la reserva sin advertencias', () => {
    component['verificarSocioYGuardar'](1);
    expect(mockReservasService.crear).toHaveBeenCalled();
  });

  it('precarga el cliente cuando se entra con clienteId en la query (Particular)', async () => {
    queryParamGet.mockReturnValue('2');
    const f = TestBed.createComponent(NuevaReserva);
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance['clientePrellenado']()).toBe(true);
    expect(f.componentInstance['clienteBusqueda']()?.tipoCliente).toBe(TipoCliente.Particular);
  });

  it('al precargar un cliente Particular no se ofrece Colaboración sin fines de lucro', async () => {
    queryParamGet.mockReturnValue('2');
    const f = TestBed.createComponent(NuevaReserva);
    f.detectChanges();
    await f.whenStable();
    const opciones = f.componentInstance['tipoReservaField']().options ?? [];
    expect(opciones.some((o) => o.value === TipoReserva.ColaboracionSinFines)).toBe(false);
  });

  it('al precargar un cliente Empresa sí se ofrece Colaboración sin fines de lucro', async () => {
    queryParamGet.mockReturnValue('3');
    const f = TestBed.createComponent(NuevaReserva);
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance['clienteBusqueda']()?.tipoCliente).toBe(TipoCliente.Empresa);
    const opciones = f.componentInstance['tipoReservaField']().options ?? [];
    expect(opciones.some((o) => o.value === TipoReserva.ColaboracionSinFines)).toBe(true);
  });

  it('onCancelar navega a /reservas', () => {
    component['onCancelar']();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('mostrarObservaciones es true cuando el cliente encontrado tiene observaciones', () => {
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    expect(component['observacionesCliente']()).toBe('Cliente frecuente.');
    expect(component['mostrarObservaciones']()).toBe(true);
  });

  it('lupitaVisible es true para reservas de Colaboración (también se busca por RUT)', () => {
    component['form'].get('tipoReserva')?.setValue(TipoReserva.ColaboracionSinFines);
    expect(component['lupitaVisible']()).toBe(true);
  });

  it('lupitaVisible es false cuando el cliente está prellenado', async () => {
    queryParamGet.mockReturnValue('2');
    const f = TestBed.createComponent(NuevaReserva);
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance['lupitaVisible']()).toBe(false);
  });

  it('cambiar cantidadMenores vuelve a pedir el costo al backend', () => {
    vi.useFakeTimers();
    try {
      component['form'].get('procedencia')?.setValue(Procedencia.Sede);
      component['form'].get('servicioId')?.setValue('2');
      component['onRangoSeleccionado']({ inicio: '2026-07-01', fin: '2026-07-03' });
      vi.advanceTimersByTime(300);
      mockReservasService.calcularCosto.mockClear();

      component['onControlChange']('cantidadMenores', '2');
      vi.advanceTimersByTime(300);
    } finally {
      vi.useRealTimers();
    }
    expect(mockReservasService.calcularCosto).toHaveBeenCalled();
  });

  it('onFieldBlur marca el campo como touched y muestra su error de validación', () => {
    component['onFieldBlur']('procedencia');
    expect(component['reservaErrors']()['procedencia']).toBe('La procedencia es obligatoria.');
  });

  it('error al cargar servicios: llama al errorHandler y la lista queda vacía', () => {
    const error = new Error('HTTP error');
    mockServicioService.getAll.mockReturnValue(throwError(() => error));
    const handleSpy = vi.spyOn(component['errorHandler'], 'handle');
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    expect(handleSpy).toHaveBeenCalledWith(error);
    expect(component['servicios']()).toHaveLength(0);
  });

  it('guardar con error del backend llama al errorHandler', () => {
    const error = new Error('Server error');
    mockReservasService.crear.mockReturnValue(throwError(() => error));
    const handleSpy = vi.spyOn(component['errorHandler'], 'handle');
    component['guardar']();
    expect(handleSpy).toHaveBeenCalledWith(error);
  });

  it('tras crear ofrece el comprobante y, si se confirma, lo descarga con el id y navega', () => {
    vi.spyOn(component['confirmDialog'], 'open').mockReturnValue(of(true));
    component['guardar']();
    expect(mockReservasService.crear).toHaveBeenCalled();
    expect(mockReservasService.descargarComprobante).toHaveBeenCalledWith(99);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('navega al listado de inmediato sin esperar a que termine la descarga', () => {
    vi.spyOn(component['confirmDialog'], 'open').mockReturnValue(of(true));
    const descargaEnCurso = new Subject<void>(); // nunca completa dentro del test
    mockReservasService.descargarComprobante.mockReturnValue(descargaEnCurso.asObservable());
    component['guardar']();
    // La descarga sigue pendiente y, aun así, ya se navegó al listado.
    expect(mockReservasService.descargarComprobante).toHaveBeenCalledWith(99);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('tras crear, si se rechaza la descarga navega al listado sin descargar', () => {
    vi.spyOn(component['confirmDialog'], 'open').mockReturnValue(of(false));
    component['guardar']();
    expect(mockReservasService.descargarComprobante).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('si la descarga del comprobante falla, igualmente navega al listado', () => {
    vi.spyOn(component['confirmDialog'], 'open').mockReturnValue(of(true));
    const error = new Error('download error');
    mockReservasService.descargarComprobante.mockReturnValue(throwError(() => error));
    const handleSpy = vi.spyOn(component['errorHandler'], 'handle');
    component['guardar']();
    expect(handleSpy).toHaveBeenCalledWith(error);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('verificarSocioYGuardar con error en getEstadoSocio llama al errorHandler', () => {
    const error = new Error('Network error');
    mockClientesService.getEstadoSocio.mockReturnValue(throwError(() => error));
    const handleSpy = vi.spyOn(component['errorHandler'], 'handle');
    component['verificarSocioYGuardar'](1);
    expect(handleSpy).toHaveBeenCalledWith(error);
  });

  it('buscarCliente con documento vacío no dispara la búsqueda y marca el campo como touched', () => {
    component['form'].get('documento')?.setValue('');
    component['buscarCliente']();
    expect(component['clienteErrors']()['documento']).toBe('El documento es obligatorio.');
    expect(mockClientesService.getByCedula).not.toHaveBeenCalled();
  });

  it('buscarCliente con error en buscarPorCedula llama al errorHandler', () => {
    const error = new Error('Network error');
    mockClientesService.getByCedula.mockReturnValue(throwError(() => error));
    const handleSpy = vi.spyOn(component['errorHandler'], 'handle');
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    expect(handleSpy).toHaveBeenCalledWith(error);
  });

  it('onConfirmar con formulario inválido no envía la solicitud', () => {
    component['onConfirmar']();
    expect(mockReservasService.crear).not.toHaveBeenCalled();
  });

  it('onConfirmar en Colaboración con RUT encontrado llama a guardar directamente', () => {
    vi.spyOn(component['confirmDialog'], 'open').mockReturnValue(of(false));
    component['form'].get('tipoReserva')?.setValue(TipoReserva.ColaboracionSinFines);
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('2');
    component['form'].get('fechaInicio')?.setValue('2026-08-01');
    component['form'].get('fechaFin')?.setValue('2026-08-05');
    component['form'].get('cantidadTotal')?.setValue('4');
    component['form'].get('documento')?.setValue('211003420017');
    component['buscarCliente']();
    component['onConfirmar']();
    expect(mockReservasService.crear).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('onConfirmar COMUN con socio encontrado delega a verificarSocioYGuardar', () => {
    vi.spyOn(component['confirmDialog'], 'open').mockReturnValue(of(false));
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('2');
    component['form'].get('fechaInicio')?.setValue('2026-08-01');
    component['form'].get('fechaFin')?.setValue('2026-08-05');
    component['form'].get('cantidadTotal')?.setValue('4');
    component['onConfirmar']();
    expect(mockClientesService.getEstadoSocio).toHaveBeenCalledWith(1);
    expect(mockReservasService.crear).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('buscarCliente con cédula de formato inválido no dispara la búsqueda y muestra el error', () => {
    component['form'].get('documento')?.setValue('12345678'); // verificador incorrecto: esperado 2, tiene 8
    component['buscarCliente']();
    expect(mockClientesService.getByCedula).not.toHaveBeenCalled();
    expect(component['form'].get('documento')?.hasError('cedulaInvalida')).toBe(true);
  });

  it('servicio con modalidadPrecio POR_HORA activa el modo hora', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('3'); // Cancha: POR_HORA
    expect(component['modoHora']()).toBe(true);
  });

  it('servicio sin modalidad POR_HORA no activa el modo hora', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('2'); // Salón: POR_DIA
    expect(component['modoHora']()).toBe(false);
  });

  it('en modo hora, horaInicio y horaFin son requeridos', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('3');
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['reservaErrors']()['horaInicio']).toBe('La hora de inicio es obligatoria.');
    expect(component['reservaErrors']()['horaFin']).toBe('La hora de fin es obligatoria.');
  });

  it('construirDto envía horaInicio y horaFin cuando la modalidad es POR_HORA', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('3');
    component['onControlChange']('horaInicio', '09:00');
    component['onControlChange']('horaFin', '11:00');
    const dto = component['construirDto']();
    expect(dto.horaInicio).toBe('09:00');
    expect(dto.horaFin).toBe('11:00');
  });

  it('construirDto envía null para horaInicio y horaFin cuando la modalidad no es POR_HORA', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('2'); // Salón: POR_DIA
    const dto = component['construirDto']();
    expect(dto.horaInicio).toBeNull();
    expect(dto.horaFin).toBeNull();
  });

  // --- Plazo de confirmación ---

  it('mostrarPlazoConfirmacion es false cuando no requiere seña ni documentación', () => {
    expect(component['mostrarPlazoConfirmacion']()).toBe(false);
    expect(plazoConfirmacionField()).toBeUndefined();
  });

  it('marcar requiereSena muestra el select de plazo de confirmación', () => {
    component['onCheckboxChange']('requiereSena', true);
    expect(component['mostrarPlazoConfirmacion']()).toBe(true);
    expect(plazoConfirmacionField()).toBeDefined();
  });

  it('marcar requiereDocumentacion también muestra el select de plazo de confirmación', () => {
    component['onCheckboxChange']('requiereDocumentacion', true);
    expect(component['mostrarPlazoConfirmacion']()).toBe(true);
    expect(plazoConfirmacionField()).toBeDefined();
  });

  it('el plazo de confirmación es obligatorio mientras el select está visible', () => {
    component['onCheckboxChange']('requiereSena', true);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['reservaErrors']()['plazoConfirmacion']).toBe(
      'El plazo para confirmar la reserva es obligatorio.',
    );
  });

  it('desmarcar ambos checkboxes limpia el plazo y oculta el select', () => {
    component['onCheckboxChange']('requiereSena', true);
    component['form'].get('plazoConfirmacion')?.setValue(PlazoConfirmacion.TresMeses);

    component['onCheckboxChange']('requiereSena', false);

    expect(component['form'].get('plazoConfirmacion')?.value).toBeNull();
    expect(component['mostrarPlazoConfirmacion']()).toBe(false);
    expect(plazoConfirmacionField()).toBeUndefined();
  });

  it('el select sigue visible si se desmarca uno mientras el otro sigue marcado', () => {
    component['onCheckboxChange']('requiereSena', true);
    component['onCheckboxChange']('requiereDocumentacion', true);
    component['form'].get('plazoConfirmacion')?.setValue(PlazoConfirmacion.VeinticuatroHoras);

    component['onCheckboxChange']('requiereSena', false);

    expect(component['mostrarPlazoConfirmacion']()).toBe(true);
    expect(component['form'].get('plazoConfirmacion')?.value).toBe(
      PlazoConfirmacion.VeinticuatroHoras,
    );
  });

  it('plazoConfirmacion viaja en el DTO cuando se seleccionó', () => {
    component['onCheckboxChange']('requiereSena', true);
    component['form'].get('plazoConfirmacion')?.setValue(PlazoConfirmacion.VeinticuatroHoras);
    const dto = component['construirDto']();
    expect(dto.plazoConfirmacion).toBe(PlazoConfirmacion.VeinticuatroHoras);
  });

  it('sin requerir seña ni documentación el DTO envía plazoConfirmacion null', () => {
    const dto = component['construirDto']();
    expect(dto.plazoConfirmacion).toBeNull();
  });
  it('debería iniciar el wizard en el primer paso', () => {
    expect(component['currentStep']()).toBe(0);
  });

  it('debería definir los tres pasos del wizard', () => {
    expect(component['steps']).toEqual([
      { label: 'Reserva' },
      { label: 'Cliente' },
      { label: 'Adicional' },
    ]);
  });

  it('next debería avanzar al siguiente paso cuando el paso actual es válido', () => {
    component['form'].patchValue({
      tipoReserva: TipoReserva.Comun,
      procedencia: Procedencia.Sede,
      servicioId: '1',
      fechaInicio: '2026-07-20',
      fechaFin: '2026-07-21',
    });

    component['next']();

    expect(component['currentStep']()).toBe(1);
  });

  it('next no debería avanzar más allá del último paso', () => {
    component['currentStep'].set(2);

    component['next']();

    expect(component['currentStep']()).toBe(2);
  });

  it('previous debería volver al paso anterior', () => {
    component['currentStep'].set(2);

    component['previous']();

    expect(component['currentStep']()).toBe(1);
  });

  it('previous no debería retroceder antes del primer paso', () => {
    component['previous']();

    expect(component['currentStep']()).toBe(0);
  });
  it('debería deshabilitar Siguiente en el primer paso cuando faltan datos obligatorios', () => {
    component['currentStep'].set(0);

    expect(component['nextDisabled']()).toBe(true);
  });

  it('no debería avanzar desde el primer paso cuando está incompleto', () => {
    component['currentStep'].set(0);

    component['next']();

    expect(component['currentStep']()).toBe(0);
  });
  it('debería mostrar el wizard en resolución mobile', () => {
    isMobile.set(true);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('app-mob-page-header'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-mob-stepper'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-mob-step-card'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-mob-step-footer'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-page-layout'))).toBeNull();
  });

  it('debería mantener el formulario desktop fuera de resolución mobile', () => {
    isMobile.set(false);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('app-page-layout'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('app-mob-page-header'))).toBeNull();
  });
  it('debería abrir el sidebar desde el encabezado mobile', () => {
    isMobile.set(true);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.css('app-mob-page-header'));
    header.triggerEventHandler('menuToggled');

    expect(sidebarOpenSpy).toHaveBeenCalled();
  });
  it('debería mostrar Información de la Reserva en el primer paso', () => {
    isMobile.set(true);
    component['currentStep'].set(0);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Información de la Reserva');
  });

  it('debería mostrar Información del Cliente en el segundo paso', () => {
    isMobile.set(true);
    component['currentStep'].set(1);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Información del Cliente');
  });

  it('debería mostrar Información Adicional y el resumen en el último paso', () => {
    isMobile.set(true);
    component['currentStep'].set(2);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Información Adicional');
    expect(text).toContain('Resumen de la Reserva');
  });
  it('debería deshabilitar Siguiente en el paso cliente si todavía no se buscó el documento', () => {
    component['currentStep'].set(1);
    component['form'].get('documento')?.setValue('12345672');

    expect(component['nextDisabled']()).toBe(true);
  });

  it('debería habilitar Siguiente si se encontró un cliente válido', () => {
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    component['currentStep'].set(1);

    expect(component['nextDisabled']()).toBe(false);
  });

  it('debería mantener deshabilitado Siguiente si la cédula no existe y faltan datos manuales', () => {
    component['form'].get('documento')?.setValue('00000000');
    component['buscarCliente']();
    component['currentStep'].set(1);

    expect(component['mostrarFormularioManual']()).toBe(true);
    expect(component['nextDisabled']()).toBe(true);
  });

  it('debería habilitar Siguiente tras completar el alta manual del cliente', () => {
    component['form'].get('documento')?.setValue('00000000');
    component['buscarCliente']();

    component['form'].patchValue({
      nombre: 'Cliente nuevo',
      celular: '099123456',
      email: 'cliente@mail.com',
    });

    component['currentStep'].set(1);

    expect(component['nextDisabled']()).toBe(false);
  });
  it('debería conservar los datos del formulario al avanzar y retroceder', () => {
    component['form'].get('notas')?.setValue('Nota persistente');
    component['currentStep'].set(2);

    component['previous']();
    component['previous']();

    expect(component['currentStep']()).toBe(0);
    expect(component['form'].get('notas')?.value).toBe('Nota persistente');
  });
  it('el footer mobile debería retroceder al emitir previous', () => {
    isMobile.set(true);
    component['currentStep'].set(1);
    fixture.detectChanges();

    const footer = fixture.debugElement.query(By.css('app-mob-step-footer'));
    footer.triggerEventHandler('previous');

    expect(component['currentStep']()).toBe(0);
  });
  it('el footer mobile debería avanzar cuando el paso actual es válido', () => {
    isMobile.set(true);
    component['currentStep'].set(1);

    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();

    fixture.detectChanges();

    const footer = fixture.debugElement.query(By.css('app-mob-step-footer'));
    footer.triggerEventHandler('next');

    expect(component['currentStep']()).toBe(2);
  });
  it('debería habilitar Siguiente en el paso reserva cuando el modo capacidad está completo', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('2');
    component['form'].patchValue({
      fechaInicio: '2026-08-01',
      fechaFin: '2026-08-03',
      cantidadTotal: '4',
    });
    component['currentStep'].set(0);

    expect(component['modoCapacidad']()).toBe(true);
    expect(component['nextDisabled']()).toBe(false);
  });
  it('debería deshabilitar Siguiente si falta la cantidad en modo cantidad', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('3');
    component['form'].patchValue({
      fechaInicio: '2026-08-01',
      fechaFin: '2026-08-03',
      cantidad: null,
      horaInicio: '10:00',
      horaFin: '12:00',
    });
    component['currentStep'].set(0);

    expect(component['modoCantidad']()).toBe(true);
    expect(component['nextDisabled']()).toBe(true);
  });
  it('debería deshabilitar Siguiente si faltan las horas en modo por hora', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('3');
    component['form'].patchValue({
      fechaInicio: '2026-08-01',
      fechaFin: '2026-08-03',
      cantidad: '1',
      horaInicio: null,
      horaFin: null,
    });
    component['currentStep'].set(0);

    expect(component['modoHora']()).toBe(true);
    expect(component['nextDisabled']()).toBe(true);
  });
  it('debería habilitar Siguiente cuando el modo por hora está completo', () => {
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('3');
    component['form'].patchValue({
      fechaInicio: '2026-08-01',
      fechaFin: '2026-08-03',
      cantidad: '1',
      horaInicio: '10:00',
      horaFin: '12:00',
    });
    component['currentStep'].set(0);

    expect(component['nextDisabled']()).toBe(false);
  });
  it('debería deshabilitar Siguiente si el email manual es inválido', () => {
    component['form'].get('documento')?.setValue('00000000');
    component['buscarCliente']();

    component['form'].patchValue({
      nombre: 'Cliente nuevo',
      celular: '099123456',
      email: 'correo-invalido',
    });

    component['currentStep'].set(1);

    expect(component['nextDisabled']()).toBe(true);
  });
  it('debería validar solamente el documento cuando el cliente está en modo readonly', () => {
    component['form'].get('documento')?.setValue('12345672');
    component['buscarCliente']();
    component['currentStep'].set(1);

    expect(component['clienteCamposReadonly']()).toBe(true);
    expect(component['nextDisabled']()).toBe(false);
  });
});
