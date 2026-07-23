import { describe, expect, it } from 'vitest';
import { Procedencia } from '../../../shared';
import { EstadoServicio, ServicioRespuestaDto } from '../models/servicio.model';
import { mapServicioCardMobileRow } from './servicio-card-mobile.mapper';

describe('mapServicioCardMobileRow', () => {
  function crearServicio(
    estado: EstadoServicio,
    modalidadPrecio = 'POR_DIA',
    procedencia: string = Procedencia.Camping,
  ): ServicioRespuestaDto {
    return {
      id: 1,
      nombre: 'Cabaña 1',
      procedencia,
      precioParticular: 1200,
      precioSocio: 800,
      modalidadPrecio,
      estado,
      capacidad: 4,
      cantidad: 1,
      costoPersonaExtra: null,
    };
  }

  it.each([
    [EstadoServicio.Habilitado, 'Habilitado', 'tag--green'],
    [EstadoServicio.Deshabilitado, 'Deshabilitado', 'tag--gray'],
  ])('debería mapear %s con su etiqueta y color', (estado, label, colorClass) => {
    const resultado = mapServicioCardMobileRow(crearServicio(estado));
    expect(resultado.estadoTag).toEqual({
      label,
      colorClass,
    });
  });

  it.each([
    ['POR_DIA', 'p/día'],
    ['POR_PERSONA', 'p/persona'],
    ['POR_DIA_POR_PERSONA', 'p/día p/persona'],
    ['POR_UNIDAD', 'p/unidad'],
    ['POR_HORA', 'p/hora'],
  ])('debería mapear la modalidad %s a la unidad %s', (modalidadPrecio, unidadLabel) => {
    const resultado = mapServicioCardMobileRow(
      crearServicio(EstadoServicio.Habilitado, modalidadPrecio),
    );
    expect(resultado.unidadLabel).toBe(unidadLabel);
  });

  it('debería usar el valor crudo como fallback si la modalidad no está mapeada', () => {
    const resultado = mapServicioCardMobileRow(
      crearServicio(EstadoServicio.Habilitado, 'MODALIDAD_INEXISTENTE'),
    );
    expect(resultado.unidadLabel).toBe('MODALIDAD_INEXISTENTE');
  });

  it.each([
    [Procedencia.Sede, 'Sede'],
    [Procedencia.Camping, 'Camping'],
    [Procedencia.Ambos, 'Ambos'],
  ])('debería mapear la procedencia %s a la etiqueta %s', (procedencia, procedenciaLabel) => {
    const resultado = mapServicioCardMobileRow(
      crearServicio(EstadoServicio.Habilitado, 'POR_DIA', procedencia),
    );
    expect(resultado.procedenciaLabel).toBe(procedenciaLabel);
  });

  it('debería usar el valor crudo como fallback si la procedencia no está mapeada', () => {
    const resultado = mapServicioCardMobileRow(
      crearServicio(EstadoServicio.Habilitado, 'POR_DIA', 'PROCEDENCIA_INEXISTENTE'),
    );
    expect(resultado.procedenciaLabel).toBe('PROCEDENCIA_INEXISTENTE');
  });

  it('debería conservar los datos originales del servicio', () => {
    const servicio = crearServicio(EstadoServicio.Habilitado);
    const resultado = mapServicioCardMobileRow(servicio);
    expect(resultado).toMatchObject(servicio);
  });
});
