import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Procedencia } from '../../../shared';
import {
  Concepto,
  FinanzaDetalleRespuestaDto,
  FormaPago,
  TipoMovimiento,
} from '../models/finanza.model';
import { FinanzaService } from '../services/finanza.service';
import { ModificarFinanza } from './modificar-finanza';

const mockFinanza: FinanzaDetalleRespuestaDto = {
  id: 1,
  codigo: 'FIN-2026-001',
  procedencia: Procedencia.Camping,
  servicio: 'Alquiler de parrillero',
  fecha: '2026-03-14',
  importe: 15000,
  formaPago: FormaPago.Transferencia,
  notas: 'Pago de alquiler de parrillero',
  tipoMovimiento: TipoMovimiento.Ingreso,
  createdAt: '2026-03-15T14:30:00Z',
  createdBy: 'Juan Pérez',
  updatedAt: '2026-03-15T14:30:00Z',
  updatedBy: 'Juan Pérez',
};

describe('ModificarFinanza', () => {
  let component: ModificarFinanza;
  let fixture: ComponentFixture<ModificarFinanza>;
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let updateSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    getByIdSpy = vi.fn().mockReturnValue(of(mockFinanza));
    updateSpy = vi.fn().mockReturnValue(of(void 0));
    navigateSpy = vi.fn();
    mockErrorHandler = {
      handle: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ModificarFinanza],
      providers: [
        {
          provide: FinanzaService,
          useValue: {
            getById: getByIdSpy,
            update: updateSpy,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: navigateSpy,
          },
        },
        {
          provide: ErrorHandlerService,
          useValue: mockErrorHandler,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarFinanza);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar la finanza por id', () => {
    expect(getByIdSpy).toHaveBeenCalledWith(1);
  });

  it('debería cargar los datos en el formulario', () => {
    expect(component['form'].get('procedencia')?.value).toBe(Procedencia.Camping);
    expect(component['form'].get('fecha')?.value).toBe('2026-03-14');
    expect(component['form'].get('importe')?.value).toBe(15000);
    expect(component['form'].get('formaPago')?.value).toBe(FormaPago.Transferencia);
    expect(component['form'].get('notas')?.value).toBe('Pago de alquiler de parrillero');
  });

  it('debería mantener bloqueado el tipo de movimiento', () => {
    expect(component['form'].get('tipoMovimiento')?.disabled).toBe(true);
  });

  it('onCancelar debería navegar a /finanzas', () => {
    component['onCancelar']();

    expect(navigateSpy).toHaveBeenCalledWith(['/finanzas']);
  });

  it('onInfoChange debería actualizar los campos editables', () => {
    component['onInfoChange']({
      procedencia: Procedencia.Sede,
      concepto: Concepto.Barraca,
      fecha: '2026-03-20',
      importe: '20000',
      formaPago: FormaPago.Efectivo,
    });

    expect(component['form'].get('procedencia')?.value).toBe(Procedencia.Sede);
    expect(component['form'].get('concepto')?.value).toBe(Concepto.Barraca);
    expect(component['form'].get('fecha')?.value).toBe('2026-03-20');
    expect(component['form'].get('importe')?.value).toBe(20000);
    expect(component['form'].get('formaPago')?.value).toBe(FormaPago.Efectivo);
  });

  it('onAdicionalChange debería actualizar notas', () => {
    component['onAdicionalChange']({
      notas: 'Nueva observación',
    });

    expect(component['form'].get('notas')?.value).toBe('Nueva observación');
  });

  it('onConfirmar debería llamar a update y navegar a /finanzas', () => {
    component['form'].patchValue({
      procedencia: Procedencia.Sede,
      concepto: Concepto.Barraca,
      fecha: '2026-03-20',
      importe: 20000,
      formaPago: FormaPago.Efectivo,
      notas: 'Nueva observación',
    });

    component['onConfirmar']();

    expect(updateSpy).toHaveBeenCalledWith(1, {
      procedencia: Procedencia.Sede,
      concepto: Concepto.Barraca,
      fecha: '2026-03-20',
      importe: 20000,
      formaPago: FormaPago.Efectivo,
      notas: 'Nueva observación',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/finanzas']);
  });

  it('onConfirmar no debería actualizar si el formulario es inválido', () => {
    component['form'].patchValue({
      fecha: null,
    });

    component['onConfirmar']();

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('debería manejar error si falla la carga inicial', async () => {
    const error = new Error('Error al cargar finanza');

    getByIdSpy.mockReturnValue(throwError(() => error));

    fixture = TestBed.createComponent(ModificarFinanza);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    expect(navigateSpy).toHaveBeenCalledWith(['/finanzas']);
  });

  it('debería manejar error si falla update', () => {
    const error = new Error('Error al modificar finanza');

    updateSpy.mockReturnValue(throwError(() => error));

    component['form'].patchValue({
      procedencia: Procedencia.Sede,
      concepto: Concepto.Barraca,
      fecha: '2026-03-20',
      importe: 20000,
      formaPago: FormaPago.Efectivo,
      notas: 'Nueva observación',
    });

    component['onConfirmar']();

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    expect(component['loading']()).toBe(false);
  });
});
