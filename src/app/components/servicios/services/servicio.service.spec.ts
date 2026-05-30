import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServicioService } from './servicio.service';
import { environment } from '@env/environment';
import {
  EstadoServicio,
  HabilitacionServicioDto,
  ReservaProximaDto,
  ServicioActualizarDto,
  ServicioCrearDto,
  ServicioDetalleRespuestaDto,
} from '../models/servicio.model';
import { EstadoReserva } from '../../../shared';

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

  describe('update', () => {
    const mockActualizarDto: ServicioActualizarDto = {
      nombre: 'Cabaña Actualizada',
      procedencia: 'CAMPING',
      estado: EstadoServicio.Habilitado,
      precioParticular: 1500,
      precioSocio: 1000,
      modalidadPrecio: 'POR_DIA',
      cantidad: null,
      capacidad: null,
    };

    const mockRespuesta = {
      id: 1,
      nombre: 'Cabaña Actualizada',
      procedencia: 'CAMPING',
      precioParticular: 1500,
      precioSocio: 1000,
      modalidadPrecio: 'POR_DIA',
      estado: EstadoServicio.Habilitado,
    };

    it('hace PUT a /servicios/{id}', () => {
      service.update(1, mockActualizarDto).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/servicios/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockRespuesta);
    });

    it('el body del request contiene los campos del DTO', () => {
      service.update(1, mockActualizarDto).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/servicios/1`);
      expect(req.request.body).toEqual(mockActualizarDto);
      req.flush(mockRespuesta);
    });

    it('retorna el servicio actualizado', () => {
      let resultado: typeof mockRespuesta | undefined;
      service.update(1, mockActualizarDto).subscribe((r) => (resultado = r));
      httpMock.expectOne(`${environment.apiUrl}/servicios/1`).flush(mockRespuesta);
      expect(resultado).toEqual(mockRespuesta);
    });

    it('propaga error 404 cuando el id no existe', () => {
      let errorStatus = 0;
      service.update(9999, mockActualizarDto).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/servicios/9999`)
        .flush(
          { codigo: 'NOT_FOUND', descripcion: 'Servicio no encontrado' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });
  });

  describe('getReservasProximas', () => {
    const mockReservas: ReservaProximaDto[] = [
      {
        id: 12,
        clienteId: 5,
        fechaEntrada: '2026-06-01T14:00:00Z',
        fechaSalida: '2026-06-03T12:00:00Z',
        pago: true,
        estado: EstadoReserva.Confirmada,
      },
      {
        id: 45,
        clienteId: 8,
        fechaEntrada: '2026-06-24T14:00:00Z',
        fechaSalida: '2026-06-27T12:00:00Z',
        pago: false,
        estado: EstadoReserva.Pendiente,
      },
    ];

    it('hace GET a /servicios/{id}/reservas-proximas', () => {
      service.getReservasProximas(1).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/servicios/1/reservas-proximas`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReservas);
    });

    it('retorna la lista de reservas próximas', () => {
      let resultado: ReservaProximaDto[] | undefined;
      service.getReservasProximas(1).subscribe((r) => (resultado = r));
      httpMock.expectOne(`${environment.apiUrl}/servicios/1/reservas-proximas`).flush(mockReservas);
      expect(resultado).toEqual(mockReservas);
    });

    it('retorna array vacío cuando no hay reservas próximas', () => {
      let resultado: ReservaProximaDto[] | undefined;
      service.getReservasProximas(1).subscribe((r) => (resultado = r));
      httpMock.expectOne(`${environment.apiUrl}/servicios/1/reservas-proximas`).flush([]);
      expect(resultado).toEqual([]);
    });

    it('propaga error 404 cuando el servicio no existe', () => {
      let errorStatus = 0;
      service.getReservasProximas(9999).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/servicios/9999/reservas-proximas`)
        .flush(
          { codigo: 'NOT_FOUND', descripcion: 'Servicio no encontrado' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });
  });

  describe('actualizarHabilitacion', () => {
    const urlHabilitacion = (id: number) => `${environment.apiUrl}/servicios/${id}/habilitacion`;

    it('hace PATCH a /servicios/{id}/habilitacion', () => {
      service.actualizarHabilitacion(1, { habilitado: true }).subscribe();
      const req = httpMock.expectOne(urlHabilitacion(1));
      expect(req.request.method).toBe('PATCH');
      req.flush(mockDetalle);
    });

    it('habilitar: envía habilitado=true sin reservas', () => {
      const dto: HabilitacionServicioDto = { habilitado: true };
      service.actualizarHabilitacion(1, dto).subscribe();
      const req = httpMock.expectOne(urlHabilitacion(1));
      expect(req.request.body).toEqual(dto);
      req.flush(mockDetalle);
    });

    it('deshabilitar sin cancelar reservas: envía habilitado=false y reservasACancelar vacío', () => {
      const dto: HabilitacionServicioDto = { habilitado: false, reservasACancelar: [] };
      service.actualizarHabilitacion(1, dto).subscribe();
      const req = httpMock.expectOne(urlHabilitacion(1));
      expect(req.request.body).toEqual(dto);
      req.flush({ ...mockDetalle, estado: EstadoServicio.Deshabilitado });
    });

    it('deshabilitar y cancelar reservas sin devolución: envía ids y confirmarDevolucion=false', () => {
      const dto: HabilitacionServicioDto = {
        habilitado: false,
        reservasACancelar: [12, 45],
        confirmarDevolucion: false,
      };
      service.actualizarHabilitacion(1, dto).subscribe();
      const req = httpMock.expectOne(urlHabilitacion(1));
      expect(req.request.body).toEqual(dto);
      req.flush({ ...mockDetalle, estado: EstadoServicio.Deshabilitado });
    });

    it('deshabilitar y cancelar con devolución: envía confirmarDevolucion=true', () => {
      const dto: HabilitacionServicioDto = {
        habilitado: false,
        reservasACancelar: [12],
        confirmarDevolucion: true,
      };
      service.actualizarHabilitacion(1, dto).subscribe();
      const req = httpMock.expectOne(urlHabilitacion(1));
      expect(req.request.body).toEqual(dto);
      req.flush({ ...mockDetalle, estado: EstadoServicio.Deshabilitado });
    });

    it('retorna el servicio con el estado actualizado', () => {
      const servicioDeshabilitado = { ...mockDetalle, estado: EstadoServicio.Deshabilitado };
      let resultado: ServicioDetalleRespuestaDto | undefined;
      service
        .actualizarHabilitacion(1, { habilitado: false, reservasACancelar: [] })
        .subscribe((r) => (resultado = r));
      httpMock.expectOne(urlHabilitacion(1)).flush(servicioDeshabilitado);
      expect(resultado?.estado).toBe(EstadoServicio.Deshabilitado);
    });

    it('propaga error 404 cuando el servicio no existe', () => {
      let errorStatus = 0;
      service
        .actualizarHabilitacion(9999, { habilitado: false })
        .subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(urlHabilitacion(9999))
        .flush(
          { codigo: 'NOT_FOUND', descripcion: 'Servicio no encontrado' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });

    it('propaga error 409 cuando hay conflicto de negocio', () => {
      let errorStatus = 0;
      service
        .actualizarHabilitacion(1, { habilitado: false })
        .subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(urlHabilitacion(1))
        .flush(
          { codigo: 'CONFLICT', descripcion: 'El servicio tiene reservas activas sin confirmar' },
          { status: 409, statusText: 'Conflict' },
        );
      expect(errorStatus).toBe(409);
    });
  });
});
