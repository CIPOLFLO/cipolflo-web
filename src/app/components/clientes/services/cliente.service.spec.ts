import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ClientesService } from './cliente.service';
import { environment } from '@env/environment';

const BASE = `${environment.apiUrl}/clientes`;

const emptyPage = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

describe('ClientesService', () => {
  let service: ClientesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ClientesService],
    });
    service = TestBed.inject(ClientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll realiza GET a /clientes con page y size', () => {
    service.getAll({ page: 0, size: 10, filters: {} }).subscribe();

    const req = httpMock.expectOne((r) => r.url === BASE && r.method === 'GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(emptyPage);
  });

  it('getAll envía filtros como query params', () => {
    service
      .getAll({ page: 0, size: 10, filters: { nombre: 'Juan', estado: 'ACTIVO' } })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('nombre')).toBe('Juan');
    expect(req.request.params.get('estado')).toBe('ACTIVO');
    req.flush(emptyPage);
  });

  it('getAll omite filtros null', () => {
    service.getAll({ page: 0, size: 10, filters: { nombre: null } }).subscribe();

    const req = httpMock.expectOne((r) => r.url === BASE);
    expect(req.request.params.has('nombre')).toBe(false);
    req.flush(emptyPage);
  });

  it('getById realiza GET a /clientes/:id', () => {
    service.getById(7).subscribe();

    const req = httpMock.expectOne(`${BASE}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getById retorna la respuesta del servidor', () => {
    const mockDetalle = { id: 7, nombre: 'Lucía Rodríguez' };
    let result: unknown;

    service.getById(7).subscribe((r) => (result = r));

    httpMock.expectOne(`${BASE}/7`).flush(mockDetalle);
    expect(result).toEqual(mockDetalle);
  });
});
