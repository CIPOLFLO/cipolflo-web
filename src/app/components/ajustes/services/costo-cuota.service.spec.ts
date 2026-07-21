import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CostoCuotaService } from './costo-cuota.service';
import { environment } from '@env/environment';
import { CostoCuotaResponseDto } from '../models/ajuste.model';

const mockResponse: CostoCuotaResponseDto = {
  monto: 200,
  updatedAt: '2026-01-10T09:00:00Z',
  updatedBy: 'admin@cipolflo.com',
};

describe('CostoCuotaService', () => {
  let service: CostoCuotaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CostoCuotaService],
    });
    service = TestBed.inject(CostoCuotaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('obtener', () => {
    it('hace GET a /ajustes/costo-cuota', () => {
      service.obtener().subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/ajustes/costo-cuota`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('retorna el monto vigente', () => {
      let resultado: CostoCuotaResponseDto | undefined;
      service.obtener().subscribe((r) => (resultado = r));
      httpMock.expectOne(`${environment.apiUrl}/ajustes/costo-cuota`).flush(mockResponse);
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('actualizar', () => {
    it('hace PUT a /ajustes/costo-cuota con el DTO', () => {
      service.actualizar({ monto: 250 }).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/ajustes/costo-cuota`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ monto: 250 });
      req.flush({ ...mockResponse, monto: 250 });
    });

    it('retorna el monto actualizado', () => {
      let resultado: CostoCuotaResponseDto | undefined;
      service.actualizar({ monto: 250 }).subscribe((r) => (resultado = r));
      httpMock
        .expectOne(`${environment.apiUrl}/ajustes/costo-cuota`)
        .flush({ ...mockResponse, monto: 250 });
      expect(resultado?.monto).toBe(250);
    });

    it('propaga error 400 cuando el monto es inválido', () => {
      let errorStatus = 0;
      service.actualizar({ monto: -1 }).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/ajustes/costo-cuota`)
        .flush(
          { codigo: 'SOLICITUD_INVALIDA', descripcion: 'El monto debe ser mayor a 0' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });
});
