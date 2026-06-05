import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzaDetalleRespuestaDto, TipoMovimiento } from '../models/finanza.model';
import { FinanzaService } from '../services/finanza.service';
import { DetalleFinanza } from './detalle-finanza';
import { Procedencia } from '../../../shared';

const mockFinanza: FinanzaDetalleRespuestaDto = {
  id: 1,
  codigo: 'FIN-2026-001',
  procedencia: Procedencia.Camping,
  servicio: 'Alquiler de parrillero',
  fecha: '14/3/2026',
  importe: 15000,
  formaPago: 'Transferencia',
  notas: 'Pago de alquiler de parillero.',
  createdAt: '2026-03-15T14:30:00Z',
  createdBy: 'Juan Pérez',
  updatedAt: '2026-03-15T14:30:00Z',
  updatedBy: 'Juan Pérez',
  tipoMovimiento: TipoMovimiento.Ingreso,
};

describe('DetalleFinanza', () => {
  let fixture: ComponentFixture<DetalleFinanza>;
  let component: DetalleFinanza;
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    getByIdSpy = vi.fn().mockReturnValue(of(mockFinanza));
    navigateSpy = vi.fn();
    mockErrorHandler = {
      handle: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DetalleFinanza],
      providers: [
        { provide: FinanzaService, useValue: { getById: getByIdSpy } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) },
        },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleFinanza);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a getById con el id de la ruta', () => {
    expect(getByIdSpy).toHaveBeenCalledWith(1);
  });

  it('debería mostrar el título de la página', () => {
    expect(fixture.nativeElement.textContent).toContain('Detalle de Movimiento Financiero');
  });

  it('debería mostrar la procedencia', () => {
    expect(fixture.nativeElement.textContent).toContain('CAMPING');
  });

  it('debería mostrar la forma de pago', () => {
    expect(fixture.nativeElement.textContent).toContain('Transferencia');
  });

  it('debería mostrar las notas', () => {
    expect(fixture.nativeElement.textContent).toContain('Pago de alquiler de parillero.');
  });

  it('debería mostrar el importe con signo positivo cuando es ingreso', () => {
    expect(component['infoFields']().find((field) => field.key === 'importe')?.value).toBe(
      '+ $ 15.000,00',
    );
  });

  it('debería mostrar el importe con signo negativo cuando es egreso', async () => {
    getByIdSpy.mockReturnValue(
      of({
        ...mockFinanza,
        tipoMovimiento: TipoMovimiento.Egreso,
      }),
    );

    fixture = TestBed.createComponent(DetalleFinanza);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['infoFields']().find((field) => field.key === 'importe')?.value).toBe(
      '- $ 15.000,00',
    );
  });

  it('debería navegar al hacer click en editar', () => {
    component['onEditar']();

    expect(navigateSpy).toHaveBeenCalledWith(['/finanzas', '1']);
  });

  it('debería manejar error y navegar a /finanzas si falla la carga', async () => {
    const error = new Error('Error al cargar finanza');

    getByIdSpy.mockReturnValue(throwError(() => error));

    fixture = TestBed.createComponent(DetalleFinanza);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    expect(navigateSpy).toHaveBeenCalledWith(['/finanzas']);
  });
});
