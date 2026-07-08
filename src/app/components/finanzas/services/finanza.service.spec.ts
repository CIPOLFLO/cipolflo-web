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
import { BlobExportService } from '../../../core/services/blob-export.service';
import { of } from 'rxjs';

const PARAMS_BASE = { page: 0, size: 10, filters: {} };

describe('FinanzaService', () => {
  let service: FinanzaService;
  let httpMock: HttpTestingController;
  let blobExportService: { export: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    blobExportService = {
      export: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FinanzaService,
        { provide: BlobExportService, useValue: blobExportService },
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

      const req = httpMock.expectOne(
        (request) =>
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

      const req = httpMock.expectOne(
        (request) =>
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

    it('eliminar llama a DELETE /finanzas/{id} con confirmar=false por defecto', () => {
      service.eliminar(1).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.method === 'DELETE' &&
          request.url.includes('finanzas/1') &&
          request.params.get('confirmar') === 'false',
      );

      req.flush(null);
    });

    it('eliminar con confirmar=true llama a DELETE /finanzas/{id}?confirmar=true', () => {
      service.eliminar(1, true).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.method === 'DELETE' &&
          request.url.includes('finanzas/1') &&
          request.params.get('confirmar') === 'true',
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

  it('exportar delega en BlobExportService con el endpoint y filename correctos', () => {
    const filters = { concepto: 'PAGO_RESERVA' };

    service.exportar(filters).subscribe();

    expect(blobExportService.export).toHaveBeenCalledWith(
      'finanzas/export',
      filters,
      'finanzas.xlsx',
    );
  });
});
