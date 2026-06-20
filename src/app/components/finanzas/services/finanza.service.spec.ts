import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Procedencia } from '../../../shared';
import { Concepto, FinanzaCrearDto, FormaPago, TipoMovimiento } from '../models/finanza.model';
import { FinanzaService } from './finanza.service';

const PARAMS_BASE = { page: 0, size: 10, filters: {} };

describe('FinanzaService', () => {
  let service: FinanzaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), FinanzaService],
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
    it('retorna una página vacía porque el listado aún no está conectado al backend', async () => {
      service.getAll(PARAMS_BASE).subscribe((result) => {
        expect(result.totalElements).toBe(0);
        expect(result.content).toHaveLength(0);
      });
    });

    it('refleja los parámetros de paginación recibidos', async () => {
      service.getAll({ page: 2, size: 5, filters: {} }).subscribe((result) => {
        expect(result.page).toBe(2);
        expect(result.size).toBe(5);
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
});
