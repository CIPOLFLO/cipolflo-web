import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError, firstValueFrom } from 'rxjs';
import { Concepto } from '../models/finanza.model';
import { ConfirmDialogService } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzaService } from '../services/finanza.service';
import { ListadoFinanzas } from './listado-finanzas';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';

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
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
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

    it('debería manejar el error si falla eliminar', () => {
      const error = new Error('Error al eliminar');

      mockConfirmDialogService.open.mockReturnValue(of(true));
      mockFinanzaService.eliminar.mockReturnValue(throwError(() => error));

      component['onEliminarFinanza'](mockRow);

      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    });
  });

  it('onFilterChange debería actualizar filtros', () => {
    const tableState = component['tableState'];
    const updateFiltersSpy = vi.spyOn(tableState, 'updateFilters');

    component['onFilterChange']({ concepto: 'Servicio' });

    expect(updateFiltersSpy).toHaveBeenCalledWith({ concepto: 'Servicio' });
  });
});
