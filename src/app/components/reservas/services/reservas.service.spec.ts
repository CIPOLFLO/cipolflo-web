import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ReservasService } from './reservas.service';
import { EstadoReserva, Procedencia } from '../../../shared';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { TipoCliente } from '../../clientes/models/cliente.model';
import {
  TipoReserva,
  type ReservaCreacionRequestDto,
  type ReservaDetalleRespuestaDto,
  type ReservaRespuestaDto,
} from '../models/reserva.model';

const mockDetalle: ReservaDetalleRespuestaDto = {
  id: 42,
  tipoReserva: TipoReserva.Comun,
  estado: EstadoReserva.Confirmada,
  procedencia: Procedencia.Camping,
  fechaEntrada: '2026-08-10',
  fechaSalida: '2026-08-15',
  horaInicio: null,
  horaFin: null,
  cantidadTotal: 4,
  cantidadMenores: 1,
  cantidad: null,
  importe: 4500,
  formaPago: FormaPago.Efectivo,
  pago: false,
  requiereDocumentacion: true,
  tieneDocumentacion: false,
  nombre: null,
  rut: null,
  notas: 'Llegan a las 14hs',
  cliente: {
    id: 10,
    nombre: 'Carlos Martínez Gómez',
    cedula: '12345678',
    telefono: '+598 99 123 456',
    email: 'carlos.martinez@email.com',
    tipoCliente: TipoCliente.Socio,
  },
  servicio: {
    id: 3,
    nombre: 'Hospedaje en camping',
    procedencia: Procedencia.Camping,
    modalidadPrecio: 'POR_DIA',
  },
  createdAt: '2026-03-15T14:30:00Z',
  updatedAt: '2026-03-15T14:30:00Z',
  createdBy: 'Juan Pérez',
  updatedBy: 'Juan Pérez',
};

const dto: ReservaCreacionRequestDto = {
  tipoReserva: TipoReserva.Comun,
  procedencia: Procedencia.Sede,
  servicioId: 1,
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-03',
  horaInicio: null,
  horaFin: null,
  cantidadTotal: 2,
  cantidadMenores: null,
  cantidad: null,
  clienteId: 1,
  crearCliente: false,
  tipoCliente: null,
  cedula: '12345672', // dígito verificador correcto: 2
  nombre: 'Juan',
  celular: '099111111',
  email: null,
  rut: null,
  notas: null,
};

describe('ReservasService', () => {
  let service: ReservasService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ReservasService],
    });
    service = TestBed.inject(ReservasService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  describe('getAll', () => {
    const mockRow: ReservaRespuestaDto = {
      id: 1,
      clienteId: 10,
      nombreCliente: 'Juan Pérez',
      servicioId: 3,
      servicioNombre: 'Hospedaje en camping',
      fechaEntrada: '2026-08-10',
      fechaSalida: '2026-08-15',
      estadoReserva: EstadoReserva.Confirmada,
    };

    const mockPage = {
      content: [mockRow],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    };

    it('llama a GET /reservas con los parámetros de paginación', () => {
      service.getAll({ page: 0, size: 10, filters: {} }).subscribe();

      const req = httpTesting.expectOne((r) => r.url.includes('reservas') && r.method === 'GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockPage);
    });

    it('devuelve el DTO con los nuevos campos del backend', () => {
      let resultado: ReservaRespuestaDto | undefined;
      service.getAll({ page: 0, size: 10, filters: {} }).subscribe((p) => {
        resultado = p.content[0];
      });

      const req = httpTesting.expectOne((r) => r.url.includes('reservas') && r.method === 'GET');
      req.flush(mockPage);

      expect(resultado?.nombreCliente).toBe('Juan Pérez');
      expect(resultado?.servicioNombre).toBe('Hospedaje en camping');
      expect(resultado?.fechaEntrada).toBe('2026-08-10');
      expect(resultado?.fechaSalida).toBe('2026-08-15');
      expect(resultado?.estadoReserva).toBe(EstadoReserva.Confirmada);
    });

    it('pasa los filtros activos como query params', () => {
      service.getAll({ page: 0, size: 10, filters: { estadoReserva: 'PENDIENTE' } }).subscribe();

      const req = httpTesting.expectOne((r) => r.url.includes('reservas') && r.method === 'GET');
      expect(req.request.params.get('estadoReserva')).toBe('PENDIENTE');
      req.flush(mockPage);
    });
  });

  it('crear llama a POST /reservas y devuelve el id', () => {
    let id = 0;
    service.crear(dto).subscribe((r) => (id = r.id));

    const req = httpTesting.expectOne((r) => r.url.includes('reservas') && r.method === 'POST');
    req.flush({ id: 42 });

    expect(id).toBe(42);
  });

  describe('getById', () => {
    it('llama a GET /reservas/:id', () => {
      service.getById(42).subscribe();

      const req = httpTesting.expectOne((r) => r.url.includes('reservas/42') && r.method === 'GET');
      req.flush(mockDetalle);
    });

    it('devuelve el DTO de detalle de la respuesta', () => {
      let resultado: ReservaDetalleRespuestaDto | undefined;
      service.getById(42).subscribe((r) => (resultado = r));

      const req = httpTesting.expectOne((r) => r.url.includes('reservas/42'));
      req.flush(mockDetalle);

      expect(resultado?.id).toBe(42);
      expect(resultado?.estado).toBe(EstadoReserva.Confirmada);
      expect(resultado?.cliente?.nombre).toBe('Carlos Martínez Gómez');
      expect(resultado?.servicio.nombre).toBe('Hospedaje en camping');
    });
  });

  describe('calcularCosto (mock dinámico)', () => {
    const base = {
      servicioId: 1,
      cantidadTotal: 2,
      cantidadMenores: null,
      cantidad: null,
    };

    it('devuelve un costo mayor cuando el rango de fechas es más largo', () => {
      let corto = 0;
      let largo = 0;
      service
        .calcularCosto({ ...base, fechaInicio: '2026-07-01', fechaFin: '2026-07-02' })
        .subscribe((r) => (corto = r.costo));
      service
        .calcularCosto({ ...base, fechaInicio: '2026-07-01', fechaFin: '2026-07-06' })
        .subscribe((r) => (largo = r.costo));
      expect(corto).toBeGreaterThan(0);
      expect(largo).toBeGreaterThan(corto);
    });

    it('devuelve un costo mayor cuando aumenta la cantidad', () => {
      let pocos = 0;
      let muchos = 0;
      service
        .calcularCosto({
          servicioId: 1,
          fechaInicio: '2026-07-01',
          fechaFin: '2026-07-03',
          cantidadTotal: null,
          cantidadMenores: null,
          cantidad: 1,
        })
        .subscribe((r) => (pocos = r.costo));
      service
        .calcularCosto({
          servicioId: 1,
          fechaInicio: '2026-07-01',
          fechaFin: '2026-07-03',
          cantidadTotal: null,
          cantidadMenores: null,
          cantidad: 5,
        })
        .subscribe((r) => (muchos = r.costo));
      expect(muchos).toBeGreaterThan(pocos);
    });
  });
});
