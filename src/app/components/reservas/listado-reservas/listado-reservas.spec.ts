import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { NEVER, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ConfirmDialogService,
  EstadoReserva,
  FilterConfigProvider,
  FormFieldConfig,
  PageResponse,
  TableExportService,
  TableStateService,
} from '../../../shared';

import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FormaPago } from '../../../shared/models/forma-pago.model';

import { ReservaRespuestaDto, ReservaRow, TipoReserva } from '../models/reserva.model';

import { ReservasColumnsService } from '../services/reserva-columns.service';
import { ReservasService } from '../services/reservas.service';
import { ListadoReservas } from './listado-reservas';

const mockRow: ReservaRespuestaDto = {
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

const mockPage: PageResponse<ReservaRespuestaDto> = {
  content: [mockRow],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

const mockAuthService = {
  user$: of({
    name: 'Juan Pérez',
    email: 'juan@example.com',
  }),
};

class MinimalFilterProvider extends FilterConfigProvider {
  readonly filterFields = signal<FormFieldConfig[]>([]);
}

describe('ListadoReservas', () => {
  let fixture: ComponentFixture<ListadoReservas>;
  let component: ListadoReservas;

  let mockReservasService: {
    getAll: ReturnType<typeof vi.fn>;
    exportar: ReturnType<typeof vi.fn>;
    verificarCancelacion: ReturnType<typeof vi.fn>;
    cancelar: ReturnType<typeof vi.fn>;
    confirmarDocumentacion: ReturnType<typeof vi.fn>;
    verificarFinalizacion: ReturnType<typeof vi.fn>;
    finalizar: ReturnType<typeof vi.fn>;
  };

  let mockConfirmDialogService: {
    open: ReturnType<typeof vi.fn>;
  };

  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };

  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockReservasService = {
      getAll: vi.fn().mockReturnValue(of(mockPage)),
      exportar: vi.fn().mockReturnValue(of(undefined)),
      verificarCancelacion: vi.fn().mockReturnValue(
        of({
          puedeCancelarseDirectamente: true,
          pagosAsociados: [],
          importeTotalPagos: 0,
        }),
      ),
      cancelar: vi.fn().mockReturnValue(of(undefined)),
      confirmarDocumentacion: vi.fn().mockReturnValue(of(undefined)),
      verificarFinalizacion: vi.fn().mockReturnValue(
        of({
          puedeFinalizarSinPago: true,
          montoImpago: 0,
        }),
      ),
      finalizar: vi.fn().mockReturnValue(of(undefined)),
    };

    mockConfirmDialogService = {
      open: vi.fn().mockReturnValue(of(true)),
    };

    mockErrorHandler = {
      handle: vi.fn(),
    };

    navigateSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ListadoReservas],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: navigateSpy,
          },
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfirmDialogService,
          useValue: mockConfirmDialogService,
        },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () =>
              of({
                matches: false,
              }),
          },
        },
        BreakpointService,
        {
          provide: ErrorHandlerService,
          useValue: mockErrorHandler,
        },
      ],
    })
      .overrideComponent(ListadoReservas, {
        set: {
          providers: [
            TableStateService,
            TableExportService,
            ReservasColumnsService,
            {
              provide: ReservasService,
              useValue: mockReservasService,
            },
            {
              provide: FilterConfigProvider,
              useClass: MinimalFilterProvider,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ListadoReservas);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el listado de reservas', () => {
    expect(fixture.nativeElement.textContent).toContain('Listado de Reservas');
  });

  it('loadDataFn delega en ReservasService.getAll', () => {
    const params = {
      page: 0,
      size: 10,
      filters: {},
    };

    component['loadDataFn'](params);

    expect(mockReservasService.getAll).toHaveBeenCalledWith(params);
  });

  it('onFilterChange actualiza los filtros en tableState', () => {
    component['onFilterChange']({
      estadoReserva: 'CONFIRMADA',
    });

    expect(component['tableState'].queryParams().filters).toEqual({
      estadoReserva: 'CONFIRMADA',
    });
  });

  it('onApplyFilters actualiza los filtros en tableState', () => {
    component['onApplyFilters']({
      estadoReserva: 'PENDIENTE',
      nombreCliente: 'Juan',
    });

    expect(component['tableState'].queryParams().filters).toEqual({
      estadoReserva: 'PENDIENTE',
      nombreCliente: 'Juan',
    });
  });

  it('onClearFilters limpia los filtros en tableState', () => {
    component['onFilterChange']({
      estadoReserva: 'CONFIRMADA',
    });

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

    expect(filterPanel).not.toBeNull();

    filterPanel.triggerEventHandler('filterChange', {
      estadoReserva: 'PENDIENTE',
    });

    expect(component['tableState'].queryParams().filters).toEqual({
      estadoReserva: 'PENDIENTE',
    });
  });

  it('en escritorio muestra app-table', () => {
    const table = fixture.debugElement.query(By.css('app-table'));

    expect(table).not.toBeNull();
  });

  it('en escritorio no muestra las cards móviles', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-mob-list-card'));

    expect(cards.length).toBe(0);
  });

  describe('exportar', () => {
    it('onExportar llama a reservasService.exportar con los filtros actuales', () => {
      component['tableState'].setResult(1);
      component['tableState'].setLoading(false);

      fixture.detectChanges();

      component['tableState'].updateFilters({
        estadoReserva: 'PENDIENTE',
      });

      component['onExportar']();

      expect(mockReservasService.exportar).toHaveBeenCalledWith({
        estadoReserva: 'PENDIENTE',
      });
    });

    it('onExportar setea exportando en false si el service falla', () => {
      component['tableState'].setResult(1);
      component['tableState'].setLoading(false);

      fixture.detectChanges();

      const error = new Error('error');

      mockReservasService.exportar.mockReturnValue(throwError(() => error));

      component['onExportar']();

      expect(component['tableExport'].exportando()).toBe(false);

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    });
  });

  describe('confirmar pago', () => {
    it('debería incluir la acción Confirmar pago cuando la reserva aplica', () => {
      const actions = component['rowActions'](mockRow);

      expect(actions.some((action) => action.label === 'Confirmar pago')).toBe(true);
    });

    it('no debería incluir Confirmar pago si la reserva está finalizada', () => {
      const row: ReservaRow = {
        ...mockRow,
        estadoReserva: EstadoReserva.Finalizada,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Confirmar pago')).toBe(false);
    });

    it('no debería incluir Confirmar pago si la reserva está cancelada', () => {
      const row: ReservaRow = {
        ...mockRow,
        estadoReserva: EstadoReserva.Cancelada,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Confirmar pago')).toBe(false);
    });

    it('no debería incluir Confirmar pago si es colaboración sin fines de lucro', () => {
      const row: ReservaRow = {
        ...mockRow,
        tipoReserva: TipoReserva.ColaboracionSinFines,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Confirmar pago')).toBe(false);
    });

    it('debería abrir el modal de pago al ejecutar Confirmar pago', () => {
      const action = component['rowActions'](mockRow).find(
        (item) => item.label === 'Confirmar pago',
      );

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

  describe('cancelar reserva', () => {
    it('debería incluir la acción Cancelar cuando la reserva está pendiente o confirmada', () => {
      const actions = component['rowActions'](mockRow);

      expect(actions.some((action) => action.label === 'Cancelar')).toBe(true);
    });

    it('no debería incluir Cancelar si la reserva está finalizada', () => {
      const row: ReservaRow = {
        ...mockRow,
        estadoReserva: EstadoReserva.Finalizada,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Cancelar')).toBe(false);
    });

    it('no debería incluir Cancelar si la reserva está cancelada', () => {
      const row: ReservaRow = {
        ...mockRow,
        estadoReserva: EstadoReserva.Cancelada,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Cancelar')).toBe(false);
    });

    it('debería verificar cancelación al ejecutar la acción Cancelar', () => {
      mockReservasService.verificarCancelacion.mockReturnValue(NEVER);

      const action = component['rowActions'](mockRow).find((item) => item.label === 'Cancelar');

      action?.command?.(mockRow);

      expect(component['reservaCancelacionSeleccionada']()).toEqual(mockRow);

      expect(mockReservasService.verificarCancelacion).toHaveBeenCalledWith(mockRow.id);
    });

    it('si no tiene pagos asociados debería abrir confirmación simple', () => {
      mockConfirmDialogService.open.mockReturnValue(of(false));

      component['iniciarCancelacion'](mockRow);

      expect(mockConfirmDialogService.open).toHaveBeenCalledWith({
        title: 'Cancelar reserva',
        message: `La reserva #${mockRow.id} no tiene pagos asociados. ¿Confirmás la cancelación?`,
        confirmButtonLabel: 'Cancelar reserva',
        cancelButtonLabel: 'Volver',
        variant: 'danger',
      });
    });

    it('si confirma cancelación simple debería llamar a cancelar sin devolución', () => {
      mockConfirmDialogService.open.mockReturnValue(of(true));

      component['iniciarCancelacion'](mockRow);

      expect(mockReservasService.cancelar).toHaveBeenCalledWith(mockRow.id, {
        generarDevolucion: false,
      });
    });

    it('si tiene pagos asociados debería guardar el check para abrir el modal dedicado', () => {
      const check = {
        puedeCancelarseDirectamente: false,
        pagosAsociados: [
          {
            id: 1,
            fecha: '2026-07-01',
            importe: 5000,
            formaPago: FormaPago.Efectivo,
          },
        ],
        importeTotalPagos: 5000,
      };

      mockReservasService.verificarCancelacion.mockReturnValue(of(check));

      component['iniciarCancelacion'](mockRow);

      expect(component['cancelacionCheck']()).toEqual(check);
    });

    it('onConfirmarCancelacionConPagos debería llamar a cancelar con el dto recibido', () => {
      component['reservaCancelacionSeleccionada'].set(mockRow);

      component['onConfirmarCancelacionConPagos']({
        generarDevolucion: true,
        formaPago: FormaPago.Efectivo,
      });

      expect(mockReservasService.cancelar).toHaveBeenCalledWith(mockRow.id, {
        generarDevolucion: true,
        formaPago: FormaPago.Efectivo,
      });
    });

    it('onCerrarCancelacionConPagos debería limpiar la cancelación', () => {
      component['reservaCancelacionSeleccionada'].set(mockRow);

      component['cancelacionCheck'].set({
        puedeCancelarseDirectamente: false,
        pagosAsociados: [],
        importeTotalPagos: 0,
      });

      component['onCerrarCancelacionConPagos']();

      expect(component['reservaCancelacionSeleccionada']()).toBeNull();

      expect(component['cancelacionCheck']()).toBeNull();
    });

    it('si verificarCancelacion falla debería manejar el error y limpiar estado', () => {
      const error = new Error('error');

      mockReservasService.verificarCancelacion.mockReturnValue(throwError(() => error));

      component['iniciarCancelacion'](mockRow);

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);

      expect(component['verificandoCancelacionVisible']()).toBe(false);

      expect(component['reservaCancelacionSeleccionada']()).toBeNull();
    });
  });

  describe('finalizar reserva', () => {
    const mockRowEnCurso: ReservaRow = {
      ...mockRow,
      estadoReserva: EstadoReserva.EnCurso,
    };

    it('debería incluir la acción Finalizar cuando la reserva está en curso', () => {
      const actions = component['rowActions'](mockRowEnCurso);

      expect(actions.some((action) => action.label === 'Finalizar')).toBe(true);
    });

    it('no debería incluir Finalizar si la reserva no está en curso', () => {
      const actions = component['rowActions'](mockRow);

      expect(actions.some((action) => action.label === 'Finalizar')).toBe(false);
    });

    it('debería verificar finalización al ejecutar la acción Finalizar', () => {
      mockReservasService.verificarFinalizacion.mockReturnValue(NEVER);

      const action = component['rowActions'](mockRowEnCurso).find(
        (item) => item.label === 'Finalizar',
      );

      action?.command?.(mockRowEnCurso);

      expect(component['reservaFinalizacionSeleccionada']()).toEqual(mockRowEnCurso);

      expect(mockReservasService.verificarFinalizacion).toHaveBeenCalledWith(mockRowEnCurso.id);
    });

    it('si no tiene saldo pendiente debería abrir confirmación simple', () => {
      mockConfirmDialogService.open.mockReturnValue(of(false));

      component['iniciarFinalizacion'](mockRowEnCurso);

      expect(mockConfirmDialogService.open).toHaveBeenCalledWith({
        title: 'Finalizar reserva',
        message: `La reserva #${mockRowEnCurso.id} no tiene saldo pendiente. ¿Confirmás la finalización?`,
        confirmButtonLabel: 'Finalizar reserva',
        cancelButtonLabel: 'Volver',
        variant: 'primary',
      });
    });

    it('si confirma finalización simple debería llamar a finalizar con dto vacío', () => {
      mockConfirmDialogService.open.mockReturnValue(of(true));

      component['iniciarFinalizacion'](mockRowEnCurso);

      expect(mockReservasService.finalizar).toHaveBeenCalledWith(mockRowEnCurso.id, {});
    });

    it('si tiene saldo pendiente debería guardar el check para abrir el modal dedicado', () => {
      const check = {
        puedeFinalizarSinPago: false,
        montoImpago: 2500,
      };

      mockReservasService.verificarFinalizacion.mockReturnValue(of(check));

      component['iniciarFinalizacion'](mockRowEnCurso);

      expect(component['finalizacionCheck']()).toEqual(check);
    });

    it('onConfirmarFinalizacionConSaldo debería llamar a finalizar con el dto recibido', () => {
      component['reservaFinalizacionSeleccionada'].set(mockRowEnCurso);

      component['onConfirmarFinalizacionConSaldo']({
        completarPago: true,
        formaPago: FormaPago.Efectivo,
        notas: 'Pago al finalizar',
      });

      expect(mockReservasService.finalizar).toHaveBeenCalledWith(mockRowEnCurso.id, {
        completarPago: true,
        formaPago: FormaPago.Efectivo,
        notas: 'Pago al finalizar',
      });
    });

    it('onCerrarFinalizacionConSaldo debería limpiar la finalización', () => {
      component['reservaFinalizacionSeleccionada'].set(mockRowEnCurso);

      component['finalizacionCheck'].set({
        puedeFinalizarSinPago: false,
        montoImpago: 2500,
      });

      component['onCerrarFinalizacionConSaldo']();

      expect(component['reservaFinalizacionSeleccionada']()).toBeNull();

      expect(component['finalizacionCheck']()).toBeNull();
    });

    it('si verificarFinalizacion falla debería manejar el error y limpiar estado', () => {
      const error = new Error('error');

      mockReservasService.verificarFinalizacion.mockReturnValue(throwError(() => error));

      component['iniciarFinalizacion'](mockRowEnCurso);

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);

      expect(component['verificandoFinalizacionVisible']()).toBe(false);

      expect(component['reservaFinalizacionSeleccionada']()).toBeNull();
    });
  });

  describe('confirmar documentación', () => {
    const mockRowRequiereDoc: ReservaRow = {
      ...mockRow,
      requiereDocumentacion: true,
      tieneDocumentacion: false,
    };

    it('no debería incluir Confirmar documentación si la reserva no la requiere', () => {
      const actions = component['rowActions'](mockRow);

      expect(actions.some((action) => action.label === 'Confirmar documentación')).toBe(false);
    });

    it('debería incluir Confirmar documentación si la requiere y aún no la tiene', () => {
      const actions = component['rowActions'](mockRowRequiereDoc);

      expect(actions.some((action) => action.label === 'Confirmar documentación')).toBe(true);
    });

    it('no debería incluir Confirmar documentación si ya cuenta con la documentación', () => {
      const row: ReservaRow = {
        ...mockRowRequiereDoc,
        tieneDocumentacion: true,
      };

      const actions = component['rowActions'](row);

      expect(actions.some((action) => action.label === 'Confirmar documentación')).toBe(false);
    });

    it('debería confirmar la documentación y refrescar la tabla al aceptar el diálogo', () => {
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      const action = component['rowActions'](mockRowRequiereDoc).find(
        (item) => item.label === 'Confirmar documentación',
      );

      action?.command?.(mockRowRequiereDoc);

      expect(mockConfirmDialogService.open).toHaveBeenCalled();

      expect(mockReservasService.confirmarDocumentacion).toHaveBeenCalledWith(
        mockRowRequiereDoc.id,
      );

      expect(updateFiltersSpy).toHaveBeenCalled();
    });

    it('no debería confirmar la documentación si se cancela el diálogo', () => {
      mockConfirmDialogService.open.mockReturnValue(of(false));

      const action = component['rowActions'](mockRowRequiereDoc).find(
        (item) => item.label === 'Confirmar documentación',
      );

      action?.command?.(mockRowRequiereDoc);

      expect(mockReservasService.confirmarDocumentacion).not.toHaveBeenCalled();
    });
  });
});
describe('ListadoReservas en vista móvil', () => {
  let fixture: ComponentFixture<ListadoReservas>;
  let component: ListadoReservas;
  let navigateSpy: ReturnType<typeof vi.fn>;

  const reservasServiceMock = {
    getAll: vi.fn().mockReturnValue(of(mockPage)),
    exportar: vi.fn().mockReturnValue(of(undefined)),
    verificarCancelacion: vi.fn(),
    cancelar: vi.fn(),
    confirmarDocumentacion: vi.fn(),
    verificarFinalizacion: vi.fn(),
    finalizar: vi.fn(),
  };

  beforeEach(async () => {
    navigateSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ListadoReservas],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: navigateSpy,
          },
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfirmDialogService,
          useValue: {
            open: vi.fn().mockReturnValue(of(false)),
          },
        },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: true }),
          },
        },
        BreakpointService,
        {
          provide: ErrorHandlerService,
          useValue: {
            handle: vi.fn(),
          },
        },
      ],
    })
      .overrideComponent(ListadoReservas, {
        set: {
          providers: [
            TableStateService,
            TableExportService,
            ReservasColumnsService,
            {
              provide: ReservasService,
              useValue: reservasServiceMock,
            },
            {
              provide: FilterConfigProvider,
              useClass: MinimalFilterProvider,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ListadoReservas);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renderiza los componentes de la vista móvil', () => {
    expect(fixture.debugElement.query(By.css('app-mob-filter-panel'))).not.toBeNull();

    expect(fixture.debugElement.queryAll(By.css('app-mob-list-card')).length).toBe(
      mockPage.content.length,
    );

    expect(fixture.debugElement.query(By.css('app-mob-fab'))).not.toBeNull();
  });

  it('no renderiza la tabla ni el filtro de escritorio', () => {
    expect(fixture.debugElement.query(By.css('app-table'))).toBeNull();

    expect(fixture.debugElement.query(By.css('app-filter-panel'))).toBeNull();
  });

  it('muestra los datos principales de la reserva', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Reserva N.º 1');
    expect(text).toContain('Confirmada');
    expect(text).toContain('Juan Pérez');
    expect(text).toContain('Hospedaje en camping');
    expect(text).toContain('10/08/2026');
  });

  it('mobileReservas contiene las reservas obtenidas', () => {
    expect(component['mobileReservas']()).toEqual(mockPage.content);
  });

  it('el FAB navega al alta de una reserva', () => {
    const fab = fixture.debugElement.query(By.css('app-mob-fab'));

    fab.triggerEventHandler('clicked');

    expect(navigateSpy).toHaveBeenCalledWith(['/reservas/nueva']);
  });

  it('aplica los filtros emitidos por MobFilterPanel', () => {
    const filterPanel = fixture.debugElement.query(By.css('app-mob-filter-panel'));

    filterPanel.triggerEventHandler('filtersApply', {
      estadoReserva: 'CONFIRMADA',
    });

    expect(component['tableState'].queryParams().filters).toEqual({
      estadoReserva: 'CONFIRMADA',
    });
  });

  it('limpia los filtros emitidos por MobFilterPanel', () => {
    component['tableState'].updateFilters({
      estadoReserva: 'CONFIRMADA',
    });

    const filterPanel = fixture.debugElement.query(By.css('app-mob-filter-panel'));

    filterPanel.triggerEventHandler('filtersClear');

    expect(component['tableState'].queryParams().filters).toEqual({});
  });
});
