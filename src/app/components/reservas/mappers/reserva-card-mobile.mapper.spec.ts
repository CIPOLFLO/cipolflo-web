import { describe, expect, it } from 'vitest';

import { EstadoReserva } from '../../../shared';
import { ReservaRow, TipoReserva } from '../models/reserva.model';
import { mapReservaCardMobileRow } from './reserva-card-mobile.mapper';

describe('mapReservaCardMobileRow', () => {
  function crearReserva(estadoReserva: EstadoReserva): ReservaRow {
    return {
      id: 1,
      clienteId: 10,
      nombreCliente: 'Juan Pérez',
      servicioId: 3,
      servicioNombre: 'Hospedaje en camping',
      fechaEntrada: '2026-08-10',
      fechaSalida: '2026-08-15',
      estadoReserva,
      requiereDocumentacion: false,
      tieneDocumentacion: false,
      requiereSena: false,
      tipoReserva: TipoReserva.Comun,
      montoImpago: 1500,
      fechaLimitePago: null,
      pago: false,
      pendienteDocumentacion: false,
    };
  }

  it.each([
    [EstadoReserva.Confirmada, 'Confirmada', 'tag--green'],
    [EstadoReserva.EnCurso, 'En curso', 'tag--blue'],
    [EstadoReserva.Finalizada, 'Finalizada', 'tag--purple'],
    [EstadoReserva.Cancelada, 'Cancelada', 'tag--gray'],
    [EstadoReserva.Pendiente, 'Pendiente', 'tag--yellow'],
  ])('debería mapear %s con su etiqueta y color', (estadoReserva, label, colorClass) => {
    const resultado = mapReservaCardMobileRow(crearReserva(estadoReserva));

    expect(resultado.estadoTag).toEqual({
      label,
      colorClass,
    });
  });

  it('debería preparar los campos que muestra la card', () => {
    const resultado = mapReservaCardMobileRow(crearReserva(EstadoReserva.Confirmada));

    expect(resultado.cliente).toBe('Juan Pérez');
    expect(resultado.servicio).toBe('Hospedaje en camping');
    expect(resultado.fechaEntradaFormateada).toBe('10/08/2026');
    expect(resultado.fechaSalidaFormateada).toBe('15/08/2026');
    expect(resultado.montoImpago).toBe(1500);
  });

  it('debería conservar los datos originales de la reserva', () => {
    const reserva = crearReserva(EstadoReserva.Pendiente);

    const resultado = mapReservaCardMobileRow(reserva);

    expect(resultado).toMatchObject(reserva);
  });
});
