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
} from '../../../shared';
import { ClienteRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';
import { ClientesService } from '../services/cliente.service';
import { ClientesColumnsService } from '../services/cliente-columns.service';
import { ListadoClientes } from './listado-clientes';

const mockPageResponse: PageResponse<ClienteRespuestaDto> = {
  content: [
    {
      id: 1,
      nombreCompleto: 'Juan Perez',
      tipoCliente: TipoCliente.Socio,
      numeroSocio: 123,
      cedula: '1.234.567-8',
      email: 'juan@example.com',
      estado: EstadoSocio.Activo,
    },
    {
      id: 2,
      nombreCompleto: 'Maria Fernandez',
      tipoCliente: TipoCliente.Particular,
      numeroSocio: null,
      cedula: '2.345.678-9',
      email: null,
      estado: null,
    },
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

describe('ListadoClientes', () => {
  let fixture: ComponentFixture<ListadoClientes>;
  let component: ListadoClientes;
  let mockClientesService: {
    getAll: ReturnType<typeof vi.fn>;
    getCostoCuota: ReturnType<typeof vi.fn>;
    darDeBaja: ReturnType<typeof vi.fn>;
  };
  let mockConfirmDialogService: {
    open: ReturnType<typeof vi.fn>;
  };
  beforeEach(async () => {
    mockClientesService = {
      getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
      getCostoCuota: vi.fn().mockReturnValue(5000),
      darDeBaja: vi.fn().mockReturnValue(of(void 0)),
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

  it('debe tener 5 columnas definidas', () => {
    expect(component['columns'].length).toBe(5);
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

  it('rowActions incluye "Pago de cuota" cuando el cliente es socio', () => {
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
  it('el comando de "Ver detalle" navega correctamente', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');

    const cliente: ClienteRespuestaDto = mockPageResponse.content[0];

    const actions = component['rowActions'](cliente);

    const verDetalle = actions.find((a) => a.label === 'Ver detalle');

    expect(verDetalle).toBeDefined();

    verDetalle!.command?.(cliente);

    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', 1, 'detalle']);
  });

  it('onNuevoCliente navega a /clientes/nuevo', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');
    component['onNuevoCliente']();
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes/nuevo']);
  });

  it('debe renderizar los encabezados de columna en la tabla', async () => {
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const labels = Array.from(headers).map((h) => h.textContent?.trim());
    expect(labels).toContain('Nombre');
    expect(labels).toContain('Nro de socio');
    expect(labels).toContain('Cédula');
    expect(labels).toContain('Email');
    expect(labels).toContain('Estado');
  });
  it('onNuevoCliente navega a clientes/nuevo', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');

    component['onNuevoCliente']();

    expect(navigateSpy).toHaveBeenCalledWith(['/clientes/nuevo']);
  });

  it('onPagoCuota selecciona el cliente para pagar cuota', () => {
    const row = mockPageResponse.content[0];

    component['onPagoCuota'](row);

    expect(component['clientePagoSeleccionado']()).toEqual(row);
  });

  it('rowActions incluye "Dar de baja" para socio con estado distinto de Baja', () => {
    const socio = mockPageResponse.content[0]; // TipoCliente.Socio, EstadoSocio.Activo

    const actions = component['rowActions'](socio);

    expect(actions.some((a) => a.label === 'Dar de baja')).toBe(true);
  });

  it('rowActions no incluye "Dar de baja" para cliente particular', () => {
    const particular = mockPageResponse.content[1]; // TipoCliente.Particular

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

  it('onEliminarCliente abre el diálogo de confirmación', () => {
    const row = mockPageResponse.content[0];

    component['onDarDeBajaCliente'](row);

    expect(mockConfirmDialogService.open).toHaveBeenCalledWith({
      title: 'Dar de baja cliente',
      message:
        '¿Confirma que quiere dar de baja este cliente? Si tiene reservas futuras, se cancelarán.',
      confirmButtonLabel: 'Dar de baja',
      cancelButtonLabel: 'Cancelar',
      variant: 'danger',
    });
  });
  it('onEliminarCliente llama a dar de baja si se confirma la baja', () => {
    const row = mockPageResponse.content[0];

    mockConfirmDialogService.open.mockReturnValue(of(true));

    component['onDarDeBajaCliente'](row);

    expect(mockClientesService.darDeBaja).toHaveBeenCalledWith(row.id);
  });

  it('onEliminarCliente no llama a eliminar si se cancela la baja', () => {
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

  it('el comando de "Pago de cuota" en rowActions llama a onPagoCuota (línea 73)', () => {
    const socio = mockPageResponse.content[0];
    const actions = component['rowActions'](socio);
    const pagoCuota = actions.find((a) => a.label === 'Pago de cuota')!;

    pagoCuota.command?.(socio);

    expect(component['clientePagoSeleccionado']()).toEqual(socio);
  });

  it('el comando de "Dar de baja" en rowActions abre el diálogo (línea 84)', () => {
    const socio = mockPageResponse.content[0];
    const actions = component['rowActions'](socio);
    const darDeBaja = actions.find((a) => a.label === 'Dar de baja')!;

    darDeBaja.command?.(socio);

    expect(mockConfirmDialogService.open).toHaveBeenCalled();
  });

  it('onCerrarPagoCuota limpia el cliente seleccionado para pago (línea 101)', () => {
    component['clientePagoSeleccionado'].set(mockPageResponse.content[0]);

    component['onCerrarPagoCuota']();

    expect(component['clientePagoSeleccionado']()).toBeNull();
  });

  it('onDarDeBajaCliente llama a console.error cuando darDeBaja falla (línea 122)', () => {
    const row = mockPageResponse.content[0];
    mockConfirmDialogService.open.mockReturnValue(of(true));
    mockClientesService.darDeBaja.mockReturnValue(throwError(() => new Error('Error de red')));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    component['onDarDeBajaCliente'](row);

    expect(consoleSpy).toHaveBeenCalledWith('Error al dar de baja cliente', expect.any(Error));
    consoleSpy.mockRestore();
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
      ],
    })
      .overrideComponent(ListadoClientes, {
        set: {
          providers: [
            TableStateService,
            ClientesColumnsService,
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
            getCostoCuota: vi.fn().mockReturnValue(5000),
          },
        },
      ],
    })
      .overrideComponent(ListadoClientes, {
        set: {
          providers: [
            TableStateService,
            ClientesColumnsService,
            {
              provide: ClientesService,
              useValue: {
                getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
                getCostoCuota: vi.fn().mockReturnValue(5000),
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
