import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListadoClientes } from './listado-clientes';
import { ClientesService } from '../services/cliente.service';
import {
  FilterConfigProvider,
  FormFieldConfig,
  PageResponse,
  TableStateService,
} from '../../../shared';
import { ClientesColumnsService } from '../services/cliente-columns.service';
import { ClienteRespuestaDto, EstadoCliente, TipoCliente } from '../models/cliente.model';
import { Router } from '@angular/router';

const mockPageResponse: PageResponse<ClienteRespuestaDto> = {
  content: [
    {
      id: 1,
      nombre: 'Juan Perez',
      tipoCliente: TipoCliente.Socio,
      numeroSocio: '123',
      cedula: '1.234.567-8',
      email: 'juan@example.com',
      estado: EstadoCliente.Activo,
    },
    {
      id: 2,
      nombre: 'Maria Fernandez',
      tipoCliente: TipoCliente.Particular,
      numeroSocio: '-',
      cedula: '2.345.678-9',
      email: 'maria@example.com',
      estado: EstadoCliente.Inactivo,
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
  let mockClientesService: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockClientesService = {
      getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [ListadoClientes],
      providers: [
        { provide: ClientesService, useValue: mockClientesService },
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

  it('debe definir columna nombre como sortable', () => {
    const col = component['columns'].find((c) => c.key === 'nombre');
    expect(col).toBeDefined();
    expect(col!.sortable).toBe(true);
  });

  it('debe definir columna estado con cellType tag y tagMap ACTIVO/INACTIVO/BAJA', () => {
    const col = component['columns'].find((c) => c.key === 'estado');
    expect(col).toMatchObject({
      cellType: 'tag',
      tagMap: {
        [EstadoCliente.Activo]: { styleClass: 'tag--green', label: 'Activo' },
        [EstadoCliente.Inactivo]: { styleClass: 'tag--yellow', label: 'Inactivo' },
        [EstadoCliente.Baja]: { styleClass: 'tag--gray', label: 'De baja' },
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
    expect(actions).toHaveLength(1);
    expect(actions[0].label).toBe('Ver detalle');
    expect(actions[0].icon).toBe('pi pi-eye');
  });

  it('el comando de "Ver detalle" navega correctamente', () => {
    const navigateSpy = vi.spyOn(component['router'], 'navigate');
    const row = {
      id: 1,
    } as ClienteRespuestaDto;
    const actions = component['rowActions'](row);
    actions[0].command?.(row);
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', 1]);
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
          useValue: { getAll: vi.fn().mockReturnValue(of(mockPageResponse)) },
        },
      ],
    })
      .overrideComponent(ListadoClientes, {
        set: {
          providers: [
            TableStateService,
            ClientesColumnsService,
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
