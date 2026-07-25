import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AntiguedadReservasCard } from './antiguedad-reservas-card';
import { AntiguedadReservasService } from '../services/antiguedad-reservas.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AntiguedadReservasResponseDto } from '../models/ajuste.model';

describe('AntiguedadReservasCard', () => {
  let fixture: ComponentFixture<AntiguedadReservasCard>;
  let component: AntiguedadReservasCard;
  let mockService: {
    obtener: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
  };
  let mockErrorHandler: { handle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      obtener: vi
        .fn()
        .mockReturnValue(of({ anios: 5, updatedAt: '2026-01-01T00:00:00Z', updatedBy: 'admin' })),
      actualizar: vi
        .fn()
        .mockImplementation((dto: { anios: number }) =>
          of({ anios: dto.anios, updatedAt: '2026-01-02T00:00:00Z', updatedBy: 'admin' }),
        ),
    };
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AntiguedadReservasCard],
      providers: [
        { provide: AntiguedadReservasService, useValue: mockService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiguedadReservasCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('precarga la antigüedad vigente al iniciar', () => {
    expect(component['form'].value.valor).toBe('5');
  });

  it('el defaultValue del campo refleja la antigüedad cargada (lo que FormField realmente muestra)', () => {
    expect(component['fields']()[0].defaultValue).toBe('5');
  });

  it('marca error cuando el valor no es un entero positivo', () => {
    component['onValuesChange']({ valor: '0' });
    expect(component['errors']()['valor']).toBe(
      'La antigüedad debe ser un número entero mayor a 0.',
    );
  });

  it('marca error cuando el valor no es entero', () => {
    component['onValuesChange']({ valor: '2.5' });
    expect(component['errors']()['valor']).toBe(
      'La antigüedad debe ser un número entero mayor a 0.',
    );
  });

  it('onGuardar no llama al service si el form es inválido', () => {
    component['onValuesChange']({ valor: '-1' });
    component['onGuardar']();
    expect(mockService.actualizar).not.toHaveBeenCalled();
  });

  it('onGuardar llama a actualizar con el valor ingresado', () => {
    component['onValuesChange']({ valor: '10' });
    component['onGuardar']();
    expect(mockService.actualizar).toHaveBeenCalledWith({ anios: 10 });
  });

  it('muestra confirmación de guardado tras un guardar exitoso', () => {
    component['onValuesChange']({ valor: '10' });
    component['onGuardar']();
    expect(component['guardadoOk']()).toBe(true);
  });

  it('delega errores del backend en ErrorHandlerService', () => {
    mockService.actualizar.mockReturnValue(throwError(() => new Error('falló')));
    component['onValuesChange']({ valor: '10' });
    component['onGuardar']();
    expect(mockErrorHandler.handle).toHaveBeenCalled();
  });
});

describe('AntiguedadReservasCard - carga asíncrona (regresión: guardarDisabled no debe quedar congelado)', () => {
  it('guardarDisabled pasa de true a false cuando el valor llega después del render inicial', () => {
    const subject = new Subject<AntiguedadReservasResponseDto>();
    const asyncMockService = {
      obtener: vi.fn().mockReturnValue(subject.asObservable()),
      actualizar: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [AntiguedadReservasCard],
      providers: [
        { provide: AntiguedadReservasService, useValue: asyncMockService },
        { provide: ErrorHandlerService, useValue: { handle: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(AntiguedadReservasCard);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['guardarDisabled']()).toBe(true);

    subject.next({ anios: 5, updatedAt: '2026-01-01T00:00:00Z', updatedBy: 'admin' });
    fixture.detectChanges();

    expect(component['guardarDisabled']()).toBe(false);
  });
});
