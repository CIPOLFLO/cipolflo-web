import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListadoServicios } from './listado-servicios';
import { ServicioService } from '../services/servicio.service';
import { ServiciosColumnsService } from '../services/servicios-columns.service';
import {
  ConfirmDialogService,
  EstadoReserva,
  FilterConfigProvider,
  FormFieldConfig,
  PageResponse,
  TableStateService,
} from '../../../shared';
import { EstadoServicio, ReservaProximaDto, ServicioRow } from '../models/servicio.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';

interface ServicioRespuestaDtoMock {
  id: number;
  nombre: string;
  procedencia: string;
  precioSocio: number;
  precioParticular: number;
  modalidadPrecio: string;
  estado: EstadoServicio;
}

const mockPageResponse: PageResponse<ServicioRespuestaDtoMock> = {
  content: [
    {
      id: 1,
      nombre: 'Cabaña 1',
      procedencia: 'CAMPING',
      precioSocio: 800,
      precioParticular: 1200,
      modalidadPrecio: 'POR_DIA',
      estado: EstadoServicio.Habilitado,
    },
    {
      id: 2,
      nombre: 'Salón',
      procedencia: 'SEDE',
      precioSocio: 100,
      precioParticular: 180,
      modalidadPrecio: 'POR_HORA',
      estado: EstadoServicio.Deshabilitado,
    },
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

const mockReservas: ReservaProximaDto[] = [
  {
    id: 12,
    clienteId: 5,
    nombreCliente: 'María González',
    fechaEntrada: '2026-06-01T14:00:00Z',
    fechaSalida: '2026-06-03T12:00:00Z',
    pago: false,
    estado: EstadoReserva.Confirmada,
  },
  {
    id: 45,
    clienteId: 8,
    nombreCliente: 'Carlos Rodríguez',
    fechaEntrada: '2026-06-24T14:00:00Z',
    fechaSalida: '2026-06-27T12:00:00Z',
    pago: true,
    estado: EstadoReserva.Pendiente,
  },
];

const rowHabilitado: ServicioRow = {
  id: 1,
  nombre: 'Cabaña 1',
  procedencia: 'Camping',
  precioSocio: 800,
  precioParticular: 1200,
  unidad: 'p/día',
  estado: EstadoServicio.Habilitado,
};

const rowDeshabilitado: ServicioRow = {
  id: 2,
  nombre: 'Salón',
  procedencia: 'Sede',
  precioSocio: 100,
  precioParticular: 180,
  unidad: 'p/hora',
  estado: EstadoServicio.Deshabilitado,
};
const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
  logout: vi.fn(),
};

const mockUserService = {
  userInitials: () => 'JP',
  userEmail: () => 'juan@example.com',
};

describe('ListadoServicios', () => {
  let fixture: ComponentFixture<ListadoServicios>;
  let component: ListadoServicios;
  let mockServicioService: {
    getAll: ReturnType<typeof vi.fn>;
    getReservasProximas: ReturnType<typeof vi.fn>;
    actualizarHabilitacion: ReturnType<typeof vi.fn>;
    getFechasOcupadas: ReturnType<typeof vi.fn>;
  };
  let mockConfirmDialogService: { open: ReturnType<typeof vi.fn> };
  let navigateSpy: ReturnType<typeof vi.fn>;
  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockServicioService = {
      getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
      getReservasProximas: vi.fn().mockReturnValue(of([])),
      actualizarHabilitacion: vi.fn().mockReturnValue(of({})),
      getFechasOcupadas: vi.fn().mockReturnValue(of([])),
    };
    mockConfirmDialogService = { open: vi.fn().mockReturnValue(of(true)) };
    navigateSpy = vi.fn();
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ListadoServicios],
      providers: [
        { provide: ServicioService, useValue: mockServicioService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        {
          provide: Router,
          useValue: {
            navigate: navigateSpy,
            serializeUrl: vi.fn().mockReturnValue('/reservas/1'),
            createUrlTree: vi.fn().mockReturnValue({}),
          },
        },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoServicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe renderizar el texto "Servicios" en la página', () => {
    expect(fixture.nativeElement.textContent).toContain('Servicios');
  });

  it('debe tener 5 columnas definidas', () => {
    expect(component['columns'].length).toBe(5);
  });

  it('debe definir columna procedencia como texto', () => {
    const col = component['columns'].find((c) => c.key === 'procedencia');
    expect(col).toBeDefined();
    expect(col!.label).toBe('Procedencia');
  });

  it('debe definir columna nombre como texto', () => {
    const col = component['columns'].find((c) => c.key === 'nombre');
    expect(col).toBeDefined();
    expect(col!.label).toBe('Nombre');
  });

  it('debe definir columnas de precio con cellType price y unitKey unidad', () => {
    const precioSocio = component['columns'].find((c) => c.key === 'precioSocio');
    const precioParticular = component['columns'].find((c) => c.key === 'precioParticular');
    expect(precioSocio).toMatchObject({ cellType: 'price', unitKey: 'unidad' });
    expect(precioParticular).toMatchObject({ cellType: 'price', unitKey: 'unidad' });
  });

  it('debe definir columna estado con cellType tag y tagMap HABILITADO/DESHABILITADO', () => {
    const col = component['columns'].find((c) => c.key === 'estado');
    expect(col).toMatchObject({
      cellType: 'tag',
      tagMap: {
        [EstadoServicio.Habilitado]: { styleClass: 'tag--green', label: 'Habilitado' },
        [EstadoServicio.Deshabilitado]: { styleClass: 'tag--gray', label: 'Deshabilitado' },
      },
    });
  });

  it('debe llamar a ServicioService.getAll al cargar datos', () => {
    expect(mockServicioService.getAll).toHaveBeenCalled();
  });

  it('debe cargar datos con el filtro estado=HABILITADO por defecto', () => {
    const params = mockServicioService.getAll.mock.calls[0][0] as {
      filters: Record<string, string>;
    };
    expect(params.filters['estado']).toBe(EstadoServicio.Habilitado);
  });

  it('onFilterChange debe actualizar los filtros en tableState', () => {
    const tableState = component['tableState'];
    component['onFilterChange']({ nombre: 'Cabaña', estado: EstadoServicio.Habilitado });
    expect(tableState.queryParams().filters).toEqual({
      nombre: 'Cabaña',
      estado: EstadoServicio.Habilitado,
    });
  });

  it('debe actualizar filtros cuando app-filter-panel emite filterChange', () => {
    const filterPanel = fixture.debugElement.query(By.css('app-filter-panel'));
    filterPanel.triggerEventHandler('filterChange', { procedencia: 'CAMPING' });
    expect(component['tableState'].queryParams().filters).toEqual({ procedencia: 'CAMPING' });
  });

  it('onNuevoServicio navega a /servicios/nuevo', () => {
    component['onNuevoServicio']();
    expect(navigateSpy).toHaveBeenCalledWith(['/servicios/nuevo']);
  });

  it('usa el valor original para modalidadPrecio y procedencia desconocidos', () => {
    const unknownDto = {
      id: 99,
      nombre: 'Servicio Desconocido',
      procedencia: 'DESCONOCIDA',
      precioSocio: 0,
      precioParticular: 0,
      modalidadPrecio: 'DESCONOCIDA',
      estado: EstadoServicio.Habilitado,
    };
    mockServicioService.getAll.mockReturnValue(of({ ...mockPageResponse, content: [unknownDto] }));

    let result!: PageResponse<ServicioRow>;
    component['loadDataFn']({ page: 0, size: 10, filters: {} }).subscribe((r) => (result = r));

    expect(result.content[0].unidad).toBe('DESCONOCIDA');
    expect(result.content[0].procedencia).toBe('DESCONOCIDA');
  });

  describe('rowActions', () => {
    it('debe retornar 4 acciones para un servicio habilitado', () => {
      expect(component['rowActions'](rowHabilitado)).toHaveLength(4);
    });

    it('debe retornar 4 acciones para un servicio deshabilitado', () => {
      expect(component['rowActions'](rowDeshabilitado)).toHaveLength(4);
    });

    it('la primera acción es "Ver ocupación" con icono pi-calendar', () => {
      const actions = component['rowActions'](rowHabilitado);
      expect(actions[0].label).toBe('Ver ocupación');
      expect(actions[0].icon).toBe('pi pi-calendar');
    });

    it('"Ver ocupación" desencadena verOcupacion', () => {
      const spy = vi.spyOn(
        component as ListadoServicios & { verOcupacion(r: ServicioRow): void },
        'verOcupacion',
      );
      component['rowActions'](rowHabilitado)[0].command?.(rowHabilitado);
      expect(spy).toHaveBeenCalledWith(rowHabilitado);
    });

    it('la segunda acción es "Ver detalle" con icono pi-eye', () => {
      const actions = component['rowActions'](rowHabilitado);
      expect(actions[1].label).toBe('Ver detalle');
      expect(actions[1].icon).toBe('pi pi-eye');
    });

    it('"Ver detalle" navega a /servicios/{id}', () => {
      component['rowActions'](rowHabilitado)[1].command?.(rowHabilitado);
      expect(navigateSpy).toHaveBeenCalledWith(['/servicios', 1]);
    });

    it('la tercera acción es "Editar" con icono pi-pencil', () => {
      const actions = component['rowActions'](rowHabilitado);
      expect(actions[2].label).toBe('Editar');
      expect(actions[2].icon).toBe('pi pi-pencil');
    });

    it('"Editar" navega a /servicios/{id}/editar con from=listado', () => {
      component['rowActions'](rowHabilitado)[2].command?.(rowHabilitado);
      expect(navigateSpy).toHaveBeenCalledWith(['/servicios', 1, 'editar'], {
        queryParams: { from: 'listado' },
      });
    });

    it('la cuarta acción es "Deshabilitar" cuando el servicio está habilitado', () => {
      const actions = component['rowActions'](rowHabilitado);
      expect(actions[3].label).toBe('Deshabilitar');
      expect(actions[3].icon).toBe('pi pi-ban');
    });

    it('el comando "Deshabilitar" en rowActions desencadena iniciarDeshabilitacion (línea 110)', () => {
      const spy = vi.spyOn(
        component as ListadoServicios & { iniciarDeshabilitacion(r: ServicioRow): void },
        'iniciarDeshabilitacion',
      );
      component['rowActions'](rowHabilitado)[3].command?.(rowHabilitado);
      expect(spy).toHaveBeenCalledWith(rowHabilitado);
    });

    it('la cuarta acción es "Habilitar" cuando el servicio está deshabilitado', () => {
      const actions = component['rowActions'](rowDeshabilitado);
      expect(actions[3].label).toBe('Habilitar');
      expect(actions[3].icon).toBe('pi pi-check-circle');
    });

    it('debe renderizar los encabezados de columna en la tabla', async () => {
      const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
      const labels = Array.from(headers).map((h) => h.textContent?.trim());
      expect(labels).toContain('Procedencia');
      expect(labels).toContain('Nombre');
      expect(labels).toContain('Precio Socio');
      expect(labels).toContain('Precio Particular');
      expect(labels).toContain('Estado');
    });
  });

  describe('habilitar', () => {
    it('llama a actualizarHabilitacion con habilitado=true', () => {
      component['rowActions'](rowDeshabilitado)[3].command?.(rowDeshabilitado);
      expect(mockServicioService.actualizarHabilitacion).toHaveBeenCalledWith(2, {
        habilitado: true,
      });
    });

    it('llama a updateFilters para recargar la tabla tras habilitar', () => {
      const spy = vi.spyOn(component['tableState'], 'updateFilters');
      component['rowActions'](rowDeshabilitado)[3].command?.(rowDeshabilitado);
      expect(spy).toHaveBeenCalled();
    });

    it('llama a errorHandler.handle cuando actualizarHabilitacion falla al habilitar', () => {
      const error = new Error('Error de red');

      mockServicioService.actualizarHabilitacion.mockReturnValue(throwError(() => error));

      component['rowActions'](rowDeshabilitado)[3].command?.(rowDeshabilitado);

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    });
  });

  describe('verOcupacion', () => {
    const fechasOcupadas = [
      { fechaInicio: '2026-08-10', fechaFin: '2026-08-12', reservaId: 21, estado: undefined },
    ];

    it('llama a getFechasOcupadas con el id del servicio y una ventana de un año', () => {
      component['verOcupacion'](rowHabilitado);
      expect(mockServicioService.getFechasOcupadas).toHaveBeenCalledWith(
        1,
        expect.any(String),
        expect.any(String),
      );
    });

    it('abre el diálogo y carga las fechas ocupadas tras la respuesta', () => {
      mockServicioService.getFechasOcupadas.mockReturnValue(of(fechasOcupadas));
      component['verOcupacion'](rowHabilitado);
      expect(component['ocupacionVisible']()).toBe(true);
      expect(component['servicioParaOcupacion']()).toEqual(rowHabilitado);
      expect(component['fechasOcupadasServicio']()).toEqual(fechasOcupadas);
    });

    it('llama a errorHandler.handle y no abre el diálogo si falla la consulta', () => {
      const error = new Error('Error de red');
      mockServicioService.getFechasOcupadas.mockReturnValue(throwError(() => error));
      component['verOcupacion'](rowHabilitado);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(component['ocupacionVisible']()).toBe(false);
    });
  });

  describe('onCerrarOcupacion', () => {
    it('oculta el diálogo y limpia el servicio y las fechas ocupadas', () => {
      mockServicioService.getFechasOcupadas.mockReturnValue(
        of([{ fechaInicio: '2026-08-10', fechaFin: '2026-08-12', reservaId: 21 }]),
      );
      component['verOcupacion'](rowHabilitado);

      component['onCerrarOcupacion']();

      expect(component['ocupacionVisible']()).toBe(false);
      expect(component['servicioParaOcupacion']()).toBeNull();
      expect(component['fechasOcupadasServicio']()).toEqual([]);
    });
  });

  describe('iniciarDeshabilitacion', () => {
    it('muestra el diálogo de verificación al iniciar', () => {
      const pending$ = new Subject<ReservaProximaDto[]>();
      mockServicioService.getReservasProximas.mockReturnValue(pending$.asObservable());
      component['iniciarDeshabilitacion'](rowHabilitado);
      expect(component['verificandoVisible']()).toBe(true);
      pending$.complete();
    });

    it('llama a getReservasProximas con el id del servicio', () => {
      mockServicioService.getReservasProximas.mockReturnValue(of([]));
      component['iniciarDeshabilitacion'](rowHabilitado);
      expect(mockServicioService.getReservasProximas).toHaveBeenCalledWith(1);
    });

    it('oculta el diálogo de verificación tras recibir respuesta', () => {
      mockServicioService.getReservasProximas.mockReturnValue(of([]));
      component['iniciarDeshabilitacion'](rowHabilitado);
      expect(component['verificandoVisible']()).toBe(false);
    });

    describe('sin reservas activas', () => {
      beforeEach(() => {
        mockServicioService.getReservasProximas.mockReturnValue(of([]));
      });

      it('abre el diálogo de confirmación', () => {
        component['iniciarDeshabilitacion'](rowHabilitado);
        expect(mockConfirmDialogService.open).toHaveBeenCalledWith(
          expect.objectContaining({ variant: 'warning' }),
        );
      });

      it('al confirmar llama a actualizarHabilitacion con habilitado=false y reservasACancelar vacío', () => {
        mockConfirmDialogService.open.mockReturnValue(of(true));
        component['iniciarDeshabilitacion'](rowHabilitado);
        expect(mockServicioService.actualizarHabilitacion).toHaveBeenCalledWith(1, {
          habilitado: false,
          reservasACancelar: [],
        });
      });

      it('al cancelar no llama a actualizarHabilitacion', () => {
        mockConfirmDialogService.open.mockReturnValue(of(false));
        component['iniciarDeshabilitacion'](rowHabilitado);
        expect(mockServicioService.actualizarHabilitacion).not.toHaveBeenCalled();
      });
    });

    describe('con reservas activas', () => {
      beforeEach(() => {
        mockServicioService.getReservasProximas.mockReturnValue(of(mockReservas));
      });

      it('no abre el diálogo de confirmación', () => {
        component['iniciarDeshabilitacion'](rowHabilitado);
        expect(mockConfirmDialogService.open).not.toHaveBeenCalled();
      });

      it('muestra el diálogo de reservas activas', () => {
        component['iniciarDeshabilitacion'](rowHabilitado);
        expect(component['reservasActivasVisible']()).toBe(true);
      });

      it('carga las reservas en el signal', () => {
        component['iniciarDeshabilitacion'](rowHabilitado);
        expect(component['reservasProximas']()).toEqual(mockReservas);
      });
    });

    describe('error en getReservasProximas', () => {
      it('oculta el diálogo de verificación y limpia el servicio seleccionado', () => {
        mockServicioService.getReservasProximas.mockReturnValue(
          throwError(() => new Error('Error de red')),
        );
        component['iniciarDeshabilitacion'](rowHabilitado);
        expect(component['verificandoVisible']()).toBe(false);
        expect(component['servicioSeleccionado']()).toBeNull();
      });
    });
  });

  describe('onDeshabilitarSinCancelar', () => {
    beforeEach(() => {
      mockServicioService.getReservasProximas.mockReturnValue(of(mockReservas));
      component['iniciarDeshabilitacion'](rowHabilitado);
    });

    it('oculta el diálogo de reservas activas', () => {
      component['onDeshabilitarSinCancelar']();
      expect(component['reservasActivasVisible']()).toBe(false);
    });

    it('llama a actualizarHabilitacion con reservasACancelar vacío', () => {
      component['onDeshabilitarSinCancelar']();
      expect(mockServicioService.actualizarHabilitacion).toHaveBeenCalledWith(1, {
        habilitado: false,
        reservasACancelar: [],
      });
    });
  });

  describe('onDeshabilitarYCancelar', () => {
    beforeEach(() => {
      mockServicioService.getReservasProximas.mockReturnValue(of(mockReservas));
      component['iniciarDeshabilitacion'](rowHabilitado);
    });

    it('oculta el diálogo de reservas activas', () => {
      component['onDeshabilitarYCancelar']([12]);
      expect(component['reservasActivasVisible']()).toBe(false);
    });

    it('llama a actualizarHabilitacion con los ids seleccionados', () => {
      component['onDeshabilitarYCancelar']([12, 45]);
      expect(mockServicioService.actualizarHabilitacion).toHaveBeenCalledWith(1, {
        habilitado: false,
        reservasACancelar: [12, 45],
      });
    });
  });

  describe('onCancelarDialog', () => {
    beforeEach(() => {
      mockServicioService.getReservasProximas.mockReturnValue(of(mockReservas));
      component['iniciarDeshabilitacion'](rowHabilitado);
    });

    it('oculta el diálogo de reservas activas', () => {
      component['onCancelarDialog']();
      expect(component['reservasActivasVisible']()).toBe(false);
    });

    it('limpia el servicio seleccionado', () => {
      component['onCancelarDialog']();
      expect(component['servicioSeleccionado']()).toBeNull();
    });

    it('limpia las reservas próximas', () => {
      component['onCancelarDialog']();
      expect(component['reservasProximas']()).toEqual([]);
    });

    it('no llama a actualizarHabilitacion', () => {
      component['onCancelarDialog']();
      expect(mockServicioService.actualizarHabilitacion).not.toHaveBeenCalled();
    });
  });

  describe('deshabilitar — error path', () => {
    it('llama a errorHandler.handle y limpia el estado cuando actualizarHabilitacion falla al deshabilitar', () => {
      const error = new Error('Error de red');

      component['servicioSeleccionado'].set(rowHabilitado);
      component['reservasProximas'].set(mockReservas);
      mockServicioService.actualizarHabilitacion.mockReturnValue(throwError(() => error));

      component['deshabilitar']({ habilitado: false, reservasACancelar: [] });

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(component['servicioSeleccionado']()).toBeNull();
      expect(component['reservasProximas']()).toEqual([]);
    });
  });
});

describe('ListadoServicios sin filtros por defecto', () => {
  it('constructor no aplica filtros cuando ningún campo tiene defaultValue', async () => {
    class SinDefaultsFilterService extends FilterConfigProvider {
      readonly filterFields = signal<FormFieldConfig[]>([
        { key: 'nombre', label: 'Nombre', type: 'text' },
      ]);
    }

    await TestBed.configureTestingModule({
      imports: [ListadoServicios],
      providers: [
        {
          provide: ServicioService,
          useValue: {
            getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
            getReservasProximas: vi.fn().mockReturnValue(of([])),
            actualizarHabilitacion: vi.fn().mockReturnValue(of({})),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
            serializeUrl: vi.fn().mockReturnValue('/reservas/1'),
            createUrlTree: vi.fn().mockReturnValue({}),
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideComponent(ListadoServicios, {
        set: {
          providers: [
            TableStateService,
            ServiciosColumnsService,
            { provide: FilterConfigProvider, useClass: SinDefaultsFilterService },
          ],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(ListadoServicios);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance['tableState'].queryParams().filters).toEqual({});
  });
});
