import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConfirmDialogService,
  FilterConfigProvider,
  FormFieldConfig,
  PageResponse,
  TableStateService,
  TableExportService,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import {
  ClienteRespuestaDto,
  EstadoSocio,
  TipoCliente,
  CategoriaSocio,
} from '../models/cliente.model';
import { mapClienteCardMobileRow } from '../mappers/cliente-listado.mapper';
import { ClientesService } from '../services/cliente.service';
import { ClientesColumnsService } from '../services/cliente-columns.service';
import { ListadoClientes } from './listado-clientes';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { MobileListLoader } from '../../../shared/mobile/list/mobile-list-loader';
import { AuthService } from '@auth0/auth0-angular';
import { ImportacionSociosResponseDto } from '../models/importacion-socios.model';

const mockPageResponse: PageResponse<ClienteRespuestaDto> = {
  content: [
    {
      id: 1,
      nombreCompleto: 'Juan Pérez',
      tipoCliente: TipoCliente.Socio,
      numeroSocio: 5,
      cedula: '1.234.567-8',
      rut: null,
      email: 'juan@mail.com',
      estado: EstadoSocio.Activo,
      categoriaSocio: CategoriaSocio.SocioComun,
      fechaIngreso: '2020-01-01',
      ultimaCuotaDto: {
        anio: 2026,
        mes: 6,
        nombreMes: 'junio',
        descripcion: 'Junio 2026',
      },
    },
    {
      id: 2,
      nombreCompleto: 'Laura Fernández',
      tipoCliente: TipoCliente.Particular,
      numeroSocio: null,
      cedula: '6.789.012-3',
      rut: null,
      email: null,
      estado: null,
      categoriaSocio: null,
      fechaIngreso: null,
      ultimaCuotaDto: null,
    },
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

const empresaMock: ClienteRespuestaDto = {
  id: 3,
  nombreCompleto: 'Cipolatti S.A.',
  tipoCliente: TipoCliente.Empresa,
  numeroSocio: null,
  cedula: null,
  rut: '210001230018',
  email: 'empresa@mail.com',
  estado: null,
  categoriaSocio: null,
  fechaIngreso: null,
  ultimaCuotaDto: null,
};

const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
};

describe('ListadoClientes', () => {
  let fixture: ComponentFixture<ListadoClientes>;
  let component: ListadoClientes;
  let mockClientesService: {
    getAll: ReturnType<typeof vi.fn>;
    darDeBaja: ReturnType<typeof vi.fn>;
    exportar: ReturnType<typeof vi.fn>;
    importarSocios: ReturnType<typeof vi.fn>;
    descargarPlantillaImportacionSocios: ReturnType<typeof vi.fn>;
  };
  let mockConfirmDialogService: { open: ReturnType<typeof vi.fn> };
  let mockErrorHandler: { handle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockErrorHandler = { handle: vi.fn() };
    mockClientesService = {
      getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
      darDeBaja: vi.fn().mockReturnValue(of(void 0)),
      exportar: vi.fn().mockReturnValue(of(undefined)),
      importarSocios: vi.fn(),
      descargarPlantillaImportacionSocios: vi.fn().mockReturnValue(of(undefined)),
    };
    mockConfirmDialogService = {
      open: vi.fn().mockReturnValue(of(false)),
    };

    await TestBed.configureTestingModule({
      imports: [ListadoClientes],
      providers: [
        { provide: ClientesService, useValue: mockClientesService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: false }) } },
        { provide: AuthService, useValue: mockAuthService },
        BreakpointService,
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoClientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe renderizar el texto "Clientes" en la página', () => {
    expect(fixture.nativeElement.textContent).toContain('Clientes');
  });

  it('debe tener 6 columnas definidas', () => {
    expect(component['columns'].length).toBe(6);
  });

  it('debe definir columna nombreCompleto como sortable', () => {
    const col = component['columns'].find((c) => c.key === 'nombreCompleto');
    expect(col).toBeDefined();
    expect(col!.sortable).toBe(true);
  });

  it('debe definir columna estado con cellType tag y tagMap ACTIVO/INACTIVO/DE_BAJA', () => {
    const col = component['columns'].find((c) => c.key === 'estado');
    expect(col).toMatchObject({
      cellType: 'tag',
      tagMap: {
        [EstadoSocio.Activo]: { styleClass: 'tag--green', label: 'Activo' },
        [EstadoSocio.Inactivo]: { styleClass: 'tag--yellow', label: 'Inactivo' },
        [EstadoSocio.Baja]: { styleClass: 'tag--gray', label: 'De baja' },
      },
    });
  });

  it('debe llamar a ClientesService.getAll al cargar datos', () => {
    expect(mockClientesService.getAll).toHaveBeenCalled();
  });

  it('onFilterChange debe actualizar los filtros en tableState', () => {
    const tableState = component['tableState'];
    component['onFilterChange']({ nombre: 'Juan' });
    expect(tableState.queryParams().filters).toEqual({ nombre: 'Juan' });
  });

  it('debe actualizar filtros cuando app-filter-panel emite filterChange', () => {
    const filterPanel = fixture.debugElement.query(By.css('app-filter-panel'));
    filterPanel.triggerEventHandler('filterChange', { estado: 'ACTIVO' });
    expect(component['tableState'].queryParams().filters).toEqual({ estado: 'ACTIVO' });
  });

  it('rowActions debe ser una función', () => {
    expect(typeof component['rowActions']).toBe('function');
  });

  it('rowActions debe retornar la acción "Ver detalle"', () => {
    const row: ClienteRespuestaDto = mockPageResponse.content[0];
    const actions = component['rowActions'](row);
    const verDetalle = actions.find((a) => a.label === 'Ver detalle');
    expect(verDetalle).toBeDefined();
    expect(verDetalle!.icon).toBe('pi pi-eye');
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions[0].label).toBe('Ver detalle');
    expect(actions[0].icon).toBe('pi pi-eye');
  });

  it('rowActions no incluye "Ver detalle" para un cliente de tipo Empresa', () => {
    const actions = component['rowActions'](empresaMock);
    expect(actions.some((a) => a.label === 'Ver detalle')).toBe(false);
  });

  it('rowActions no incluye "Modificar" para un cliente de tipo Empresa', () => {
    const actions = component['rowActions'](empresaMock);
    expect(actions.some((a) => a.label === 'Modificar')).toBe(false);
  });

  it('rowActions incluye "Pago de cuota" cuando el cliente es socio activo', () => {
    const socio = mockPageResponse.content.find(
      (cliente) => cliente.tipoCliente === TipoCliente.Socio,
    )!;
    const actions = component['rowActions'](socio);
    expect(actions.some((action) => action.label === 'Pago de cuota')).toBe(true);
  });

  it('rowActions no incluye "Pago de cuota" cuando el cliente es particular', () => {
    const particular = mockPageResponse.content.find(
      (cliente) => cliente.tipoCliente === TipoCliente.Particular,
    )!;
    const actions = component['rowActions'](particular);
    expect(actions.some((action) => action.label === 'Pago de cuota')).toBe(false);
  });

  it('rowActions incluye "Nueva Reserva" para un cliente que no está dado de baja', () => {
    const particular = mockPageResponse.content[1];
    const actions = component['rowActions'](particular);
    expect(actions.some((action) => action.label === 'Nueva Reserva')).toBe(true);
  });

  it('rowActions no incluye "Nueva Reserva" para un cliente dado de baja', () => {
    const socioDeBaja: ClienteRespuestaDto = {
      ...mockPageResponse.content[0],
      estado: EstadoSocio.Baja,
    };
    const actions = component['rowActions'](socioDeBaja);
    expect(actions.some((action) => action.label === 'Nueva Reserva')).toBe(false);
  });

  it('el comando de "Ver detalle" navega correctamente', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');
    const cliente: ClienteRespuestaDto = mockPageResponse.content[0];
    const actions = component['rowActions'](cliente);
    const verDetalle = actions.find((a) => a.label === 'Ver detalle');
    expect(verDetalle).toBeDefined();
    verDetalle!.command?.(cliente);
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', 1]);
  });

  it('el comando "Nueva Reserva" navega a /reservas/nueva con el clienteId', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');
    const cliente = mockPageResponse.content[0];
    const nuevaReserva = component['rowActions'](cliente).find((a) => a.label === 'Nueva Reserva')!;
    nuevaReserva.command?.(cliente);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas/nueva'], {
      queryParams: { clienteId: cliente.id },
    });
  });

  it('el comando "Modificar" en rowActions navega con queryParam from=listado', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');
    const cliente = mockPageResponse.content[0];
    const actions = component['rowActions'](cliente);
    const modificar = actions.find((a) => a.label === 'Modificar');
    expect(modificar).toBeDefined();
    modificar!.command?.(cliente);
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', cliente.id, 'modificar'], {
      queryParams: { from: 'listado' },
    });
  });

  it('onNuevoCliente navega a /clientes/nuevo', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');
    component['onNuevoCliente']();
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes/nuevo']);
  });

  it('onNuevaEmpresa navega a /clientes/nueva-empresa', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');
    component['onNuevaEmpresa']();
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes/nueva-empresa']);
  });

  it('debe renderizar los encabezados de columna en la tabla', async () => {
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const labels = Array.from(headers).map((h) => h.textContent?.trim());
    expect(labels).toContain('Nombre');
    expect(labels).toContain('Nro de socio');
    expect(labels).toContain('Documento');
    expect(labels).toContain('Email');
    expect(labels).toContain('Estado');
  });

  it('onPagoCuota selecciona el cliente para pagar cuota', () => {
    const row = mockPageResponse.content[0];
    component['onPagoCuota'](row);
    expect(component['clientePagoSeleccionado']()).toEqual(row);
  });

  it('rowActions incluye "Dar de baja" para socio con estado distinto de Baja', () => {
    const socio = mockPageResponse.content[0];
    const actions = component['rowActions'](socio);
    expect(actions.some((a) => a.label === 'Dar de baja')).toBe(true);
  });

  it('rowActions no incluye "Dar de baja" para cliente particular', () => {
    const particular = mockPageResponse.content[1];
    const actions = component['rowActions'](particular);
    expect(actions.some((a) => a.label === 'Dar de baja')).toBe(false);
  });

  it('rowActions no incluye "Dar de baja" para socio con estado Baja', () => {
    const socioDeBaja: ClienteRespuestaDto = {
      ...mockPageResponse.content[0],
      estado: EstadoSocio.Baja,
    };
    const actions = component['rowActions'](socioDeBaja);
    expect(actions.some((a) => a.label === 'Dar de baja')).toBe(false);
  });

  it('onDarDeBajaCliente abre el diálogo de confirmación', () => {
    const row = mockPageResponse.content[0];
    component['onDarDeBajaCliente'](row);
    expect(mockConfirmDialogService.open).toHaveBeenCalledWith({
      title: 'Dar de baja cliente',
      message:
        '¿Confirma que quiere dar de baja este cliente? Si tiene reservas futuras, se cancelarán, incluso las que ya están pagas.',
      confirmButtonLabel: 'Dar de baja',
      cancelButtonLabel: 'Cancelar',
      variant: 'danger',
    });
  });

  it('onDarDeBajaCliente llama a darDeBaja si se confirma la operación', () => {
    const row = mockPageResponse.content[0];
    mockConfirmDialogService.open.mockReturnValue(of(true));
    component['onDarDeBajaCliente'](row);
    expect(mockClientesService.darDeBaja).toHaveBeenCalledWith(row.id);
  });

  it('onDarDeBajaCliente no llama a darDeBaja si se cancela la operación', () => {
    const row = mockPageResponse.content[0];
    mockConfirmDialogService.open.mockReturnValue(of(false));
    component['onDarDeBajaCliente'](row);
    expect(mockClientesService.darDeBaja).not.toHaveBeenCalled();
  });

  it('onDarDeBajaCliente recarga la tabla tras confirmar la baja', () => {
    const row = mockPageResponse.content[0];
    mockConfirmDialogService.open.mockReturnValue(of(true));
    const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');
    component['onDarDeBajaCliente'](row);
    expect(updateFiltersSpy).toHaveBeenCalled();
  });

  it('el comando de "Pago de cuota" en rowActions llama a onPagoCuota', () => {
    const socio = mockPageResponse.content[0];
    const actions = component['rowActions'](socio);
    const pagoCuota = actions.find((a) => a.label === 'Pago de cuota')!;
    pagoCuota.command?.(socio);
    expect(component['clientePagoSeleccionado']()).toEqual(socio);
  });

  it('el comando de "Dar de baja" en rowActions abre el diálogo', () => {
    const socio = mockPageResponse.content[0];
    const actions = component['rowActions'](socio);
    const darDeBaja = actions.find((a) => a.label === 'Dar de baja')!;
    darDeBaja.command?.(socio);
    expect(mockConfirmDialogService.open).toHaveBeenCalled();
  });

  it('onCerrarPagoCuota limpia el cliente seleccionado y recarga la tabla', () => {
    component['clientePagoSeleccionado'].set(mockPageResponse.content[0]);
    const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');
    component['onCerrarPagoCuota']();
    expect(component['clientePagoSeleccionado']()).toBeNull();
    expect(updateFiltersSpy).toHaveBeenCalled();
  });

  it('onApplyFilters actualiza los filtros en tableState', () => {
    component['onApplyFilters']({ estado: 'ACTIVO' });
    expect(component['tableState'].queryParams().filters).toEqual({ estado: 'ACTIVO' });
  });

  it('onClearFilters limpia los filtros en tableState', () => {
    component['tableState'].updateFilters({ nombre: 'test' });
    component['onClearFilters']();
    expect(component['tableState'].queryParams().filters).toEqual({});
  });

  it('onExportar llama a clientesService.exportar con los filtros activos', () => {
    component['tableState'].setResult(2);
    component['tableState'].setLoading(false);
    fixture.detectChanges();
    component['tableState'].updateFilters({ estado: 'ACTIVO' });
    component['onExportar']();
    expect(mockClientesService.exportar).toHaveBeenCalledWith({ estado: 'ACTIVO' });
  });

  it('onExportar no hace nada si puedeExportar es false', () => {
    component['tableState'].setResult(0);
    component['onExportar']();
    expect(mockClientesService.exportar).not.toHaveBeenCalled();
  });

  it('onExportar resetea exportando a false cuando el servicio falla', () => {
    component['tableState'].setResult(2);
    mockClientesService.exportar.mockReturnValue(throwError(() => new Error('fallo')));
    component['onExportar']();
    expect(component['tableExport'].exportando()).toBe(false);
  });

  it('onDarDeBajaCliente llama a errorHandler.handle cuando darDeBaja falla', () => {
    const error = new Error('Error de red');
    const row = mockPageResponse.content[0];
    mockConfirmDialogService.open.mockReturnValue(of(true));
    mockClientesService.darDeBaja.mockReturnValue(throwError(() => error));
    component['onDarDeBajaCliente'](row);
    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
  });

  describe('importación de socios', () => {
    const respuestaSinErrores: ImportacionSociosResponseDto = {
      totalFilas: 3,
      filasImportadas: 3,
      filasConError: 0,
      detalleErrores: [],
    };

    const respuestaConErrores: ImportacionSociosResponseDto = {
      totalFilas: 3,
      filasImportadas: 2,
      filasConError: 1,
      detalleErrores: [
        { numeroFila: 2, codigoError: 'CEDULA_INVALIDA', motivo: 'Cédula inválida' },
      ],
    };

    it('onImportarExcelClick muestra el diálogo de importación', () => {
      component['onImportarExcelClick']();
      expect(component['importarDialogVisible']()).toBe(true);
    });

    it('onDescargarPlantillaImportacion llama al servicio de descarga', () => {
      component['onDescargarPlantillaImportacion']();
      expect(mockClientesService.descargarPlantillaImportacionSocios).toHaveBeenCalled();
    });

    it('onDescargarPlantillaImportacion llama a errorHandler.handle si falla la descarga', () => {
      const error = new Error('Error de red');
      mockClientesService.descargarPlantillaImportacionSocios.mockReturnValue(
        throwError(() => error),
      );
      component['onDescargarPlantillaImportacion']();
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    });

    it('onCancelarImportar oculta el diálogo de importación', () => {
      component['importarDialogVisible'].set(true);
      component['onCancelarImportar']();
      expect(component['importarDialogVisible']()).toBe(false);
    });

    it('onConfirmarImportar marca importando en true mientras se procesa el archivo', () => {
      mockClientesService.importarSocios.mockReturnValue(of(respuestaSinErrores));
      const file = new File(['contenido'], 'socios.xlsx');
      component['onConfirmarImportar'](file);
      expect(mockClientesService.importarSocios).toHaveBeenCalledWith(file);
    });

    it('onConfirmarImportar cierra el diálogo y muestra confirmación de éxito sin errores', () => {
      mockClientesService.importarSocios.mockReturnValue(of(respuestaSinErrores));
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      component['onConfirmarImportar'](new File(['contenido'], 'socios.xlsx'));

      expect(component['importando']()).toBe(false);
      expect(component['importarDialogVisible']()).toBe(false);
      expect(component['erroresImportacion']()).toBeNull();
      expect(mockConfirmDialogService.open).toHaveBeenCalledWith({
        title: 'Importación exitosa',
        message: 'Se importaron 3 de 3 socios correctamente.',
        confirmButtonLabel: 'Aceptar',
        showCancelButton: false,
        variant: 'success',
      });
      expect(updateFiltersSpy).toHaveBeenCalled();
    });

    it('onConfirmarImportar guarda los errores y no recarga la tabla si hay filas con error', () => {
      mockClientesService.importarSocios.mockReturnValue(of(respuestaConErrores));
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      component['onConfirmarImportar'](new File(['contenido'], 'socios.xlsx'));

      expect(component['importando']()).toBe(false);
      expect(component['importarDialogVisible']()).toBe(false);
      expect(component['erroresImportacion']()).toEqual(respuestaConErrores);
      expect(mockConfirmDialogService.open).not.toHaveBeenCalled();
      expect(updateFiltersSpy).not.toHaveBeenCalled();
    });

    it('onConfirmarImportar llama a errorHandler.handle cuando la importación falla', () => {
      const error = new Error('Error de red');
      mockClientesService.importarSocios.mockReturnValue(throwError(() => error));

      component['onConfirmarImportar'](new File(['contenido'], 'socios.xlsx'));

      expect(component['importando']()).toBe(false);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    });

    it('onAceptarErroresImportacion limpia los errores y recarga la tabla', () => {
      component['erroresImportacion'].set(respuestaConErrores);
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      component['onAceptarErroresImportacion']();

      expect(component['erroresImportacion']()).toBeNull();
      expect(updateFiltersSpy).toHaveBeenCalled();
    });

    it('onReintentarImportar limpia los errores, recarga la tabla y reabre el diálogo', () => {
      component['erroresImportacion'].set(respuestaConErrores);
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      component['onReintentarImportar']();

      expect(component['erroresImportacion']()).toBeNull();
      expect(updateFiltersSpy).toHaveBeenCalled();
      expect(component['importarDialogVisible']()).toBe(true);
    });
  });
});

describe('ListadoClientes con filtros por defecto', () => {
  it('constructor aplica defaultValues al tableState', async () => {
    class ConDefaultsFilterService extends FilterConfigProvider {
      readonly filterFields = signal<FormFieldConfig[]>([
        { key: 'estado', label: 'Estado', type: 'select', defaultValue: 'ACTIVO' },
      ]);
    }

    await TestBed.configureTestingModule({
      imports: [ListadoClientes],
      providers: [
        {
          provide: ClientesService,
          useValue: { getAll: vi.fn().mockReturnValue(of(mockPageResponse)) },
        },
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: false }) } },
        { provide: AuthService, useValue: mockAuthService },
        BreakpointService,
      ],
    })
      .overrideComponent(ListadoClientes, {
        set: {
          providers: [
            TableStateService,
            TableExportService,
            ClientesColumnsService,
            MobileListLoader,
            { provide: FilterConfigProvider, useClass: ConDefaultsFilterService },
          ],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(ListadoClientes);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance['tableState'].queryParams().filters).toEqual({
      estado: 'ACTIVO',
    });
  });
});

describe('ListadoClientes sin filtros por defecto', () => {
  it('constructor no aplica filtros cuando ningún campo tiene defaultValue', async () => {
    class SinDefaultsFilterService extends FilterConfigProvider {
      readonly filterFields = signal<FormFieldConfig[]>([
        { key: 'nombre', label: 'Nombre', type: 'text' },
      ]);
    }

    await TestBed.configureTestingModule({
      imports: [ListadoClientes],
      providers: [
        {
          provide: ClientesService,
          useValue: {
            getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
          },
        },
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: false }) } },
        { provide: AuthService, useValue: mockAuthService },
        BreakpointService,
      ],
    })
      .overrideComponent(ListadoClientes, {
        set: {
          providers: [
            TableStateService,
            TableExportService,
            ClientesColumnsService,
            MobileListLoader,
            {
              provide: ClientesService,
              useValue: {
                getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
              },
            },
            { provide: FilterConfigProvider, useClass: SinDefaultsFilterService },
          ],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(ListadoClientes);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance['tableState'].queryParams().filters).toEqual({});
  });
});

describe('ListadoClientes en vista móvil', () => {
  let fixture: ComponentFixture<ListadoClientes>;
  let component: ListadoClientes;

  let mockClientesService: {
    getAll: ReturnType<typeof vi.fn>;
    darDeBaja: ReturnType<typeof vi.fn>;
    exportar: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockClientesService = {
      getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
      darDeBaja: vi.fn().mockReturnValue(of(void 0)),
      exportar: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [ListadoClientes],
      providers: [
        {
          provide: ClientesService,
          useValue: mockClientesService,
        },
        {
          provide: ConfirmDialogService,
          useValue: {
            open: vi.fn().mockReturnValue(of(false)),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: true }),
          },
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        BreakpointService,
        {
          provide: ErrorHandlerService,
          useValue: {
            handle: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoClientes);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe renderizar el panel de filtros móvil', () => {
    const filterPanel = fixture.debugElement.query(By.css('app-mob-filter-panel'));

    expect(filterPanel).not.toBeNull();
  });

  it('no debe renderizar el panel de filtros de escritorio', () => {
    const filterPanel = fixture.debugElement.query(By.css('app-filter-panel'));

    expect(filterPanel).toBeNull();
  });

  it('no debe renderizar la tabla de escritorio', () => {
    const table = fixture.debugElement.query(By.css('app-table'));

    expect(table).toBeNull();
  });

  it('debe renderizar una card por cada cliente recibido', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-mob-cliente-card'));

    expect(cards.length).toBe(mockPageResponse.content.length);
  });

  it('debe mostrar el número de socio del socio', () => {
    expect(fixture.nativeElement.textContent).toContain('N° socio');
    expect(fixture.nativeElement.textContent).toContain('5');
  });

  it('debe mostrar el nombre de los clientes', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Juan Pérez');
    expect(content).toContain('Laura Fernández');
  });

  it('debe mostrar el documento del cliente', () => {
    expect(fixture.nativeElement.textContent).toContain('1.234.567-8');
  });

  it('debe mostrar el estado del socio', () => {
    expect(fixture.nativeElement.textContent).toContain('Activo');
  });

  it('no renderiza el FAB (creación de cliente mobile deshabilitada por ahora)', () => {
    const fab = fixture.debugElement.query(By.css('app-mob-fab'));

    expect(fab).toBeNull();
  });

  it('debe aplicar los filtros emitidos por MobFilterPanel', () => {
    const filterPanel = fixture.debugElement.query(By.css('app-mob-filter-panel'));

    filterPanel.triggerEventHandler('filtersApply', {
      estado: 'ACTIVO',
    });

    expect(component['tableState'].queryParams().filters).toEqual({
      estado: 'ACTIVO',
    });
  });

  it('debe limpiar los filtros cuando MobFilterPanel emite filtersClear', () => {
    component['tableState'].updateFilters({
      estado: 'ACTIVO',
    });

    const filterPanel = fixture.debugElement.query(By.css('app-mob-filter-panel'));

    filterPanel.triggerEventHandler('filtersClear');

    expect(component['tableState'].queryParams().filters).toEqual({});
  });

  it('mobileList.rows debe contener los clientes recibidos ya mapeados a la card', () => {
    expect(component['mobileList'].rows()).toEqual(
      mockPageResponse.content.map(mapClienteCardMobileRow),
    );
  });

  it('debe llamar a getAll para cargar el listado móvil', () => {
    expect(mockClientesService.getAll).toHaveBeenCalled();
  });

  it('no hay más páginas cuando la respuesta es la última', () => {
    expect(component['mobileList'].hasMore()).toBe(false);
  });

  it('las cards no muestran el menú de acciones (⋮) en mobile', () => {
    const rowActions = fixture.debugElement.query(By.css('app-row-actions'));
    expect(rowActions).toBeNull();
  });
});
