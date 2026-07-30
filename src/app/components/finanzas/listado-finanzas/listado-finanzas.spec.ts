import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { of, throwError, firstValueFrom, Subscription, Subject } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';
import { ConfirmDialogService } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { DocumentIntelligenceService } from '../../documentos/services/document-intelligence.service';
import { Concepto, TipoMovimiento } from '../models/finanza.model';
import { FinanzaService } from '../services/finanza.service';
import { ListadoFinanzas } from './listado-finanzas';

describe('ListadoFinanzas', () => {
  let component: ListadoFinanzas;
  let fixture: ComponentFixture<ListadoFinanzas>;
  let router: Router;

  const mockRow = {
    id: 1,
    concepto: Concepto.PagoReserva,
    fecha: '14/3/2026',
    importeSignado: 15000,
    descripcion: 'Pago de alquiler',
  };

  const mockAuthService = {
    user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
    logout: vi.fn(),
  };

  const mockUserService = {
    userInitials: () => 'JP',
    userEmail: () => 'juan@example.com',
  };

  let mockFinanzaService: {
    getAll: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
    exportar: ReturnType<typeof vi.fn>;
  };

  let mockConfirmDialogService: {
    open: ReturnType<typeof vi.fn>;
  };

  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };

  let mockDocumentIntelligenceService: {
    analizarFactura: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockFinanzaService = {
      getAll: vi.fn().mockReturnValue(
        of({
          content: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
        }),
      ),
      eliminar: vi.fn().mockReturnValue(of(void 0)),
      exportar: vi.fn().mockReturnValue(of(void 0)),
    };

    mockConfirmDialogService = {
      open: vi.fn(),
    };

    mockErrorHandler = {
      handle: vi.fn(),
    };

    mockDocumentIntelligenceService = {
      analizarFactura: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ListadoFinanzas],
      providers: [
        provideRouter([]),
        { provide: FinanzaService, useValue: mockFinanzaService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: DocumentIntelligenceService, useValue: mockDocumentIntelligenceService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoFinanzas);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onNuevoMovimiento navega a /finanzas/nuevo', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component['onNuevoMovimiento']();

    expect(navigateSpy).toHaveBeenCalledWith(['/finanzas', 'nuevo']);
  });

  describe('loadDataFn', () => {
    it('debería manejar error y devolver página vacía', async () => {
      const error = new Error('Error al cargar finanzas');

      mockFinanzaService.getAll.mockReturnValue(throwError(() => error));

      const response = await firstValueFrom(
        component['loadDataFn']({ page: 0, size: 10, filters: {} }),
      );

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(response.content).toEqual([]);
      expect(response.totalElements).toBe(0);
    });
  });

  describe('rowActions', () => {
    it('debería incluir la acción Ver detalle', () => {
      const actions = component['rowActions'](mockRow);

      expect(actions.some((action) => action.label === 'Ver detalle')).toBe(true);
    });

    it('debería navegar al detalle al ejecutar Ver detalle', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component['rowActions'](mockRow)[0].command?.(mockRow);

      expect(navigateSpy).toHaveBeenCalledWith(['/finanzas', mockRow.id]);
    });

    it('no debería incluir la acción Modificar', () => {
      const actions = component['rowActions'](mockRow);

      expect(actions.some((action) => action.label === 'Modificar')).toBe(false);
    });

    it('debería incluir la acción Eliminar', () => {
      const actions = component['rowActions'](mockRow);

      expect(actions.some((action) => action.label === 'Eliminar')).toBe(true);
    });

    it('debería ejecutar onEliminarFinanza al seleccionar Eliminar', () => {
      mockConfirmDialogService.open.mockReturnValue(of(false));
      const eliminarSpy = vi.spyOn(component, 'onEliminarFinanza' as keyof ListadoFinanzas);

      const eliminarAction = component['rowActions'](mockRow).find(
        (action) => action.label === 'Eliminar',
      );

      eliminarAction?.command?.(mockRow);

      expect(eliminarSpy).toHaveBeenCalledWith(mockRow);
    });
  });

  describe('onEliminarFinanza', () => {
    it('debería abrir el diálogo y eliminar si se confirma', () => {
      mockConfirmDialogService.open.mockReturnValue(of(true));

      component['onEliminarFinanza'](mockRow);

      expect(mockConfirmDialogService.open).toHaveBeenCalledWith({
        title: 'Eliminar movimiento',
        message: '¿Confirma que quiere eliminar este movimiento financiero?',
        confirmButtonLabel: 'Eliminar',
        cancelButtonLabel: 'Cancelar',
        variant: 'danger',
      });

      expect(mockFinanzaService.eliminar).toHaveBeenCalledWith(mockRow.id);
    });

    it('no debería eliminar si se cancela el diálogo', () => {
      mockConfirmDialogService.open.mockReturnValue(of(false));

      component['onEliminarFinanza'](mockRow);

      expect(mockFinanzaService.eliminar).not.toHaveBeenCalled();
    });

    it('debería recargar la tabla ante éxito', () => {
      mockConfirmDialogService.open.mockReturnValue(of(true));
      mockFinanzaService.eliminar.mockReturnValue(of(void 0));
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      component['onEliminarFinanza'](mockRow);

      expect(updateFiltersSpy).toHaveBeenCalled();
    });

    it('debería manejar el error si falla eliminar', () => {
      const error = new Error('Error al eliminar');

      mockConfirmDialogService.open.mockReturnValue(of(true));
      mockFinanzaService.eliminar.mockReturnValue(throwError(() => error));

      component['onEliminarFinanza'](mockRow);

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    });

    it('un bloqueo (pago de cuota) debe delegar en ErrorHandler sin abrir la advertencia ni recargar', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          codigo: 'ELIMINACION_PAGO_CUOTA_NO_PERMITIDA',
          descripcion: 'Los pagos de cuota no pueden eliminarse.',
        },
      });

      mockConfirmDialogService.open.mockReturnValue(of(true));
      mockFinanzaService.eliminar.mockReturnValue(throwError(() => error));
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      component['onEliminarFinanza'](mockRow);

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(component['reservaCerradaAdvertencia']()).toBeNull();
      expect(updateFiltersSpy).not.toHaveBeenCalled();
    });

    it('CONFIRMACION_ELIMINACION_REQUERIDA abre la advertencia sin delegar en ErrorHandler', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: {
          codigo: 'CONFIRMACION_ELIMINACION_REQUERIDA',
          descripcion: 'La reserva ya está finalizada.',
        },
      });

      mockConfirmDialogService.open.mockReturnValue(of(true));
      mockFinanzaService.eliminar.mockReturnValue(throwError(() => error));

      component['onEliminarFinanza'](mockRow);

      expect(mockErrorHandler.handle).not.toHaveBeenCalled();
      expect(component['reservaCerradaAdvertencia']()).toEqual({
        finanza: mockRow,
        message: 'El movimiento corresponde a una reserva ya finalizada o cancelada.',
      });
    });
  });

  describe('advertencia de reserva cerrada', () => {
    beforeEach(() => {
      component['reservaCerradaAdvertencia'].set({
        finanza: mockRow,
        message: 'La reserva ya está finalizada.',
      });
    });

    it('onEliminarDeTodasFormas reintenta con confirmar=true y recarga', () => {
      mockFinanzaService.eliminar.mockReturnValue(of(void 0));
      const updateFiltersSpy = vi.spyOn(component['tableState'], 'updateFilters');

      component['onEliminarDeTodasFormas']();

      expect(mockFinanzaService.eliminar).toHaveBeenCalledWith(mockRow.id, true);
      expect(component['reservaCerradaAdvertencia']()).toBeNull();
      expect(updateFiltersSpy).toHaveBeenCalled();
    });

    it('onEliminarDeTodasFormas maneja el error y cierra la advertencia', () => {
      const error = new Error('Error al eliminar');
      mockFinanzaService.eliminar.mockReturnValue(throwError(() => error));

      component['onEliminarDeTodasFormas']();

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(component['reservaCerradaAdvertencia']()).toBeNull();
    });

    it('onRegistrarEgresoAsociado navega a /finanzas/nuevo sin eliminar', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component['onRegistrarEgresoAsociado']();

      expect(navigateSpy).toHaveBeenCalledWith(['/finanzas', 'nuevo']);
      expect(mockFinanzaService.eliminar).not.toHaveBeenCalled();
      expect(component['reservaCerradaAdvertencia']()).toBeNull();
    });

    it('onCancelarAdvertencia cierra la advertencia sin efectos', () => {
      component['onCancelarAdvertencia']();

      expect(component['reservaCerradaAdvertencia']()).toBeNull();
      expect(mockFinanzaService.eliminar).not.toHaveBeenCalled();
    });

    it('no dispara un segundo DELETE mientras el primero está en vuelo', () => {
      const pendiente = new Subject<void>();
      mockFinanzaService.eliminar.mockReturnValue(pendiente.asObservable());

      component['onEliminarDeTodasFormas']();
      component['onEliminarDeTodasFormas']();

      expect(mockFinanzaService.eliminar).toHaveBeenCalledTimes(1);
      expect(component['advertenciaProcesando']()).toBe(true);
    });

    it('mientras procesa, cancelar y registrar egreso no tienen efecto', () => {
      const pendiente = new Subject<void>();
      mockFinanzaService.eliminar.mockReturnValue(pendiente.asObservable());
      const navigateSpy = vi.spyOn(router, 'navigate');

      component['onEliminarDeTodasFormas']();
      component['onCancelarAdvertencia']();
      component['onRegistrarEgresoAsociado']();

      expect(component['reservaCerradaAdvertencia']()).not.toBeNull();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  it('onFilterChange debería actualizar filtros', () => {
    const tableState = component['tableState'];
    const updateFiltersSpy = vi.spyOn(tableState, 'updateFilters');

    component['onFilterChange']({ concepto: 'Servicio' });

    expect(updateFiltersSpy).toHaveBeenCalledWith({ concepto: 'Servicio' });
  });

  it('onDescargarListado llama a exportar con los filtros activos', () => {
    component['tableState'].updateFilters({ concepto: 'PAGO_RESERVA' });
    component['tableState'].setResult(10);
    component['tableState'].setLoading(false);

    component['onDescargarListado']();

    expect(mockFinanzaService.exportar).toHaveBeenCalledWith({ concepto: 'PAGO_RESERVA' });
  });

  describe('carga de factura', () => {
    it('onCargarFacturaClick debería abrir el input de archivo', () => {
      const input = document.createElement('input');
      const clickSpy = vi.spyOn(input, 'click');

      component['onCargarFacturaClick'](input);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('onFacturaSeleccionada debería analizar factura y navegar con datos mapeados', () => {
      const file = new File(['contenido'], 'factura.pdf', { type: 'application/pdf' });

      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [file],
      });

      const event = {
        target: input,
      } as unknown as Event;

      const documento = {
        id: 1,
        nombreArchivo: 'factura.pdf',
        tipoContenido: 'application/pdf',
        modeloUsado: 'prebuilt-invoice',
        fechaAnalisis: '2026-06-25T10:00:00Z',
        resultadoJson: JSON.stringify({ content: 'UTE\nIMPORTE TOTAL\n$3.203,00' }),
      };

      mockDocumentIntelligenceService.analizarFactura.mockReturnValue(of(documento));

      const navigateSpy = vi.spyOn(router, 'navigate');

      component['onFacturaSeleccionada'](event);

      expect(mockDocumentIntelligenceService.analizarFactura).toHaveBeenCalledWith(file);
      expect(navigateSpy).toHaveBeenCalledWith(['/finanzas', 'nuevo'], {
        state: {
          facturaAnalizada: expect.objectContaining({
            tipoMovimiento: TipoMovimiento.Egreso,
            concepto: Concepto.Ute,
          }),
        },
      });
    });

    it('onFacturaSeleccionada no debería hacer nada si no hay archivo', () => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [],
      });

      const event = {
        target: input,
      } as unknown as Event;

      component['onFacturaSeleccionada'](event);

      expect(mockDocumentIntelligenceService.analizarFactura).not.toHaveBeenCalled();
    });

    it('onFacturaSeleccionada debería manejar formato no permitido', () => {
      const file = new File(['contenido'], 'factura.txt', { type: 'text/plain' });

      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [file],
      });

      const event = {
        target: input,
      } as unknown as Event;

      component['onFacturaSeleccionada'](event);

      expect(mockDocumentIntelligenceService.analizarFactura).not.toHaveBeenCalled();
      expect(mockErrorHandler.handle).toHaveBeenCalled();
    });

    it('onFacturaSeleccionada debería manejar archivo mayor a 4 MB', () => {
      const file = new File(['contenido'], 'factura.pdf', { type: 'application/pdf' });

      Object.defineProperty(file, 'size', {
        value: 5 * 1024 * 1024,
      });

      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [file],
      });

      const event = {
        target: input,
      } as unknown as Event;

      component['onFacturaSeleccionada'](event);

      expect(mockDocumentIntelligenceService.analizarFactura).not.toHaveBeenCalled();
      expect(mockErrorHandler.handle).toHaveBeenCalled();
    });

    it('onFacturaSeleccionada debería manejar error del servicio', () => {
      const error = new Error('Error Azure');
      const file = new File(['contenido'], 'factura.pdf', { type: 'application/pdf' });

      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [file],
      });

      const event = {
        target: input,
      } as unknown as Event;

      mockDocumentIntelligenceService.analizarFactura.mockReturnValue(throwError(() => error));

      component['onFacturaSeleccionada'](event);

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    });

    it('onCancelarAnalisisFactura debería cancelar la suscripción activa', () => {
      const unsubscribeSpy = vi.fn();

      component['facturaSubscription'] = {
        unsubscribe: unsubscribeSpy,
      } as unknown as Subscription;

      component['analizandoFactura'].set(true);

      component['onCancelarAnalisisFactura']();

      expect(unsubscribeSpy).toHaveBeenCalled();
      expect(component['analizandoFactura']()).toBe(false);
      expect(component['facturaSubscription']).toBeUndefined();
    });
  });
});
