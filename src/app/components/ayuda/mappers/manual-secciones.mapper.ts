import { parseIsoDate } from '../../../shared';
import {
  CATEGORIA_MANUAL_LABEL,
  CATEGORIA_MANUAL_ORDEN,
  CategoriaManual,
  ManualResponseDto,
} from '../models/manual.model';

export interface ManualItem {
  clave: string;
  titulo: string;
  /**
   * Línea secundaria de la card: 'v1.0 · 07/2026'. El peso del archivo no se muestra.
   * Los manuales sin PDF publicado no traen versión ni fecha, así que se los rotula
   * como "En preparación".
   */
  detalle: string;
  disponible: boolean;
}

export interface SeccionManuales {
  categoria: CategoriaManual;
  titulo: string;
  manuales: ManualItem[];
}

/** Formatea 'yyyy-MM-dd' como 'MM/yyyy'; devuelve '' si la fecha no es válida. */
function toMesAnio(iso: string | null): string {
  const fecha = parseIsoDate(iso);
  if (!fecha) return '';
  return `${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
}

function toDetalle(dto: ManualResponseDto): string {
  if (!dto.disponible) return 'En preparación';

  const partes = [dto.version ? `v${dto.version}` : '', toMesAnio(dto.fechaActualizacion)];
  return partes.filter(Boolean).join(' · ');
}

function toManualItem(dto: ManualResponseDto): ManualItem {
  return {
    clave: dto.clave,
    titulo: dto.titulo,
    detalle: toDetalle(dto),
    disponible: dto.disponible,
  };
}

/**
 * Agrupa los manuales en secciones por categoría, respetando el orden de
 * `CATEGORIA_MANUAL_ORDEN` y descartando las categorías que quedan sin manuales.
 */
export function mapSeccionesManuales(manuales: ManualResponseDto[]): SeccionManuales[] {
  return CATEGORIA_MANUAL_ORDEN.map((categoria) => ({
    categoria,
    titulo: CATEGORIA_MANUAL_LABEL[categoria],
    manuales: manuales.filter((manual) => manual.categoria === categoria).map(toManualItem),
  })).filter((seccion) => seccion.manuales.length > 0);
}
