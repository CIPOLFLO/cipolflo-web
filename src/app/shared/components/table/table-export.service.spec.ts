import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TableExportService } from './table-export.service';
import { TableStateService } from './table-state.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

describe('TableExportService', () => {
  let service: TableExportService;
  let tableState: TableStateService;
  let mockErrorHandler: { handle: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockErrorHandler = { handle: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        TableExportService,
        TableStateService,
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    });

    service = TestBed.inject(TableExportService);
    tableState = TestBed.inject(TableStateService);
  });

  it('puedeExportar es false cuando no hay resultados', () => {
    tableState.setResult(0);

    expect(service.puedeExportar()).toBe(false);
  });

  it('puedeExportar es false cuando la tabla está cargando', () => {
    tableState.setResult(1);
    tableState.setLoading(true);

    expect(service.puedeExportar()).toBe(false);
  });

  it('puedeExportar es true cuando hay resultados y no está cargando ni exportando', () => {
    tableState.setResult(1);
    tableState.setLoading(false);

    expect(service.puedeExportar()).toBe(true);
  });

  it('exportar no hace nada si puedeExportar es false y no invoca la fuente', () => {
    tableState.setResult(0);
    const source = vi.fn(() => of(undefined));

    service.exportar(source);

    expect(source).not.toHaveBeenCalled();
    expect(service.exportando()).toBe(false);
  });

  it('exportar setea exportando en true mientras la descarga está en curso', () => {
    tableState.setResult(1);
    tableState.setLoading(false);
    const source = () => new Subject<void>();

    service.exportar(source);

    expect(service.exportando()).toBe(true);
  });

  it('una segunda llamada mientras hay una descarga en curso no invoca la fuente de nuevo', () => {
    tableState.setResult(1);
    tableState.setLoading(false);
    const source = vi.fn(() => new Subject<void>());

    service.exportar(source);
    service.exportar(source);

    expect(source).toHaveBeenCalledTimes(1);
  });

  it('exportar resetea exportando a false cuando la descarga finaliza', () => {
    tableState.setResult(1);
    tableState.setLoading(false);

    service.exportar(() => of(undefined));

    expect(service.exportando()).toBe(false);
  });

  it('exportar resetea exportando a false y notifica el error cuando la descarga falla', () => {
    tableState.setResult(1);
    tableState.setLoading(false);
    const error = new Error('fallo de descarga');

    service.exportar(() => throwError(() => error));

    expect(service.exportando()).toBe(false);
    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
  });
});
