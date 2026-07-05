import { describe, expect, it } from 'vitest';
import { ClienteRespuestaDto, TipoCliente } from '../models/cliente.model';
import { mapClienteListadoRow } from './cliente-listado.mapper';

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
