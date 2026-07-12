import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EstadoReserva } from '../../../shared';
import { ReservaRow, TipoReserva } from '../models/reserva.model';
import { mapReservaListadoRow } from './reserva-listado.mapper';

describe('mapReservaListadoRow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-10T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function crearReserva(cambios: Partial<ReservaRow> = {}): ReservaRow {
    return {
      id: 1,
      clienteId: 10,
      nombreCliente: 'Juan Pérez',
      servicioId: 3,
      servicioNombre: 'Camping',
      fechaEntrada: '2026-07-11T00:00:00',
      fechaSalida: '2026-07-12T00:00:00',
      estadoReserva: EstadoReserva.Confirmada,
      requiereDocumentacion: false,
      tieneDocumentacion: false,
      requiereSena: false,
      tipoReserva: TipoReserva.Comun,
      montoImpago: 0,
      fechaLimitePago: null,
      pago: false,
      pendienteDocumentacion: false,
      ...cambios,
    };
  }

  it('debería requerir atención cuando la reserva está pendiente y quedan menos de 24 horas', () => {
    const reserva = crearReserva({
      estadoReserva: EstadoReserva.Pendiente,
      fechaEntrada: '2026-07-11T00:00:00',
    });

    const resultado = mapReservaListadoRow(reserva);

    expect(resultado.requiereAtencion).toBe(true);
  });

  it('no debería requerir atención cuando la reserva está pendiente pero faltan más de 24 horas', () => {
    const reserva = crearReserva({
      estadoReserva: EstadoReserva.Pendiente,
      fechaEntrada: '2026-07-12T13:00:00',
    });

    const resultado = mapReservaListadoRow(reserva);

    expect(resultado.requiereAtencion).toBe(false);
  });

  it('no debería requerir atención cuando la reserva está confirmada aunque queden menos de 24 horas', () => {
    const reserva = crearReserva({
      estadoReserva: EstadoReserva.Confirmada,
      fechaEntrada: '2026-07-11T00:00:00',
    });

    const resultado = mapReservaListadoRow(reserva);

    expect(resultado.requiereAtencion).toBe(false);
  });

  it('no debería requerir atención cuando la reserva está finalizada', () => {
    const reserva = crearReserva({
      estadoReserva: EstadoReserva.Finalizada,
      fechaEntrada: '2026-07-11T00:00:00',
    });

    const resultado = mapReservaListadoRow(reserva);

    expect(resultado.requiereAtencion).toBe(false);
  });

  it('debería conservar todos los datos originales de la reserva', () => {
    const reserva = crearReserva({
      nombreCliente: 'Ana Gómez',
      estadoReserva: EstadoReserva.Pendiente,
      fechaEntrada: '2026-07-11T00:00:00',
    });

    const resultado = mapReservaListadoRow(reserva);

    expect(resultado).toEqual({
      ...reserva,
      requiereAtencion: true,
    });
  });
});
