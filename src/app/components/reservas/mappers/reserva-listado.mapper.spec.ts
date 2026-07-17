import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EstadoReserva } from '../../../shared';
import { PlazoConfirmacion, ReservaRow } from '../models/reserva.model';
import { mapReservaListadoRow } from './reserva-listado.mapper';

const baseRow: ReservaRow = {
  id: 1,
  clienteId: 10,
  nombreCliente: 'Juan Pérez',
  servicioId: 3,
  servicioNombre: 'Hospedaje en camping',
  fechaEntrada: '2026-08-10',
  fechaSalida: '2026-08-15',
  estadoReserva: EstadoReserva.Pendiente,
  requiereDocumentacion: false,
  tieneDocumentacion: false,
  requiereSena: true,
  tipoReserva: 'COMUN' as ReservaRow['tipoReserva'],
  montoImpago: 5000,
  plazoConfirmacion: null,
  fechaLimiteConfirmacion: null,
  fechaInicioAlerta: null,
  pago: false,
  pendienteDocumentacion: false,
};

describe('mapReservaListadoRow', () => {
  const ahora = new Date('2026-07-12T12:00:00');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(ahora);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('requiereAtencion es false si no hay plazo de confirmación (fechas null)', () => {
    const row = mapReservaListadoRow(baseRow);
    expect(row.requiereAtencion).toBe(false);
    expect(row.mensajeAtencion).toBe('');
  });

  it('requiereAtencion es false si la reserva no está PENDIENTE, aunque esté dentro de la ventana', () => {
    const row: ReservaRow = {
      ...baseRow,
      estadoReserva: EstadoReserva.Confirmada,
      plazoConfirmacion: PlazoConfirmacion.VeinticuatroHoras,
      fechaInicioAlerta: '2026-07-11T00:00:00',
      fechaLimiteConfirmacion: '2026-07-13T00:00:00',
    };
    expect(mapReservaListadoRow(row).requiereAtencion).toBe(false);
  });

  it('requiereAtencion es false si plazoConfirmacion es null aunque las fechas estén dentro de la ventana', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: null,
      fechaInicioAlerta: '2026-07-11T00:00:00',
      fechaLimiteConfirmacion: '2026-07-13T00:00:00',
      requiereSena: true,
      pago: false,
    };
    expect(mapReservaListadoRow(row).requiereAtencion).toBe(false);
  });

  it('requiereAtencion es true dentro de la ventana de 24 horas con seña pendiente', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: PlazoConfirmacion.VeinticuatroHoras,
      fechaInicioAlerta: '2026-07-11T00:00:00', // 24 hs antes del límite
      fechaLimiteConfirmacion: '2026-07-13T00:00:00', // aún no llegó (ahora = 12-jul)
      requiereSena: true,
      pago: false,
    };
    expect(mapReservaListadoRow(row).requiereAtencion).toBe(true);
  });

  it('requiereAtencion es false antes de que empiece la ventana de alerta (24 hs)', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: PlazoConfirmacion.VeinticuatroHoras,
      fechaInicioAlerta: '2026-07-13T00:00:00', // todavía no llegó
      fechaLimiteConfirmacion: '2026-07-14T00:00:00',
      requiereSena: true,
      pago: false,
    };
    expect(mapReservaListadoRow(row).requiereAtencion).toBe(false);
  });

  it('requiereAtencion es false una vez pasada la fecha límite de confirmación (24 hs)', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: PlazoConfirmacion.VeinticuatroHoras,
      fechaInicioAlerta: '2026-07-09T00:00:00',
      fechaLimiteConfirmacion: '2026-07-10T00:00:00', // ya pasó (ahora = 12-jul)
      requiereSena: true,
      pago: false,
    };
    expect(mapReservaListadoRow(row).requiereAtencion).toBe(false);
  });

  it('requiereAtencion es true dentro de la ventana de 3 meses con documentación pendiente', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: PlazoConfirmacion.TresMeses,
      fechaInicioAlerta: '2026-07-01T00:00:00', // 7 días antes del límite
      fechaLimiteConfirmacion: '2026-08-07T00:00:00',
      requiereSena: false,
      requiereDocumentacion: true,
      tieneDocumentacion: false,
    };
    expect(mapReservaListadoRow(row).requiereAtencion).toBe(true);
  });

  it('requiereAtencion es false fuera de la ventana de 3 meses (todavía muy lejos)', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: PlazoConfirmacion.TresMeses,
      fechaInicioAlerta: '2026-10-01T00:00:00', // todavía no llegó
      fechaLimiteConfirmacion: '2026-10-08T00:00:00',
      requiereSena: false,
      requiereDocumentacion: true,
      tieneDocumentacion: false,
    };
    expect(mapReservaListadoRow(row).requiereAtencion).toBe(false);
  });

  it('requiereAtencion es false si ya está pagada y documentada, aunque esté dentro de la ventana', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: PlazoConfirmacion.VeinticuatroHoras,
      fechaInicioAlerta: '2026-07-11T00:00:00',
      fechaLimiteConfirmacion: '2026-07-13T00:00:00',
      requiereSena: true,
      pago: true,
      requiereDocumentacion: true,
      tieneDocumentacion: true,
    };
    expect(mapReservaListadoRow(row).requiereAtencion).toBe(false);
  });

  it('mensajeAtencion queda vacío cuando no requiere atención', () => {
    const row = mapReservaListadoRow(baseRow);
    expect(row.mensajeAtencion).toBe('');
  });

  it('mensajeAtencion incluye la fecha límite formateada para plazo de 24 horas', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: PlazoConfirmacion.VeinticuatroHoras,
      fechaInicioAlerta: '2026-07-11T00:00:00',
      fechaLimiteConfirmacion: '2026-07-13T00:00:00',
      requiereSena: true,
      pago: false,
    };
    const mensaje = mapReservaListadoRow(row).mensajeAtencion;
    expect(mensaje).toContain('Falta seña o documentación');
    expect(mensaje).toContain('24 hs antes del inicio');
  });

  it('mensajeAtencion usa el texto correspondiente al plazo de 3 meses', () => {
    const row: ReservaRow = {
      ...baseRow,
      plazoConfirmacion: PlazoConfirmacion.TresMeses,
      fechaInicioAlerta: '2026-07-01T00:00:00',
      fechaLimiteConfirmacion: '2026-08-07T00:00:00',
      requiereSena: true,
      pago: false,
    };
    const mensaje = mapReservaListadoRow(row).mensajeAtencion;
    expect(mensaje).toContain('Falta seña o documentación');
    expect(mensaje).not.toContain('24 hs antes del inicio');
  });
});
