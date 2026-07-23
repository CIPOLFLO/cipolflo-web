import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AntiguedadReservasService } from './antiguedad-reservas.service';
import { environment } from '@env/environment';
import { AntiguedadReservasResponseDto } from '../models/ajuste.model';

const mockResponse: AntiguedadReservasResponseDto = {
  anios: 2,
  updatedAt: '2026-01-10T09:00:00Z',
  updatedBy: 'admin@cipolflo.com',
};

describe('AntiguedadReservasService', () => {
  let service: AntiguedadReservasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AntiguedadReservasService],
    });
    service = TestBed.inject(AntiguedadReservasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('obtener', () => {
    it('hace GET a /ajustes/antiguedad-reservas', () => {
      service.obtener().subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/ajustes/antiguedad-reservas`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('retorna la antigüedad vigente', () => {
      let resultado: AntiguedadReservasResponseDto | undefined;
      service.obtener().subscribe((r) => (resultado = r));
      httpMock.expectOne(`${environment.apiUrl}/ajustes/antiguedad-reservas`).flush(mockResponse);
      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('actualizar', () => {
    it('hace PUT a /ajustes/antiguedad-reservas con el DTO', () => {
      service.actualizar({ anios: 5 }).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/ajustes/antiguedad-reservas`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ anios: 5 });
      req.flush({ ...mockResponse, anios: 5 });
    });

    it('retorna la antigüedad actualizada', () => {
      let resultado: AntiguedadReservasResponseDto | undefined;
      service.actualizar({ anios: 5 }).subscribe((r) => (resultado = r));
      httpMock
        .expectOne(`${environment.apiUrl}/ajustes/antiguedad-reservas`)
        .flush({ ...mockResponse, anios: 5 });
      expect(resultado?.anios).toBe(5);
    });

    it('propaga error 400 cuando los años son inválidos', () => {
      let errorStatus = 0;
      service.actualizar({ anios: -1 }).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/ajustes/antiguedad-reservas`)
        .flush(
          { codigo: 'SOLICITUD_INVALIDA', descripcion: 'Los años deben ser un entero positivo' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });
});
