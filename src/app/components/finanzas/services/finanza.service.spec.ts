import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Procedencia } from '../../../shared';
import {
  Concepto,
  FinanzaCrearDto,
  FormaPago,
  TipoMovimiento,
  FinanzaModificarDto,
} from '../models/finanza.model';
import { FinanzaService } from './finanza.service';
import { FileDownloadService } from '../../../core/services/file-download.service';
import { throwError } from 'rxjs';

const PARAMS_BASE = { page: 0, size: 10, filters: {} };

describe('FinanzaService', () => {
  let service: FinanzaService;
  let httpMock: HttpTestingController;
  let fileDownloadService: {
    download: ReturnType<typeof vi.fn>;
    parseBlobError: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    fileDownloadService = {
      download: vi.fn(),
      parseBlobError: vi.fn().mockImplementation((err) => throwError(() => err)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FinanzaService,
        { provide: FileDownloadService, useValue: fileDownloadService },
      ],
    });

    service = TestBed.inject(FinanzaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
  it('llama a GET /finanzas con paginación', () => {
    service.getAll(PARAMS_BASE).subscribe((result) => {
      expect(result.totalElements).toBe(1);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].tipoMovimiento).toBe(TipoMovimiento.Ingreso);
    });

    const req = httpMock.expectOne((request) =>
      request.method === 'GET' &&
      request.url.includes('finanzas') &&
      request.params.get('page') === '0' &&
      request.params.get('size') === '10',
    );

    req.flush({
      content: [
        {
          id: 1,
          concepto: Concepto.PagoReserva,
          fecha: '2026-06-18',
          importe: 5000,
          notas: null,
          tipoMovimiento: TipoMovimiento.Ingreso,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
  });

  it('refleja los parámetros de paginación recibidos', () => {
    service.getAll({ page: 2, size: 5, filters: {} }).subscribe((result) => {
      expect(result.page).toBe(2);
      expect(result.size).toBe(5);
    });

    const req = httpMock.expectOne((request) =>
      request.method === 'GET' &&
      request.url.includes('finanzas') &&
      request.params.get('page') === '2' &&
      request.params.get('size') === '5',
    );

    req.flush({
      content: [],
      page: 2,
      size: 5,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
  });
});

  describe('create', () => {
    it('llama a POST /finanzas', () => {
      const dto: FinanzaCrearDto = {
        tipoMovimiento: TipoMovimiento.Ingreso,
        procedencia: Procedencia.Sede,
        concepto: Concepto.PagoReserva,
        fecha: '2026-01-15',
        importe: 1000,
        formaPago: FormaPago.Efectivo,
        notas: null,
      };

      service.create(dto).subscribe((result) => {
        expect(result.id).toBe(1);
      });

      const req = httpMock.expectOne(
        (request) => request.method === 'POST' && request.url.includes('finanzas'),
      );

      expect(req.request.body).toEqual(dto);

      req.flush({
        id: 1,
        tipoMovimiento: TipoMovimiento.Ingreso,
        procedencia: Procedencia.Sede,
        concepto: Concepto.PagoReserva,
        fecha: '2026-01-15',
        importe: 1000,
        formaPago: FormaPago.Efectivo,
        notas: null,
      });
    });
  });

  describe('getById', () => {
    it('llama a GET /finanzas/{id}', () => {
      service.getById(42).subscribe((result) => {
        expect(result.id).toBe(42);
        expect(result.tipoMovimiento).toBe(TipoMovimiento.Ingreso);
      });

      const req = httpMock.expectOne(
        (request) => request.method === 'GET' && request.url.includes('finanzas/42'),
      );

      req.flush({
        id: 42,
        tipoMovimiento: TipoMovimiento.Ingreso,
        procedencia: Procedencia.Sede,
        concepto: Concepto.PagoReserva,
        fecha: '2026-01-15',
        importe: 1000,
        formaPago: FormaPago.Efectivo,
        notas: null,
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
        createdBy: 'admin',
        updatedBy: 'admin',
      });
    });

    it('eliminar llama a DELETE /finanzas/{id}', () => {
      service.eliminar(1).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(
        (request) => request.method === 'DELETE' && request.url.includes('finanzas/1'),
      );

      req.flush(null);
    });
  });

  describe('update', () => {
    it('llama a PUT /finanzas/{id}', () => {
      const dto: FinanzaModificarDto = {
        procedencia: Procedencia.Sede,
        concepto: Concepto.PagoReserva,
        fecha: '2026-01-15',
        importe: 1000,
        formaPago: FormaPago.Efectivo,
        notas: 'Modificado',
      };

      service.update(1, dto).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(
        (request) => request.method === 'PUT' && request.url.includes('finanzas/1'),
      );

      expect(req.request.body).toEqual(dto);

      req.flush(null);
    });
  });

  it('exportar debería hacer POST blob y disparar descarga', () => {
    service.exportar({ concepto: 'PAGO_RESERVA' }).subscribe();

    const req = httpMock.expectOne(
      (request) => request.method === 'POST' && request.url.includes('finanzas/export'),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('blob');
    expect(req.request.body).toEqual({ concepto: 'PAGO_RESERVA' });

    req.flush(new Blob(['excel']), {
      headers: { 'Content-Disposition': 'attachment; filename="finanzas.xlsx"' },
    });

    expect(fileDownloadService.download).toHaveBeenCalled();
  });
});
