import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BaseHttpService } from './base-http.service';
import { environment } from '@env/environment';

class ConcreteHttpService extends BaseHttpService {
  override get<T>(path: string, params?: Record<string, unknown>) {
    return super.get<T>(path, params);
  }
  override post<T>(path: string, body: unknown) {
    return super.post<T>(path, body);
  }
  override put<T>(path: string, body: unknown) {
    return super.put<T>(path, body);
  }
  override delete<T>(path: string, params?: Record<string, unknown>) {
    return super.delete<T>(path, params);
  }
}

describe('BaseHttpService', () => {
  let service: ConcreteHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ConcreteHttpService],
    });
    service = TestBed.inject(ConcreteHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get', () => {
    it('sin params hace GET a la URL correcta sin query string', () => {
      service.get('recursos').subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/recursos`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toHaveLength(0);
      req.flush({});
    });

    it('con params serializa valores y filtra nulos/undefined', () => {
      service.get('recursos', { page: 0, size: 10, nombre: null, estado: undefined }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/recursos`);
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.has('nombre')).toBe(false);
      expect(req.request.params.has('estado')).toBe(false);
      req.flush({});
    });
  });

  describe('post', () => {
    it('hace POST a la URL correcta con el body', () => {
      const body = { nombre: 'Nuevo' };
      service.post('recursos', body).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/recursos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });
  });

  describe('put', () => {
    it('hace PUT a la URL correcta con el body', () => {
      const body = { nombre: 'Editado' };
      service.put('recursos/1', body).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/recursos/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });
  });

  describe('delete', () => {
    it('sin params hace DELETE a la URL correcta sin query string', () => {
      service.delete('recursos/1').subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/recursos/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.keys()).toHaveLength(0);
      req.flush({});
    });

    it('con params serializa el query string y filtra nulos/undefined', () => {
      service.delete('recursos/1', { confirmar: true, motivo: null }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/recursos/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.get('confirmar')).toBe('true');
      expect(req.request.params.has('motivo')).toBe(false);
      req.flush({});
    });
  });
});
