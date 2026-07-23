import { PROCEDENCIA_LABEL } from '../../../shared';
import {
  EstadoServicio,
  MODALIDAD_PRECIO_LABEL,
  ServicioRespuestaDto,
} from '../models/servicio.model';

interface TagView {
  label: string;
  colorClass: string;
}

export interface ServicioCardMobileRow extends ServicioRespuestaDto {
  procedenciaLabel: string;
  unidadLabel: string;
  estadoTag: TagView;
}

const ESTADO_TAG: Record<EstadoServicio, TagView> = {
  [EstadoServicio.Habilitado]: {
    label: 'Habilitado',
    colorClass: 'tag--green',
  },
  [EstadoServicio.Deshabilitado]: {
    label: 'Deshabilitado',
    colorClass: 'tag--gray',
  },
};

export function mapServicioCardMobileRow(servicio: ServicioRespuestaDto): ServicioCardMobileRow {
  return {
    ...servicio,
    procedenciaLabel: PROCEDENCIA_LABEL[servicio.procedencia] ?? servicio.procedencia,
    unidadLabel: MODALIDAD_PRECIO_LABEL[servicio.modalidadPrecio] ?? servicio.modalidadPrecio,
    estadoTag: ESTADO_TAG[servicio.estado],
  };
}
