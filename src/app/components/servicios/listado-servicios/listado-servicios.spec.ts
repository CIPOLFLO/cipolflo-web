import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListadoServicios } from './listado-servicios';
import { ServicioService } from '../services/servicio.service';
import { ServiciosColumnsService } from '../services/servicios-columns.service';
import {
  FilterConfigProvider,
  FormFieldConfig,
  PageResponse,
  TableStateService,
} from '../../../shared';
import { EstadoServicio, ServicioRow } from '../models/servicio.model';

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

describe('ListadoServicios', () => {
  let fixture: ComponentFixture<ListadoServicios>;
  let component: ListadoServicios;
  let mockServicioService: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockServicioService = {
      getAll: vi.fn().mockReturnValue(of(mockPageResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [ListadoServicios],
      providers: [{ provide: ServicioService, useValue: mockServicioService }],
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

  it('rowActions debe ser una función', () => {
    expect(typeof component['rowActions']).toBe('function');
  });

  it('rowActions debe retornar la acción "Ver detalle"', () => {
    const row: ServicioRow = {
      id: 1,
      nombre: 'Cabaña 1',
      procedencia: 'Camping',
      precioSocio: 800,
      precioParticular: 1200,
      unidad: 'p/día',
      estado: EstadoServicio.Habilitado,
    };
    const actions = component['rowActions'](row);
    expect(actions).toHaveLength(1);
    expect(actions[0].label).toBe('Ver detalle');
    expect(actions[0].icon).toBe('pi pi-eye');
  });

  it('el comando de "Ver detalle" puede ejecutarse', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const row: ServicioRow = {
      id: 1,
      nombre: 'Cabaña 1',
      procedencia: 'Camping',
      precioSocio: 800,
      precioParticular: 1200,
      unidad: 'p/día',
      estado: EstadoServicio.Habilitado,
    };
    const actions = component['rowActions'](row);
    actions[0].command?.(row);
    expect(spy).toHaveBeenCalledWith('ver detalle', row.id);
    spy.mockRestore();
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
          useValue: { getAll: vi.fn().mockReturnValue(of(mockPageResponse)) },
        },
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
