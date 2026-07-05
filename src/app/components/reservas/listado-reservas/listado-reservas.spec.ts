import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@auth0/auth0-angular';

import {
  FilterConfigProvider,
  PageResponse,
  TableStateService,
  TableExportService,
} from '../../../shared';

import { EstadoReserva } from '../../../shared';
import { ReservaRow, TipoReserva } from '../models/reserva.model';
import { ReservasService } from '../services/reservas.service';
import { ReservasColumnsService } from '../services/reserva-columns.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { ListadoReservas } from './listado-reservas';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

/* ---------------- TIPOS DE MOCKS ---------------- */

interface MockReservasService {
  getAll: ReturnType<typeof vi.fn>;
  exportar: ReturnType<typeof vi.fn>;
  confirmarDocumentacion: ReturnType<typeof vi.fn>;
}

interface MockConfirmDialogService {
  open: ReturnType<typeof vi.fn>;
}

interface MockTableExportService {
  exportar: ReturnType<typeof vi.fn>;
  exportando: ReturnType<typeof vi.fn>;
  puedeExportar: ReturnType<typeof vi.fn>;
}

interface MockErrorHandlerService {
  handle: ReturnType<typeof vi.fn>;
}

/* ---------------- MOCKS ---------------- */

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
  tieneDocumentacion: false,
  tipoReserva: TipoReserva.Comun,
  montoImpago: 5000,
  fechaLimitePago: null,
  pago: false,
  pendienteDocumentacion: false,
};

const mockRowRequiereDocSinConfirmar: ReservaRow = {
  ...mockRow,
  id: 2,
  requiereDocumentacion: true,
  tieneDocumentacion: false,
};

const mockRowRequiereDocYaConfirmada: ReservaRow = {
  ...mockRow,
  id: 3,
  requiereDocumentacion: true,
  tieneDocumentacion: true,
};

const mockRowYaPaga: ReservaRow = {
  ...mockRow,
  id: 4,
  pago: true,
};

const mockRowFinalizada: ReservaRow = {
  ...mockRow,
  id: 5,
  estadoReserva: EstadoReserva.Finalizada,
};

const mockRowCancelada: ReservaRow = {
  ...mockRow,
  id: 6,
  estadoReserva: EstadoReserva.Cancelada,
};

const mockRowColaboracionSinFines: ReservaRow = {
  ...mockRow,
  id: 7,
  tipoReserva: TipoReserva.ColaboracionSinFines,
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

/* ---------------- TEST ---------------- */

describe('ListadoReservas', () => {
  let fixture: ComponentFixture<ListadoReservas>;
  let component: ListadoReservas;

  let mockReservasService: MockReservasService;
  let mockConfirmDialogService: MockConfirmDialogService;
  let mockTableExportService: MockTableExportService;
  let errorHandlerMock: MockErrorHandlerService;

  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockReservasService = {
      getAll: vi.fn().mockReturnValue(of(mockPage)),
      exportar: vi.fn().mockReturnValue(of(undefined)),
      confirmarDocumentacion: vi.fn().mockReturnValue(of(undefined)),
    };

    mockConfirmDialogService = {
      open: vi.fn().mockReturnValue(of(true)),
    };

    mockTableExportService = {
      exportar: vi.fn((fn: () => Observable<void>) => fn()), // ejecuta callback
      exportando: vi.fn(() => false),
      puedeExportar: vi.fn(() => true),
    };

    errorHandlerMock = {
      handle: vi.fn(),
    };

    navigateSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ListadoReservas],
      providers: [
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: ErrorHandlerService, useValue: errorHandlerMock },
      ],
    })
      .overrideComponent(ListadoReservas, {
        set: {
          providers: [
            TableStateService,
            { provide: TableExportService, useValue: mockTableExportService },
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
    expect(mockReservasService.getAll).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      filters: {},
    });
  });

  it('onFilterChange actualiza filtros', () => {
    component['onFilterChange']({ estado: 'CONFIRMADA' });
    expect(component['tableState'].queryParams().filters).toEqual({
      estado: 'CONFIRMADA',
    });
  });

  it('onSearchChange actualiza el filtro search manteniendo los demás filtros', () => {
    component['onFilterChange']({ estado: 'CONFIRMADA' });
    component['onSearchChange']('juan');

    expect(component['tableState'].queryParams().filters).toEqual({
      estado: 'CONFIRMADA',
      search: 'juan',
    });
  });

  it('onClearFilters limpia filtros', () => {
    component['onFilterChange']({ estado: 'CONFIRMADA' });
    component['onClearFilters']();

    expect(component['tableState'].queryParams().filters).toEqual({});
  });

  it('onNuevaReserva navega correctamente', () => {
    component['onNuevaReserva']();
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas/nueva']);
  });

  it('rowActions incluye Ver detalle', () => {
    const actions = component['rowActions'](mockRow);
    expect(actions[0].label).toBe('Ver detalle');
  });

  it('Ver detalle navega', () => {
    const actions = component['rowActions'](mockRow);
    actions[0].command?.(mockRow);

    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', 1]);
  });

  it('filterChange desde panel', () => {
    const panel = fixture.debugElement.query(By.css('app-filter-panel'));
    panel.triggerEventHandler('filterChange', { estado: 'PENDIENTE' });

    expect(component['tableState'].queryParams().filters).toEqual({
      estado: 'PENDIENTE',
    });
  });

  describe('Confirmar pago', () => {
    it('aparece cuando la reserva no está pagada, no está finalizada/cancelada y no es colaboración', () => {
      const actions = component['rowActions'](mockRow);
      expect(actions.some((a) => a.label === 'Confirmar pago')).toBe(true);
    });

    it('no aparece si la reserva ya está paga', () => {
      const actions = component['rowActions'](mockRowYaPaga);
      expect(actions.some((a) => a.label === 'Confirmar pago')).toBe(false);
    });

    it('no aparece si la reserva está finalizada', () => {
      const actions = component['rowActions'](mockRowFinalizada);
      expect(actions.some((a) => a.label === 'Confirmar pago')).toBe(false);
    });

    it('no aparece si la reserva está cancelada', () => {
      const actions = component['rowActions'](mockRowCancelada);
      expect(actions.some((a) => a.label === 'Confirmar pago')).toBe(false);
    });

    it('no aparece si el tipo de reserva es Colaboración sin fines', () => {
      const actions = component['rowActions'](mockRowColaboracionSinFines);
      expect(actions.some((a) => a.label === 'Confirmar pago')).toBe(false);
    });

    it('el comando de "Confirmar pago" selecciona la reserva para el pago', () => {
      const actions = component['rowActions'](mockRow);
      const action = actions.find((a) => a.label === 'Confirmar pago');

      action?.command?.(mockRow);

      expect(component['reservaPagoSeleccionada']()).toEqual(mockRow);
    });
  });

  describe('Flujo de pago de reserva', () => {
    it('onConfirmarPago selecciona la reserva', () => {
      component['onConfirmarPago'](mockRow);
      expect(component['reservaPagoSeleccionada']()).toEqual(mockRow);
    });

    it('onCerrarPagoReserva limpia la reserva seleccionada', () => {
      component['onConfirmarPago'](mockRow);
      component['onCerrarPagoReserva']();

      expect(component['reservaPagoSeleccionada']()).toBeNull();
    });

    it('onPagoReservaRegistrado limpia la selección y recarga la tabla', () => {
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      component['onConfirmarPago'](mockRow);
      component['onPagoReservaRegistrado']();

      expect(component['reservaPagoSeleccionada']()).toBeNull();
      expect(updateFiltersSpy).toHaveBeenCalled();
    });
  });

  describe('Confirmar documentación', () => {
    it('no aparece si no requiere', () => {
      const actions = component['rowActions'](mockRow);
      expect(actions.some((a) => a.label === 'Confirmar documentación')).toBe(false);
    });

    it('aparece si requiere y no está confirmada', () => {
      const actions = component['rowActions'](mockRowRequiereDocSinConfirmar);
      expect(actions.some((a) => a.label === 'Confirmar documentación')).toBe(true);
    });

    it('no aparece si ya está confirmada', () => {
      const actions = component['rowActions'](mockRowRequiereDocYaConfirmada);
      expect(actions.some((a) => a.label === 'Confirmar documentación')).toBe(false);
    });

    it('confirma documentación', () => {
      const reloadSpy = vi.spyOn(component['tableState'], 'reload');

      const actions = component['rowActions'](mockRowRequiereDocSinConfirmar);
      const action = actions.find((a) => a.label === 'Confirmar documentación');

      action?.command?.(mockRowRequiereDocSinConfirmar);

      expect(mockConfirmDialogService.open).toHaveBeenCalled();
      expect(mockReservasService.confirmarDocumentacion).toHaveBeenCalledWith(2);
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('exportar', () => {
    it('exporta correctamente', () => {
      component['tableState'].updateFilters({ estadoReserva: 'PENDIENTE' });

      component['onExportar']();

      expect(mockTableExportService.exportar).toHaveBeenCalled();
      expect(mockReservasService.exportar).toHaveBeenCalled();
    });

    it('maneja error', () => {
      mockTableExportService.exportar = vi.fn((fn: () => Observable<void>) => {
        fn().subscribe({
          error: (e: unknown) => new errorHandlerMock.handle(e),
        });
      });

      mockReservasService.exportar = vi.fn(() => throwError(() => new Error('error')));

      component['onExportar']();

      expect(errorHandlerMock.handle).toHaveBeenCalled();
    });
  });
});
