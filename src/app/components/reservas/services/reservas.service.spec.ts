import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ReservasService } from './reservas.service';
import { Procedencia } from '../../../shared';
import { TipoReserva, type ReservaCreacionRequestDto } from '../models/reserva.model';

const dto: ReservaCreacionRequestDto = {
  tipoReserva: TipoReserva.Comun,
  procedencia: Procedencia.Sede,
  servicioId: 1,
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-03',
  cantidadTotal: 2,
  cantidadMenores: null,
  cantidad: null,
  clienteId: 1,
  crearCliente: false,
  tipoCliente: null,
  cedula: '12345678',
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

  it('getDatos devuelve la página de reservas (mock)', () => {
    let total = 0;
    service
      .getDatos({ page: 0, size: 10, filters: {} })
      .subscribe((p) => (total = p.totalElements));
    expect(total).toBeGreaterThan(0);
  });

  it('crear llama a POST /reservas y devuelve el id', () => {
    let id = 0;
    service.crear(dto).subscribe((r) => (id = r.id));

    const req = httpTesting.expectOne((r) => r.url.includes('reservas') && r.method === 'POST');
    req.flush({ id: 42 });

    expect(id).toBe(42);
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
