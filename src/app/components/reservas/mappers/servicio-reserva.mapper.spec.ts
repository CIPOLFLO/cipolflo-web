import { describe, expect, it } from 'vitest';
import { PageResponse } from '../../../shared';
import { EstadoServicio, ServicioRespuestaDto } from '../../servicios/models/servicio.model';
import { mapServiciosReserva } from './servicio-reserva.mapper';

describe('mapServiciosReserva', () => {
  const servicio: ServicioRespuestaDto = {
    id: 2,
    nombre: 'Salón',
    procedencia: 'SEDE',
    estado: EstadoServicio.Habilitado,
    capacidad: 80,
    cantidad: null,
    costoPersonaExtra: null,
    tarifas: [],
  };

  const page = (content: ServicioRespuestaDto[]): PageResponse<ServicioRespuestaDto> => ({
    content,
    page: 0,
    size: 100,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
  });

  it('devuelve el contenido de la página', () => {
    expect(mapServiciosReserva(page([servicio]))).toEqual([servicio]);
  });

  it('devuelve un arreglo vacío cuando la página no tiene contenido', () => {
    expect(mapServiciosReserva(page([]))).toEqual([]);
  });
});
