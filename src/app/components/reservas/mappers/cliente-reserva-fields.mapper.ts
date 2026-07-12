import type { DetailFieldConfig } from '../../../shared';
import {
  ClienteDetalleReservaDto,
  TIPO_CLIENTE_LABEL,
  TipoDocumento,
  documentoDeCliente,
} from '../models/reserva.model';

/**
 * Campos de la sección de cliente para las vistas de detalle y edición de reserva.
 * La Empresa se muestra con RUT; el resto con cédula (ver {@link documentoDeCliente}).
 */
export function buildClienteReservaFields(cliente: ClienteDetalleReservaDto): DetailFieldConfig[] {
  const { tipoDocumento, documento } = documentoDeCliente(cliente);
  const documentoField =
    tipoDocumento === TipoDocumento.Rut
      ? { key: 'rut', label: 'RUT', value: documento }
      : { key: 'cedula', label: 'Cédula', value: documento };
  return [
    {
      key: 'tipoCliente',
      label: 'Tipo de cliente',
      value: TIPO_CLIENTE_LABEL[cliente.tipoCliente],
    },
    documentoField,
    { key: 'nombre', label: 'Nombre', value: cliente.nombre },
    { key: 'telefono', label: 'Teléfono', value: cliente.telefono },
    { key: 'email', label: 'Email', value: cliente.email },
  ];
}
