import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListadoServicios } from './listado-servicios';
import { ServicioService } from '../services/servicio.service';
import { PageResponse } from '../../../shared';
import { EstadoServicio, ServicioRow } from '../models/servicio.model';

const mockPageResponse: PageResponse<ServicioRow> = {
  content: [
    {
      id: 1,
      nombre: 'Cabaña 1',
      procedencia: 'Camping',
      precioSocio: 800,
      precioParticular: 1200,
      unidad: 'p/día',
      estado: EstadoServicio.Habilitado,
    },
    {
      id: 2,
      nombre: 'Salón',
      procedencia: 'Sede',
      precioSocio: 100,
      precioParticular: 180,
      unidad: 'p/hora',
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

  it('onFilterChange debe actualizar los filtros en tableState', () => {
    const tableState = component['tableState'];
    component['onFilterChange']({ nombre: 'Cabaña', estado: EstadoServicio.Habilitado });
    expect(tableState.queryParams().filters).toEqual({
      nombre: 'Cabaña',
      estado: EstadoServicio.Habilitado,
    });
  });

  it('rowActions debe ser una función', () => {
    expect(typeof component['rowActions']).toBe('function');
  });

  it('rowActions debe retornar array vacío cuando no hay acciones implementadas', () => {
    const row: ServicioRow = {
      id: 1,
      nombre: 'Cabaña 1',
      procedencia: 'Camping',
      precioSocio: 800,
      precioParticular: 1200,
      unidad: 'p/día',
      estado: EstadoServicio.Habilitado,
    };
    expect(component['rowActions'](row)).toEqual([]);
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
