import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@auth0/auth0-angular';
import {
  FilterConfigProvider,
  PageResponse,
  TableStateService,
  TableExportService,
} from '../../../shared';
import { EstadoReserva } from '../../../shared';
import { ReservaRow, ReservaRespuestaDto, TipoReserva } from '../models/reserva.model';
import { ReservasService } from '../services/reservas.service';
import { ReservasColumnsService } from '../services/reserva-columns.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { ListadoReservas } from './listado-reservas';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

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
  let mockReservasService: {
    getAll: ReturnType<typeof vi.fn>;
    confirmarDocumentacion: ReturnType<typeof vi.fn>;
  };
  let mockConfirmDialogService: { open: ReturnType<typeof vi.fn> };
    exportar: ReturnType<typeof vi.fn>;
  };
  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockReservasService = {
      getAll: vi.fn().mockReturnValue(of(mockPage)),
      confirmarDocumentacion: vi.fn().mockReturnValue(of(undefined)),
    };
    mockConfirmDialogService = { open: vi.fn().mockReturnValue(of(true)) };
      exportar: vi.fn().mockReturnValue(of(undefined)),
    };
    navigateSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ListadoReservas],
      providers: [
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
      ],
    })
      .overrideComponent(ListadoReservas, {
        set: {
          providers: [
            TableStateService,
            TableExportService,
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
    const actions = component['rowActions'](mockRow);
    expect(actions[0].label).toBe('Ver detalle');
    expect(actions[0].icon).toBe('pi pi-eye');
  });

  it('el comando "Ver detalle" navega a /reservas/:id', () => {
    const actions = component['rowActions'](mockRow);
    actions[0].command?.(mockRow);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', 1]);
  });

  it('filterChange desde app-filter-panel actualiza tableState', () => {
    const filterPanel = fixture.debugElement.query(By.css('app-filter-panel'));
    filterPanel.triggerEventHandler('filterChange', { estado: 'PENDIENTE' });
    expect(component['tableState'].queryParams().filters).toEqual({ estado: 'PENDIENTE' });
  });

  describe('acción "Confirmar documentación"', () => {
    it('no aparece cuando la reserva no requiere documentación', () => {
      const actions = component['rowActions'](mockRow);
      expect(actions.some((a) => a.label === 'Confirmar documentación')).toBe(false);
    });

    it('aparece cuando requiere documentación y todavía no la tiene', () => {
      const actions = component['rowActions'](mockRowRequiereDocSinConfirmar);
      expect(actions.some((a) => a.label === 'Confirmar documentación')).toBe(true);
    });

    it('no aparece cuando ya tiene la documentación confirmada', () => {
      const actions = component['rowActions'](mockRowRequiereDocYaConfirmada);
      expect(actions.some((a) => a.label === 'Confirmar documentación')).toBe(false);
    });

    it('al confirmar en el diálogo, llama a confirmarDocumentacion y recarga la tabla', () => {
      const reloadSpy = vi.spyOn(component['tableState'], 'reload');
      const actions = component['rowActions'](mockRowRequiereDocSinConfirmar);
      const accion = actions.find((a) => a.label === 'Confirmar documentación');

      accion?.command?.(mockRowRequiereDocSinConfirmar);

      expect(mockConfirmDialogService.open).toHaveBeenCalled();
      expect(mockReservasService.confirmarDocumentacion).toHaveBeenCalledWith(2);
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('si se cancela el diálogo, no llama a confirmarDocumentacion ni recarga', () => {
      mockConfirmDialogService.open.mockReturnValue(of(false));
      const reloadSpy = vi.spyOn(component['tableState'], 'reload');
      const actions = component['rowActions'](mockRowRequiereDocSinConfirmar);
      const accion = actions.find((a) => a.label === 'Confirmar documentación');

      accion?.command?.(mockRowRequiereDocSinConfirmar);

      expect(mockReservasService.confirmarDocumentacion).not.toHaveBeenCalled();
      expect(reloadSpy).not.toHaveBeenCalled();
    });
    it('rowActions incluye "Modificar" para estado Pendiente o Confirmada', () => {
      const actions = component['rowActions'](mockRow);
      expect(actions.some((a) => a.label === 'Modificar')).toBe(true);
    });

    it('el comando "Modificar" navega a /reservas/:id/modificar con queryParam from=listado', () => {
      const actions = component['rowActions'](mockRow);
      const accion = actions.find((a) => a.label === 'Modificar');
      accion?.command?.(mockRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/reservas', 1, 'modificar'], {
        queryParams: { from: 'listado' },
      });
    });

    it('onSearchChange actualiza el filtro search preservando los filtros existentes', () => {
      component['onFilterChange']({ estado: 'CONFIRMADA' });
      component['onSearchChange']('Juan');
      expect(component['tableState'].queryParams().filters).toEqual({
        estado: 'CONFIRMADA',
        search: 'Juan',
      });
  describe('exportar', () => {
    it('onExportar llama a reservasService.exportar con los filtros actuales', () => {
      component['tableState'].setResult(1);
      component['tableState'].setLoading(false);
      fixture.detectChanges();
      component['tableState'].updateFilters({ estadoReserva: 'PENDIENTE' });
      component['onExportar']();

      expect(mockReservasService.exportar).toHaveBeenCalledWith({ estadoReserva: 'PENDIENTE' });
    });

    it('onExportar setea exportando en false si el service falla', () => {
      component['tableState'].setResult(1);
      component['tableState'].setLoading(false);
      fixture.detectChanges();
      const errorHandler = TestBed.inject(ErrorHandlerService);
      const handleSpy = vi.spyOn(errorHandler, 'handle').mockImplementation(() => undefined);
      mockReservasService.exportar = vi.fn().mockReturnValue(throwError(() => new Error('error')));

      component['onExportar']();

      expect(component['tableExport'].exportando()).toBe(false);
      expect(handleSpy).toHaveBeenCalled();
    });
  });

  describe('confirmar pago', () => {
    it('debería incluir la acción Confirmar pago cuando la reserva aplica', () => {
      const actions = component['rowActions'](mockRow);

      expect(actions.some((action) => action.label === 'Confirmar pago')).toBe(true);
    });

    it('no debería incluir Confirmar pago si la reserva está finalizada', () => {
      const row = {
        ...mockRow,
        estadoReserva: EstadoReserva.Finalizada,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Confirmar pago')).toBe(false);
    });

    it('no debería incluir Confirmar pago si la reserva está cancelada', () => {
      const row = {
        ...mockRow,
        estadoReserva: EstadoReserva.Cancelada,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Confirmar pago')).toBe(false);
    });

    it('no debería incluir Confirmar pago si es colaboración sin fines de lucro', () => {
      const row = {
        ...mockRow,
        tipoReserva: TipoReserva.ColaboracionSinFines,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Confirmar pago')).toBe(false);
    });

    it('debería abrir el modal de pago al ejecutar Confirmar pago', () => {
      const action = component['rowActions'](mockRow).find((a) => a.label === 'Confirmar pago');

      action?.command?.(mockRow);

      expect(component['reservaPagoSeleccionada']()).toEqual(mockRow);
    });

    it('debería cerrar el modal de pago', () => {
      component['onConfirmarPago'](mockRow);

      component['onCerrarPagoReserva']();

      expect(component['reservaPagoSeleccionada']()).toBeNull();
    });

    it('debería cerrar el modal y refrescar la tabla cuando se registra el pago', () => {
      const tableState = component['tableState'];
      const updateFiltersSpy = vi.spyOn(tableState, 'updateFilters');

      component['onConfirmarPago'](mockRow);
      component['onPagoReservaRegistrado']();

      expect(component['reservaPagoSeleccionada']()).toBeNull();
      expect(updateFiltersSpy).toHaveBeenCalledWith(tableState.queryParams().filters);
    });
  });
});
