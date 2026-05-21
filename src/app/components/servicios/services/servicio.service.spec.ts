import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServicioService } from './servicio.service';
import { environment } from '@env/environment';
import { EstadoServicio } from '../models/servicio.model';

const emptyPage = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

describe('ServicioService', () => {
  let service: ServicioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ServicioService],
    });
    service = TestBed.inject(ServicioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAll hace GET a /servicios con page y size', () => {
    service.getAll({ page: 0, size: 10, filters: {} }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/servicios`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(emptyPage);
  });

  it('getAll incluye los filtros activos en los query params', () => {
    service
      .getAll({
        page: 0,
        size: 10,
        filters: { nombre: 'Cabaña', estado: EstadoServicio.Habilitado },
      })
      .subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/servicios`);
    expect(req.request.params.get('nombre')).toBe('Cabaña');
    expect(req.request.params.get('estado')).toBe(EstadoServicio.Habilitado);
    req.flush(emptyPage);
  });
});
