import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CostoCuotaCard } from './costo-cuota-card';
import { CostoCuotaService } from '../services/costo-cuota.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CostoCuotaResponseDto } from '../models/ajuste.model';

describe('CostoCuotaCard', () => {
  let fixture: ComponentFixture<CostoCuotaCard>;
  let component: CostoCuotaCard;
  let mockService: {
    obtener: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
  };
  let mockErrorHandler: { handle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      obtener: vi
        .fn()
        .mockReturnValue(of({ monto: 100, updatedAt: '2026-01-01T00:00:00Z', updatedBy: 'admin' })),
      actualizar: vi
        .fn()
        .mockImplementation((dto: { monto: number }) =>
          of({ monto: dto.monto, updatedAt: '2026-01-02T00:00:00Z', updatedBy: 'admin' }),
        ),
    };
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CostoCuotaCard],
      providers: [
        { provide: CostoCuotaService, useValue: mockService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CostoCuotaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('precarga el monto vigente al iniciar', () => {
    expect(component['form'].value.valor).toBe('100');
  });

  it('el defaultValue del campo refleja el monto cargado (lo que FormField realmente muestra)', () => {
    expect(component['fields']()[0].defaultValue).toBe('100');
  });

  it('guardarDisabled es false con un monto precargado válido', () => {
    expect(component['guardarDisabled']()).toBe(false);
  });

  it('marca error cuando el monto es 0 o negativo', () => {
    component['onValuesChange']({ valor: '0' });
    expect(component['errors']()['valor']).toBe('El costo debe ser mayor a 0.');
  });

  it('marca error cuando el monto está vacío y se envía', () => {
    component['onValuesChange']({ valor: '' });
    component['onGuardar']();
    expect(component['errors']()['valor']).toBe('El costo de cuota es obligatorio.');
  });

  it('onGuardar no llama al service si el form es inválido', () => {
    component['onValuesChange']({ valor: '-5' });
    component['onGuardar']();
    expect(mockService.actualizar).not.toHaveBeenCalled();
  });

  it('onGuardar llama a actualizar con el monto ingresado', () => {
    component['onValuesChange']({ valor: '250' });
    component['onGuardar']();
    expect(mockService.actualizar).toHaveBeenCalledWith({ monto: 250 });
  });

  it('muestra confirmación de guardado tras un guardar exitoso', () => {
    component['onValuesChange']({ valor: '250' });
    component['onGuardar']();
    expect(component['guardadoOk']()).toBe(true);
  });

  it('oculta la confirmación de guardado al volver a editar', () => {
    component['onValuesChange']({ valor: '250' });
    component['onGuardar']();
    component['onValuesChange']({ valor: '260' });
    expect(component['guardadoOk']()).toBe(false);
  });

  it('delega errores del backend en ErrorHandlerService', () => {
    mockService.actualizar.mockReturnValue(throwError(() => new Error('falló')));
    component['onValuesChange']({ valor: '250' });
    component['onGuardar']();
    expect(mockErrorHandler.handle).toHaveBeenCalled();
  });
});

describe('CostoCuotaCard - carga asíncrona (regresión: guardarDisabled no debe quedar congelado)', () => {
  it('guardarDisabled pasa de true a false cuando el valor llega después del render inicial', () => {
    const subject = new Subject<CostoCuotaResponseDto>();
    const asyncMockService = {
      obtener: vi.fn().mockReturnValue(subject.asObservable()),
      actualizar: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [CostoCuotaCard],
      providers: [
        { provide: CostoCuotaService, useValue: asyncMockService },
        { provide: ErrorHandlerService, useValue: { handle: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(CostoCuotaCard);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Antes de que llegue la respuesta: form vacío e inválido, botón deshabilitado.
    expect(component['guardarDisabled']()).toBe(true);

    subject.next({ monto: 100, updatedAt: '2026-01-01T00:00:00Z', updatedBy: 'admin' });
    fixture.detectChanges();

    // El signal debe recomputarse solo (sin acciones adicionales del usuario).
    expect(component['guardarDisabled']()).toBe(false);
  });
});
