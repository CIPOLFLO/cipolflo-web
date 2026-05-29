import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ClientesService } from './cliente.service';
import { environment } from '@env/environment';
import { ClienteDetalleRespuestaDto, EstadoSocio, MetodoCobro, TipoCliente } from '../models/cliente.model';

const BASE = `${environment.apiUrl}/clientes`;

const mockDetalle: ClienteDetalleRespuestaDto = {
  id: 1,
  nombre: 'Lucía Rodríguez',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: '123',
  cedula: '5.191.926-8',
  email: 'lucia.rodriguez@example.com',
  estado: EstadoSocio.Activo,
  fechaNacimiento: '29/06/1999',
  telefono: '099985648',
  metodoCobro: MetodoCobro.Cobradora,
  pais: 'Uruguay',
  departamento: 'Flores',
  ciudad: 'Trinidad',
  direccion: 'Luis Alberto de Herrera 123',
  observaciones: 'Socia nueva',
  createdAt: '2026-03-15T14:30:00Z',
  createdBy: 'Pedro Aguirre',
  updatedAt: '2026-03-18T09:15:00Z',
  updatedBy: 'Mariana Silva',
};

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

  describe('getById', () => {
    it('hace GET a /clientes/:id y retorna el detalle del cliente', () => {
      service.getById(1).subscribe((result) => {
        expect(result).toEqual(mockDetalle);
      });
      const req = httpMock.expectOne(`${BASE}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDetalle);
    });

    it('propaga error 404 cuando el id no existe', () => {
      let errorStatus = 0;
      service.getById(9999).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/9999`)
        .flush(
          { codigo: 'NOT_FOUND', descripcion: 'Cliente no encontrado' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });

    it('propaga error 401 cuando el usuario no está autenticado', () => {
      let errorStatus = 0;
      service.getById(1).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/1`)
        .flush(
          { codigo: 'UNAUTHORIZED', descripcion: 'Token inválido' },
          { status: 401, statusText: 'Unauthorized' },
        );
      expect(errorStatus).toBe(401);
    });

    it('propaga error 400 cuando el id es inválido (-1)', () => {
      let errorStatus = 0;
      service.getById(-1).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/-1`)
        .flush(
          { codigo: 'BAD_REQUEST', descripcion: 'Parámetro inválido' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });
});
