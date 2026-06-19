import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ReservasService } from './reservas.service';
import { Procedencia } from '../../../shared';
import { TipoReserva, type ReservaCreacionRequestDto } from '../models/reserva.model';
import { EstadoReserva } from '../../../shared';

const dto: ReservaCreacionRequestDto = {
  tipoReserva: TipoReserva.Comun,
  procedencia: Procedencia.Sede,
  servicioId: 1,
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-03',
  cantidadTotal: 2,
  cantidadMenores: null,
  cantidad: null,
  estado: EstadoReserva.Pendiente,
  pago: false,
  clienteId: 1,
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ReservasService],
    });
    service = TestBed.inject(ReservasService);
  });

  it('getDatos devuelve la página de reservas (mock)', () => {
    let total = 0;
    service
      .getDatos({ page: 0, size: 10, filters: {} })
      .subscribe((p) => (total = p.totalElements));
    expect(total).toBeGreaterThan(0);
  });

  it('crear devuelve un id (mock, sin HTTP mientras no exista POST /reservas)', () => {
    let id = 0;
    service.crear(dto).subscribe((r) => (id = r.id));
    expect(id).toBeGreaterThan(0);
  });
});
