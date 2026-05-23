import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServicioService } from './servicio.service';
import { environment } from '@env/environment';
import {
  EstadoServicio,
  ServicioCrearDto,
  ServicioDetalleRespuestaDto,
} from '../models/servicio.model';

const emptyPage = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

const mockDetalle: ServicioDetalleRespuestaDto = {
  id: 1,
  nombre: 'Cabaña 1',
  procedencia: 'CAMPING',
  precioParticular: 1200,
  precioSocio: 800,
  modalidadPrecio: 'POR_DIA',
  estado: EstadoServicio.Habilitado,
  capacidad: null,
  cantidad: null,
  createdAt: '2026-01-15T10:30:00Z',
  updatedAt: '2026-01-15T10:30:00Z',
  createdBy: 'María González',
  updatedBy: 'María González',
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

  describe('getById', () => {
    it('hace GET a /servicios/{id} y retorna el detalle del servicio', () => {
      service.getById(1).subscribe((result) => {
        expect(result).toEqual(mockDetalle);
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/servicios/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDetalle);
    });

    it('propaga error 401 cuando el usuario no está autenticado', () => {
      let errorStatus = 0;
      service.getById(1).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/servicios/1`)
        .flush(
          { codigo: 'UNAUTHORIZED', descripcion: 'Token inválido' },
          { status: 401, statusText: 'Unauthorized' },
        );
      expect(errorStatus).toBe(401);
    });

    it('propaga error 404 cuando el id no existe', () => {
      let errorStatus = 0;
      service.getById(9999).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/servicios/9999`)
        .flush(
          { codigo: 'NOT_FOUND', descripcion: 'Servicio no encontrado' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });

    it('propaga error 400 cuando el id es inválido (-1)', () => {
      let errorStatus = 0;
      service.getById(-1).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/servicios/-1`)
        .flush(
          { codigo: 'BAD_REQUEST', descripcion: 'Parámetro inválido' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });

  describe('create', () => {
    const mockDto: ServicioCrearDto = {
      nombre: 'Cabaña 1',
      procedencia: 'CAMPING',
      precioParticular: 1200,
      precioSocio: 800,
      modalidadPrecio: 'POR_DIA',
      cantidad: null,
      capacidad: null,
    };

    const mockRespuesta = {
      id: 1,
      nombre: 'Cabaña 1',
      procedencia: 'CAMPING',
      precioParticular: 1200,
      precioSocio: 800,
      modalidadPrecio: 'POR_DIA',
      estado: EstadoServicio.Habilitado,
    };

    it('hace POST a /servicios con el DTO', () => {
      service.create(mockDto).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/servicios`);
      expect(req.request.method).toBe('POST');
      req.flush(mockRespuesta);
    });

    it('el body del request contiene los campos del DTO', () => {
      service.create(mockDto).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/servicios`);
      expect(req.request.body).toEqual(mockDto);
      req.flush(mockRespuesta);
    });

    it('retorna el servicio creado', () => {
      let resultado: typeof mockRespuesta | undefined;
      service.create(mockDto).subscribe((r) => (resultado = r));
      httpMock.expectOne(`${environment.apiUrl}/servicios`).flush(mockRespuesta);
      expect(resultado).toEqual(mockRespuesta);
    });

    it('propaga error 400 cuando el DTO es inválido', () => {
      let errorStatus = 0;
      service.create(mockDto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/servicios`)
        .flush(
          { codigo: 'BAD_REQUEST', descripcion: 'Datos inválidos' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });
});
