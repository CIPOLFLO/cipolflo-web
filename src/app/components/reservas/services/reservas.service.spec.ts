import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of } from 'rxjs';
import { ReservasService } from './reservas.service';
import { BlobExportService } from '../../../core/services/blob-export.service';
import { EstadoReserva, Procedencia } from '../../../shared';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { TipoCliente } from '../../clientes/models/cliente.model';
import {
  TipoReserva,
  type CostoReservaRequestDto,
  type ReservaActualizacionRequestDto,
  type ReservaCreacionRequestDto,
  type ReservaDetalleRespuestaDto,
  type ReservaRespuestaDto,
  ReservaFinalizacionCheckResponseDto,
  ReservaFinalizacionRequestDto,
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
  montoImpago: 0,
  formaPago: FormaPago.Efectivo,
  pago: false,
  requiereDocumentacion: true,
  tieneDocumentacion: false,
  requiereSena: false,
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
  requiereDocumentacion: false,
  requiereSena: false,
};

describe('ReservasService', () => {
  let service: ReservasService;
  let httpTesting: HttpTestingController;
  let blobExportService: {
    export: ReturnType<typeof vi.fn>;
    download: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    blobExportService = {
      export: vi.fn().mockReturnValue(of(undefined)),
      download: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ReservasService,
        { provide: BlobExportService, useValue: blobExportService },
      ],
    });
    service = TestBed.inject(ReservasService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting?.verify();
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
      requiereDocumentacion: false,
      tieneDocumentacion: false,
      tipoReserva: TipoReserva.Comun,
      montoImpago: 5000,
      fechaLimitePago: null,
      pago: false,
      pendienteDocumentacion: false,
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

      const req = httpTesting.expectOne((r) => r.url.includes('reservas/42'));
      expect(req.request.method).toBe('GET');
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

  describe('update', () => {
    const dtoActualizacion: ReservaActualizacionRequestDto = {
      procedencia: Procedencia.Camping,
      servicioId: 3,
      fechaInicio: '2026-08-10',
      fechaFin: '2026-08-20',
      cantidadTotal: 4,
      cantidadMenores: 1,
      cantidad: null,
      notas: 'Fechas actualizadas',
    };

    it('llama a PUT /reservas/:id con el DTO de actualización', () => {
      service.update(42, dtoActualizacion).subscribe();
      const req = httpTesting.expectOne((r) => r.url.includes('reservas/42') && r.method === 'PUT');
      expect(req.request.body).toEqual(dtoActualizacion);
      req.flush(null);
    });
  });

  describe('calcularCosto', () => {
    const dto: CostoReservaRequestDto = {
      servicioId: 3,
      fechaInicio: '2026-08-10',
      fechaFin: '2026-08-15',
      horaInicio: null,
      horaFin: null,
      cantidadTotal: 4,
      cantidadMenores: 1,
      cantidad: null,
      tipoCliente: TipoCliente.Socio,
    };

    it('realiza POST a reservas/calcular-costo con el DTO completo', () => {
      service.calcularCosto(dto).subscribe();
      const req = httpTesting.expectOne(
        (r) => r.url.includes('reservas/calcular-costo') && r.method === 'POST',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ costoTotal: 12600 });
    });

    it('devuelve el costoTotal de la respuesta del servidor', () => {
      let resultado = 0;
      service.calcularCosto(dto).subscribe((r) => (resultado = r.costoTotal));
      const req = httpTesting.expectOne(
        (r) => r.url.includes('reservas/calcular-costo') && r.method === 'POST',
      );
      req.flush({ costoTotal: 9000 });
      expect(resultado).toBe(9000);
    });
  });

  describe('confirmarDocumentacion', () => {
    it('llama a PATCH /reservas/:id/documentacion', () => {
      service.confirmarDocumentacion(42).subscribe();

      const req = httpTesting.expectOne(
        (r) => r.url.includes('reservas/42/documentacion') && r.method === 'PATCH',
      );
      expect(req.request.method).toBe('PATCH');
      req.flush(null);
    });
  });

  describe('exportar', () => {
    it('delega en BlobExportService con el endpoint, los filtros y el filename correctos', () => {
      const filters = { estadoReserva: 'PENDIENTE' };

      service.exportar(filters).subscribe();

      expect(blobExportService.export).toHaveBeenCalledWith(
        'reservas/exportar',
        filters,
        'reservas.xlsx',
      );
    });
  });
  describe('verificarCancelacion', () => {
    it('llama a GET /reservas/:id/cancelacion y devuelve el check', () => {
      const mockResponse = {
        puedeCancelarseDirectamente: false,
        pagosAsociados: [
          {
            id: 1,
            fecha: '2026-07-01',
            importe: 5000,
            formaPago: FormaPago.Efectivo,
          },
        ],
        importeTotalPagos: 5000,
      };

      let resultado: typeof mockResponse | undefined;

      service.verificarCancelacion(42).subscribe((response) => {
        resultado = response;
      });

      const req = httpTesting.expectOne(
        (r) => r.url.includes('reservas/42/cancelacion') && r.method === 'GET',
      );

      req.flush(mockResponse);

      expect(resultado).toEqual(mockResponse);
    });
  });

  describe('cancelar', () => {
    it('llama a PATCH /reservas/:id/cancelacion con el DTO', () => {
      const dtoCancelacion = {
        generarDevolucion: true,
        formaPago: FormaPago.Efectivo,
      };

      service.cancelar(42, dtoCancelacion).subscribe();

      const req = httpTesting.expectOne(
        (r) => r.url.includes('reservas/42/cancelacion') && r.method === 'PATCH',
      );

      expect(req.request.body).toEqual(dtoCancelacion);

      req.flush(null);
    });

    it('permite cancelar sin formaPago cuando no se genera devolución', () => {
      const dtoCancelacion = {
        generarDevolucion: false,
      };

      service.cancelar(42, dtoCancelacion).subscribe();

      const req = httpTesting.expectOne(
        (r) => r.url.includes('reservas/42/cancelacion') && r.method === 'PATCH',
      );

      expect(req.request.body).toEqual(dtoCancelacion);

      req.flush(null);
    });
  });

  describe('descargarComprobante', () => {
    it('delega en BlobExportService con la ruta del comprobante y el filename de fallback', () => {
      service.descargarComprobante(42).subscribe();

      expect(blobExportService.download).toHaveBeenCalledWith(
        'reservas/42/comprobante',
        'comprobante-reserva-42.pdf',
      );
    });
  });
  describe('finalizacion', () => {
    it('verificarFinalizacion llama a GET /reservas/:id/finalizacion', () => {
      let resultado: ReservaFinalizacionCheckResponseDto | undefined;

      service.verificarFinalizacion(42).subscribe((r) => (resultado = r));

      const req = httpTesting.expectOne(
        (r) => r.url.includes('reservas/42/finalizacion') && r.method === 'GET',
      );

      req.flush({
        puedeFinalizarSinPago: false,
        montoImpago: 1200,
      });

      expect(resultado).toEqual({
        puedeFinalizarSinPago: false,
        montoImpago: 1200,
      });
    });

    it('finalizar llama a PATCH /reservas/:id/finalizacion con el DTO', () => {
      const dto: ReservaFinalizacionRequestDto = {
        completarPago: true,
        formaPago: FormaPago.Efectivo,
        notas: 'Pago al finalizar',
      };

      service.finalizar(42, dto).subscribe();

      const req = httpTesting.expectOne(
        (r) => r.url.includes('reservas/42/finalizacion') && r.method === 'PATCH',
      );

      expect(req.request.body).toEqual(dto);
      req.flush(null);
    });
  });
});
