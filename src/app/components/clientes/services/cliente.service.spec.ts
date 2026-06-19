import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ClientesService } from './cliente.service';
import { environment } from '@env/environment';
import {
  ClienteDetalleRespuestaDto,
  EstadoSocio,
  MetodoCobro,
  ModificacionParticularRequestDto,
  ModificacionSocioRequestDto,
  RegistroSocioRequestDto,
  TipoCliente,
} from '../models/cliente.model';

const BASE = `${environment.apiUrl}/clientes`;

const mockDetalle: ClienteDetalleRespuestaDto = {
  id: 1,
  nombre: 'Lucía Rodríguez',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 123,
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
  ultimaCuotaDto: null,
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

  it('getAll envía sortField y sortOrder en mayúsculas cuando se proporcionan', () => {
    service
      .getAll({ page: 0, size: 10, filters: {}, sortField: 'nombreCompleto', sortOrder: 'asc' })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('sortField')).toBe('nombreCompleto');
    expect(req.request.params.get('sortOrder')).toBe('ASC');
    req.flush(emptyPage);
  });

  it('getAll envía sortField solo cuando sortOrder no se proporciona', () => {
    service.getAll({ page: 0, size: 10, filters: {}, sortField: 'cedula' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === BASE);
    expect(req.request.params.get('sortField')).toBe('cedula');
    expect(req.request.params.has('sortOrder')).toBe(false);
    req.flush(emptyPage);
  });

  it('getAll omite sortField y sortOrder cuando sortField no se proporciona', () => {
    service.getAll({ page: 0, size: 10, filters: {}, sortOrder: 'asc' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === BASE);
    expect(req.request.params.has('sortField')).toBe(false);
    expect(req.request.params.has('sortOrder')).toBe(false);
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

  describe('modificarParticular', () => {
    const dto: ModificacionParticularRequestDto = {
      nombreCompleto: 'Laura Fernández',
      telefono: '099222222',
      mail: 'laura@mail.com',
      notas: null,
    };

    it('realiza PUT a /clientes/particulares/:id y retorna el detalle', () => {
      service.modificarParticular(2, dto).subscribe((result) => {
        expect(result).toEqual(mockDetalle);
      });
      const req = httpMock.expectOne(`${BASE}/particulares/2`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockDetalle);
    });

    it('propaga error 404 cuando el id no corresponde a un Particular', () => {
      let errorStatus = 0;
      service.modificarParticular(1, dto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/particulares/1`)
        .flush(
          { codigo: 'CLIENTE_NO_ENCONTRADO', descripcion: 'No es un particular' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });

    it('propaga error 400 cuando el id es inválido', () => {
      let errorStatus = 0;
      service.modificarParticular(-1, dto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/particulares/-1`)
        .flush(
          { codigo: 'ID_INVALIDO', descripcion: 'El id no es un número positivo' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });

  describe('modificarSocio', () => {
    const dto: ModificacionSocioRequestDto = {
      cedula: '5.191.926-8',
      nombreCompleto: 'Lucía Rodríguez',
      telefono: '099985648',
      mail: 'lucia@mail.com',
      notas: null,
      fechaNacimiento: '1999-06-29',
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      direccion: 'Luis Alberto de Herrera 123',
      metodoCobro: MetodoCobro.Cobradora,
    };

    it('realiza PUT a /clientes/socios/:id y retorna el detalle', () => {
      service.modificarSocio(1, dto).subscribe((result) => {
        expect(result).toEqual(mockDetalle);
      });
      const req = httpMock.expectOne(`${BASE}/socios/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockDetalle);
    });

    it('propaga error 404 cuando el id no corresponde a un Socio', () => {
      let errorStatus = 0;
      service.modificarSocio(2, dto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/socios/2`)
        .flush(
          { codigo: 'CLIENTE_NO_ENCONTRADO', descripcion: 'No es un socio' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });

    it('propaga error 400 cuando el id es inválido', () => {
      let errorStatus = 0;
      service.modificarSocio(-1, dto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/socios/-1`)
        .flush(
          { codigo: 'ID_INVALIDO', descripcion: 'El id no es un número positivo' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });

  describe('registrarSocio', () => {
    const dto: RegistroSocioRequestDto = {
      cedula: '5.191.926-8',
      nombreCompleto: 'Lucía Rodríguez',
      fechaNacimiento: '1999-06-29',
      telefono: '099985648',
      email: 'lucia.rodriguez@example.com',
      metodoCobro: MetodoCobro.Cobradora,
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      direccion: 'Luis Alberto de Herrera 123',
      observaciones: null,
    };

    it('realiza POST a /clientes/socios y retorna el detalle del socio creado', () => {
      service.registrarSocio(dto).subscribe((result) => {
        expect(result).toEqual(mockDetalle);
      });
      const req = httpMock.expectOne(`${BASE}/socios`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockDetalle, { status: 201, statusText: 'Created' });
    });

    it('propaga error 400 cuando la cédula ya está registrada', () => {
      let errorStatus = 0;
      service.registrarSocio(dto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/socios`)
        .flush(
          { codigo: 'CEDULA_YA_REGISTRADA', descripcion: 'Ya existe un cliente con esa cédula' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });

    it('propaga error 400 cuando el email ya está registrado', () => {
      let errorStatus = 0;
      service.registrarSocio(dto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/socios`)
        .flush(
          { codigo: 'EMAIL_DUPLICADO', descripcion: 'Ya existe un cliente con ese email' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });

    it('propaga error 400 cuando faltan campos obligatorios', () => {
      let errorStatus = 0;
      service.registrarSocio(dto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/socios`)
        .flush(
          { codigo: 'SOLICITUD_INVALIDA', descripcion: 'Campo obligatorio faltante' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });

  describe('darDeBaja', () => {
    it('realiza PATCH a /clientes/socios/:id/baja (204 No Content)', () => {
      service.darDeBaja(1).subscribe((response) => {
        expect(response).toBeNull();
      });
      const req = httpMock.expectOne(`${BASE}/socios/1/baja`);
      expect(req.request.method).toBe('PATCH');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('propaga error 404 cuando el socio no existe', () => {
      let errorStatus = 0;
      service.darDeBaja(9999).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/socios/9999/baja`)
        .flush(
          { codigo: 'SOCIO_NO_ENCONTRADO', descripcion: 'No existe un socio con ese id' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });

    it('propaga error 400 cuando el id es inválido', () => {
      let errorStatus = 0;
      service.darDeBaja(-1).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${BASE}/socios/-1/baja`)
        .flush(
          { codigo: 'ID_INVALIDO', descripcion: 'El id no es un número positivo' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(errorStatus).toBe(400);
    });
  });
});
