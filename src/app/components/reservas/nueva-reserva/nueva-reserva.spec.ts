import { ActivatedRoute, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@auth0/auth0-angular';
import { NuevaReserva } from './nueva-reserva';
import { ReservasService } from '../services/reservas.service';
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
  cedula: '12345678',
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
  cedula: '67890123',
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
    getById: ReturnType<typeof vi.fn>;
    getEstadoSocio: ReturnType<typeof vi.fn>;
  };
  let mockReservasService: { crear: ReturnType<typeof vi.fn> };

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
      getById: vi.fn((id: number) => of(id === 2 ? detalleParticular : detalleSocio)),
      getEstadoSocio: vi.fn(() => of({ id: 1, estado: EstadoSocio.Activo, numeroSocio: 5 })),
    };
    mockReservasService = { crear: vi.fn(() => of({ id: 99 })) };

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
        set: { providers: [{ provide: ReservasService, useValue: mockReservasService }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NuevaReserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el tipo de reserva por defecto es Común', () => {
    expect(component['form'].get('tipoReserva')?.value).toBe(TipoReserva.Comun);
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
    component['form'].get('cedula')?.setValue('12345678');
    component['buscarCliente']();
    expect(mockClientesService.getById).toHaveBeenCalledWith(1);
    expect(component['clienteBusqueda']()?.nombre).toBe('Juan Pérez');
    expect(component['clienteCamposReadonly']()).toBe(true);
    expect(component['esSocio']()).toBe(true);
  });

  it('buscarCliente sin coincidencia habilita la carga manual', () => {
    component['form'].get('cedula')?.setValue('00000000');
    component['buscarCliente']();
    expect(component['busquedaRealizada']()).toBe(true);
    expect(component['clienteBusqueda']()).toBeNull();
    expect(component['clienteCamposReadonly']()).toBe(false);
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
});
