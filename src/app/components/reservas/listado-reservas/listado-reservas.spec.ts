import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@auth0/auth0-angular';
import { FilterConfigProvider, PageResponse, TableStateService } from '../../../shared';
import { EstadoReserva } from '../../../shared';
import { ReservaRow } from '../models/reserva.model';
import { ReservasService } from '../services/reservas.service';
import { ReservasColumnsService } from '../services/reserva-columns.service';
import { ListadoReservas } from './listado-reservas';

const mockRow: ReservaRow = {
  id: 1,
  clienteId: 10,
  nombreCliente: 'Juan Pérez',
  servicioId: 3,
  servicioNombre: 'Hospedaje en camping',
  fechaEntrada: '2026-08-10',
  fechaSalida: '2026-08-15',
  estadoReserva: EstadoReserva.Confirmada,
  requiereDocumentacion: false,
  tieneDocumentacion: false
};

const mockPage: PageResponse<ReservaRow> = {
  content: [mockRow],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

const mockAuthService = {
  user$: of({ name: 'Juan Pérez', email: 'juan@example.com' }),
};

class MinimalFilterProvider extends FilterConfigProvider {
  readonly filterFields = signal([]);
}

describe('ListadoReservas', () => {
  let fixture: ComponentFixture<ListadoReservas>;
  let component: ListadoReservas;
  let mockReservasService: { getAll: ReturnType<typeof vi.fn> };
  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockReservasService = { getAll: vi.fn().mockReturnValue(of(mockPage)) };
    navigateSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ListadoReservas],
      providers: [
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideComponent(ListadoReservas, {
        set: {
          providers: [
            TableStateService,
            ReservasColumnsService,
            { provide: ReservasService, useValue: mockReservasService },
            { provide: FilterConfigProvider, useClass: MinimalFilterProvider },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ListadoReservas);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('loadDataFn delega en ReservasService.getAll', () => {
    component['loadDataFn']({ page: 0, size: 10, filters: {} });
    expect(mockReservasService.getAll).toHaveBeenCalledWith({ page: 0, size: 10, filters: {} });
  });

  it('onFilterChange actualiza los filtros en tableState', () => {
    component['onFilterChange']({ estado: 'CONFIRMADA' });
    expect(component['tableState'].queryParams().filters).toEqual({ estado: 'CONFIRMADA' });
  });

  it('onClearFilters limpia los filtros en tableState', () => {
    component['onFilterChange']({ estado: 'CONFIRMADA' });
    component['onClearFilters']();
    expect(component['tableState'].queryParams().filters).toEqual({});
  });

  it('onNuevaReserva navega a /reservas/nueva', () => {
    component['onNuevaReserva']();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas/nueva']);
  });

  it('rowActions incluye "Ver detalle" como primera acción', () => {
    const actions = component['rowActions'](mockRow as unknown as ReservaRow);
    expect(actions[0].label).toBe('Ver detalle');
    expect(actions[0].icon).toBe('pi pi-eye');
  });

  it('el comando "Ver detalle" navega a /reservas/:id', () => {
    const actions = component['rowActions'](mockRow as unknown as ReservaRow);
    actions[0].command?.(mockRow as unknown as ReservaRow);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', 1]);
  });

  it('filterChange desde app-filter-panel actualiza tableState', () => {
    const filterPanel = fixture.debugElement.query(By.css('app-filter-panel'));
    filterPanel.triggerEventHandler('filterChange', { estado: 'PENDIENTE' });
    expect(component['tableState'].queryParams().filters).toEqual({ estado: 'PENDIENTE' });
  });
});
