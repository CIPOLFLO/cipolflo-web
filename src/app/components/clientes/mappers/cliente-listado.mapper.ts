import { ClienteRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';

/** Fila del listado con el documento a mostrar resuelto (RUT para Empresas, cédula para el resto). */
export interface ClienteListadoRow extends ClienteRespuestaDto {
  documento: string | null;
}

export function mapClienteListadoRow(cliente: ClienteRespuestaDto): ClienteListadoRow {
  return { ...cliente, documento: cliente.rut ?? cliente.cedula };
}

/** Configuración visual de una tag para `AppTag` (etiqueta + clase de color global + ícono). */
interface TagView {
  label: string;
  /** Clase de color global de la tag (`tag--*`), la misma que usa la tabla de escritorio. */
  colorClass: string;
  /** Ícono opcional (`pi pi-*`) que precede a la etiqueta. */
  icon?: string;
}

/**
 * Fila del listado móvil: al igual que el listado de escritorio, extiende el DTO
 * y agrega los campos ya resueltos que muestra la card (mismo criterio de documento).
 */
export interface ClienteCardMobileRow extends ClienteRespuestaDto {
  /** Documento a mostrar, resuelto igual que en el escritorio (RUT para Empresas, cédula para el resto). */
  documento: string | null;
  /**
   * Tags a mostrar en la card, en orden: siempre la del tipo de cliente y, solo para
   * los socios (con estado), la del estado.
   */
  tags: TagView[];
}

const TIPO_TAG: Record<TipoCliente, TagView> = {
  [TipoCliente.Socio]: { label: 'Socio', colorClass: 'tag--blue', icon: 'pi pi-verified' },
  [TipoCliente.Particular]: { label: 'Particular', colorClass: 'tag--gray', icon: 'pi pi-user' },
  [TipoCliente.Empresa]: { label: 'Empresa', colorClass: 'tag--purple', icon: 'pi pi-building' },
};

const ESTADO_TAG: Record<EstadoSocio, TagView> = {
  [EstadoSocio.Activo]: { label: 'Activo', colorClass: 'tag--green' },
  [EstadoSocio.Inactivo]: { label: 'Inactivo', colorClass: 'tag--yellow' },
  [EstadoSocio.Baja]: { label: 'De baja', colorClass: 'tag--gray' },
};

export function mapClienteCardMobileRow(cliente: ClienteRespuestaDto): ClienteCardMobileRow {
  const { documento } = mapClienteListadoRow(cliente);
  const estadoTag = cliente.estado !== null ? ESTADO_TAG[cliente.estado] : null;

  return {
    ...cliente,
    documento,
    tags: [TIPO_TAG[cliente.tipoCliente], ...(estadoTag ? [estadoTag] : [])],
  };
}
