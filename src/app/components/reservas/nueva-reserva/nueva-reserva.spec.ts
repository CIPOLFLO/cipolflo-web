import { ActivatedRoute, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
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
import { TipoReserva } from '../models/reserva.model';
import { UserService } from '../../../core/services/user.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

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
    getById: ReturnType<typeof vi.fn>;
    getEstadoSocio: ReturnType<typeof vi.fn>;
  };
  let mockReservasService: {
    crear: ReturnType<typeof vi.fn>;
    calcularCosto: ReturnType<typeof vi.fn>;
  };

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
      getById: vi.fn((id: number) => of(id === 2 ? detalleParticular : detalleSocio)),
      getEstadoSocio: vi.fn(() => of({ id: 1, estado: EstadoSocio.Activo, numeroSocio: 5 })),
    };
    mockReservasService = {
      crear: vi.fn(() => of({ id: 99 })),
      calcularCosto: vi.fn(() => of({ costo: 5000 })),
    };

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

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el tipo de reserva por defecto es Común', () => {
    expect(component['form'].get('tipoReserva')?.value).toBe(TipoReserva.Comun);
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
    expect(component['servicios']().length).toBe(2);
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
    component['form'].get('cedula')?.setValue('12345672');
    component['buscarCliente']();
    expect(mockClientesService.getById).toHaveBeenCalledWith(1);
    expect(component['clienteBusqueda']()?.nombre).toBe('Juan Pérez');
    expect(component['clienteCamposReadonly']()).toBe(true);
    expect(component['esSocio']()).toBe(true);
  });

  it('al encontrar cliente por cédula muestra el tipo en sólo lectura (no se puede elegir)', () => {
    component['form'].get('cedula')?.setValue('12345672');
    component['buscarCliente']();
    const tipo = tipoClienteField();
    expect(tipo?.displayOnly()).toBe(true);
    expect(component['tipoClienteLabel']()).toBe('Socio');
  });

  it('buscarCliente sin coincidencia habilita la carga manual', () => {
    component['form'].get('cedula')?.setValue('00000000');
    component['buscarCliente']();
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()).toBeNull();
    expect(component['clienteCamposReadonly']()).toBe(false);
  });

  it('sin coincidencia no se muestra el campo tipo de cliente y se registra como Particular', () => {
    component['form'].get('cedula')?.setValue('00000000');
    component['buscarCliente']();
    expect(component['mostrarFormularioManual']()).toBe(true);
    expect(tipoClienteField()).toBeUndefined();
    expect(component['form'].get('tipoCliente')?.value).toBe(TipoCliente.Particular);
  });

  it('sin coincidencia el DTO marca crearCliente y no envía clienteId', () => {
    component['form'].get('cedula')?.setValue('00000000');
    component['buscarCliente']();
    const dto = component['construirDto']();
    expect(dto.crearCliente).toBe(true);
    expect(dto.clienteId).toBeNull();
  });

  it('con cliente encontrado el DTO no marca crearCliente y envía el clienteId', () => {
    component['form'].get('cedula')?.setValue('12345672');
    component['buscarCliente']();
    const dto = component['construirDto']();
    expect(dto.crearCliente).toBe(false);
    expect(dto.clienteId).toBe(1);
  });

  it('editar la cédula después de verificar invalida la búsqueda y limpia los datos', () => {
    component['form'].get('cedula')?.setValue('12345672');
    component['buscarCliente']();
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()).not.toBeNull();

    component['form'].get('cedula')?.setValue('1234567');

    expect(component['busquedaRealizada']()).toBe(false);
    expect(component['clienteBusqueda']()).toBeNull();
    expect(component['form'].get('nombre')?.value).toBeNull();
  });

  it('en Colaboración sólo se exige el nombre del cliente', () => {
    component['form'].get('tipoReserva')?.setValue(TipoReserva.ColaboracionSinFines);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['colaboracionErrors']()['nombreColaboracion']).toBeTruthy();
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

  it('precarga el cliente cuando se entra con clienteId en la query', async () => {
    queryParamGet.mockReturnValue('2');
    const f = TestBed.createComponent(NuevaReserva);
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance['clientePrellenado']()).toBe(true);
    expect(f.componentInstance['clienteBusqueda']()?.tipoCliente).toBe(TipoCliente.Particular);
  });

  it('al precargar un cliente no se ofrece Colaboración sin fines de lucro', async () => {
    queryParamGet.mockReturnValue('2');
    const f = TestBed.createComponent(NuevaReserva);
    f.detectChanges();
    await f.whenStable();
    const opciones = f.componentInstance['tipoReservaField']().options ?? [];
    expect(opciones.some((o) => o.value === TipoReserva.ColaboracionSinFines)).toBe(false);
  });

  it('onCancelar navega a /reservas', () => {
    component['onCancelar']();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('mostrarObservaciones es true cuando el cliente encontrado tiene observaciones', () => {
    component['form'].get('cedula')?.setValue('12345672');
    component['buscarCliente']();
    expect(component['observacionesCliente']()).toBe('Cliente frecuente.');
    expect(component['mostrarObservaciones']()).toBe(true);
  });

  it('lupitaVisible es false para reservas de Colaboración', () => {
    component['form'].get('tipoReserva')?.setValue(TipoReserva.ColaboracionSinFines);
    expect(component['lupitaVisible']()).toBe(false);
  });

  it('lupitaVisible es false cuando el cliente está prellenado', async () => {
    queryParamGet.mockReturnValue('2');
    const f = TestBed.createComponent(NuevaReserva);
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance['lupitaVisible']()).toBe(false);
  });

  it('en Colaboración el DTO usa nombreColaboracion como nombre y el rut', () => {
    component['form'].get('tipoReserva')?.setValue(TipoReserva.ColaboracionSinFines);
    component['form'].get('nombreColaboracion')?.setValue('Fondo Social');
    component['form'].get('rut')?.setValue('21-123456-7');
    const dto = component['construirDto']();
    expect(dto.nombre).toBe('Fondo Social');
    expect(dto.rut).toBe('21-123456-7');
    expect(dto.cedula).toBeNull();
    expect(dto.crearCliente).toBe(false);
    expect(dto.clienteId).toBeNull();
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
    expect(component['servicios']().length).toBe(0);
  });

  it('guardar con error del backend llama al errorHandler', () => {
    const error = new Error('Server error');
    mockReservasService.crear.mockReturnValue(throwError(() => error));
    const handleSpy = vi.spyOn(component['errorHandler'], 'handle');
    component['guardar']();
    expect(handleSpy).toHaveBeenCalledWith(error);
  });

  it('verificarSocioYGuardar con error en getEstadoSocio llama al errorHandler', () => {
    const error = new Error('Network error');
    mockClientesService.getEstadoSocio.mockReturnValue(throwError(() => error));
    const handleSpy = vi.spyOn(component['errorHandler'], 'handle');
    component['verificarSocioYGuardar'](1);
    expect(handleSpy).toHaveBeenCalledWith(error);
  });

  it('buscarCliente con cédula vacía no dispara la búsqueda y marca el campo como touched', () => {
    component['form'].get('cedula')?.setValue('');
    component['buscarCliente']();
    expect(component['clienteErrors']()['cedula']).toBe('La cédula es obligatoria.');
    expect(mockClientesService.getByCedula).not.toHaveBeenCalled();
  });

  it('buscarCliente con error en buscarPorCedula llama al errorHandler', () => {
    const error = new Error('Network error');
    mockClientesService.getByCedula.mockReturnValue(throwError(() => error));
    const handleSpy = vi.spyOn(component['errorHandler'], 'handle');
    component['form'].get('cedula')?.setValue('12345672');
    component['buscarCliente']();
    expect(handleSpy).toHaveBeenCalledWith(error);
  });

  it('onConfirmar con formulario inválido no envía la solicitud', () => {
    component['onConfirmar']();
    expect(mockReservasService.crear).not.toHaveBeenCalled();
  });

  it('onConfirmar en Colaboración con form válido llama a guardar directamente', () => {
    component['form'].get('tipoReserva')?.setValue(TipoReserva.ColaboracionSinFines);
    component['form'].get('procedencia')?.setValue(Procedencia.Sede);
    component['form'].get('servicioId')?.setValue('2');
    component['form'].get('fechaInicio')?.setValue('2026-08-01');
    component['form'].get('fechaFin')?.setValue('2026-08-05');
    component['form'].get('cantidadTotal')?.setValue('4');
    component['form'].get('nombreColaboracion')?.setValue('Fondo Social');
    component['onConfirmar']();
    expect(mockReservasService.crear).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas']);
  });

  it('onConfirmar COMUN con socio encontrado delega a verificarSocioYGuardar', () => {
    component['form'].get('cedula')?.setValue('12345672');
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
    component['form'].get('cedula')?.setValue('12345678'); // verificador incorrecto: esperado 2, tiene 8
    component['buscarCliente']();
    expect(mockClientesService.getByCedula).not.toHaveBeenCalled();
    expect(component['form'].get('cedula')?.hasError('cedulaInvalida')).toBe(true);
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
});
