import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Concepto } from '../models/finanza.model';
import { ConfirmDialogService } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzaService } from '../services/finanza.service';
import { ListadoFinanzas } from './listado-finanzas';

describe('ListadoFinanzas', () => {
  let component: ListadoFinanzas;
  let fixture: ComponentFixture<ListadoFinanzas>;
  let router: Router;

  let mockFinanzaService: {
    getAll: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
  };

  let mockConfirmDialogService: {
    open: ReturnType<typeof vi.fn>;
  };

  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
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
    };

    mockConfirmDialogService = {
      open: vi.fn(),
    };

    mockErrorHandler = {
      handle: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ListadoFinanzas],
      providers: [
        provideRouter([]),
        { provide: FinanzaService, useValue: mockFinanzaService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
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
  it('debería incluir la acción Ver detalle', () => {
    const row = {
      id: 1,
      concepto: Concepto.PagoReserva,
      fecha: '14/3/2026',
      importeSignado: 15000,
      descripcion: 'Pago de alquiler',
    };

    const actions = component['rowActions'](row);
    expect(actions.some((action) => action.label === 'Ver detalle')).toBe(true);
  });
  it('debería incluir la acción Eliminar', () => {
    const row = {
      id: 1,
      concepto: Concepto.PagoReserva,
      fecha: '14/3/2026',
      importeSignado: 15000,
      descripcion: 'Pago de alquiler',
    };

    const actions = component['rowActions'](row);

    expect(actions.some((action) => action.label === 'Eliminar')).toBe(true);
  });

  it('onEliminarFinanza debería abrir el diálogo y eliminar si se confirma', () => {
    const row = {
      id: 1,
      concepto: Concepto.PagoReserva,
      fecha: '14/3/2026',
      importeSignado: 15000,
      descripcion: 'Pago de alquiler',
    };

    mockConfirmDialogService.open.mockReturnValue(of(true));

    component['onEliminarFinanza'](row);

    expect(mockConfirmDialogService.open).toHaveBeenCalledWith({
      title: 'Eliminar movimiento',
      message: '¿Confirma que quiere eliminar este movimiento financiero?',
      confirmButtonLabel: 'Eliminar',
      cancelButtonLabel: 'Cancelar',
      variant: 'danger',
    });

    expect(mockFinanzaService.eliminar).toHaveBeenCalledWith(row.id);
  });

  it('onEliminarFinanza no debería eliminar si se cancela el diálogo', () => {
    const row = {
      id: 1,
      concepto: Concepto.PagoReserva,
      fecha: '14/3/2026',
      importeSignado: 15000,
      descripcion: 'Pago de alquiler',
    };

    mockConfirmDialogService.open.mockReturnValue(of(false));

    component['onEliminarFinanza'](row);

    expect(mockFinanzaService.eliminar).not.toHaveBeenCalled();
  });

  it('onEliminarFinanza debería manejar el error si falla eliminar', () => {
    const error = new Error('Error al eliminar');
    const row = {
      id: 1,
      concepto: Concepto.PagoReserva,
      fecha: '14/3/2026',
      importeSignado: 15000,
      descripcion: 'Pago de alquiler',
    };

    mockConfirmDialogService.open.mockReturnValue(of(true));
    mockFinanzaService.eliminar.mockReturnValue(throwError(() => error));

    component['onEliminarFinanza'](row);

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
  });
});
