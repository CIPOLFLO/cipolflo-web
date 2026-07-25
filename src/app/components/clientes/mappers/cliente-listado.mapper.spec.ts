import { describe, expect, it } from 'vitest';
import {
  ClienteRespuestaDto,
  EstadoSocio,
  TipoCliente,
  CategoriaSocio,
} from '../models/cliente.model';
import { mapClienteCardMobileRow, mapClienteListadoRow } from './cliente-listado.mapper';

const baseCliente: ClienteRespuestaDto = {
  id: 1,
  nombreCompleto: 'Juan Pérez',
  cedula: '12345678',
  rut: null,
  email: null,
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 5,
  estado: null,
  ultimaCuotaDto: null,
  categoriaSocio: CategoriaSocio.SocioComun,
  antiguedad: 5,
  fechaIngreso: '2020-01-01',
};

describe('mapClienteListadoRow', () => {
  it('usa la cédula como documento cuando no hay RUT (Socio/Particular)', () => {
    const row = mapClienteListadoRow(baseCliente);
    expect(row.documento).toBe('12345678');
  });

  it('usa el RUT como documento cuando el cliente es Empresa', () => {
    const empresa: ClienteRespuestaDto = {
      ...baseCliente,
      tipoCliente: TipoCliente.Empresa,
      cedula: null,
      rut: '210001230018',
    };
    const row = mapClienteListadoRow(empresa);
    expect(row.documento).toBe('210001230018');
  });

  it('conserva el resto de los campos del cliente', () => {
    const row = mapClienteListadoRow(baseCliente);
    expect(row).toMatchObject(baseCliente);
  });
});

describe('mapClienteCardMobileRow', () => {
  it('resuelve el documento igual que el listado de escritorio (RUT antes que cédula)', () => {
    const conAmbos: ClienteRespuestaDto = {
      ...baseCliente,
      cedula: '12345678',
      rut: '210001230018',
    };
    const row = mapClienteCardMobileRow(conAmbos);
    expect(row.documento).toBe('210001230018');
  });

  it.each([
    [TipoCliente.Socio, { label: 'Socio', colorClass: 'tag--blue', icon: 'pi pi-verified' }],
    [TipoCliente.Particular, { label: 'Particular', colorClass: 'tag--gray', icon: 'pi pi-user' }],
    [TipoCliente.Empresa, { label: 'Empresa', colorClass: 'tag--purple', icon: 'pi pi-building' }],
  ])('la primera tag es la del tipo %s', (tipoCliente, expected) => {
    expect(mapClienteCardMobileRow({ ...baseCliente, tipoCliente }).tags[0]).toEqual(expected);
  });

  it.each([
    [EstadoSocio.Activo, { label: 'Activo', colorClass: 'tag--green' }],
    [EstadoSocio.Inactivo, { label: 'Inactivo', colorClass: 'tag--yellow' }],
    [EstadoSocio.Baja, { label: 'De baja', colorClass: 'tag--gray' }],
  ])('agrega la tag de estado (color reutilizado del desktop) para %s', (estado, expected) => {
    const { tags } = mapClienteCardMobileRow({ ...baseCliente, estado });
    expect(tags).toHaveLength(3);
    expect(tags[1]).toEqual(expected);
  });

  it('solo incluye la tag de tipo cuando el cliente no tiene estado', () => {
    const { tags } = mapClienteCardMobileRow({
      ...baseCliente,
      estado: null,
      tipoCliente: TipoCliente.Particular,
    });
    expect(tags).toHaveLength(1);
    expect(tags[0].label).toBe('Particular');
  });

  it('conserva los campos del cliente', () => {
    expect(mapClienteCardMobileRow(baseCliente)).toMatchObject(baseCliente);
  });
});
