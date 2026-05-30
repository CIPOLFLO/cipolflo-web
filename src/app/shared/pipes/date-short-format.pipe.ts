import { Pipe, PipeTransform } from '@angular/core';
import { MESES_ABREVIADOS } from '../models/fecha.constants';

@Pipe({ name: 'dateShortFormat', pure: true })
export class DateShortFormatPipe implements PipeTransform {
  /** Convierte ISO 8601 a 'd mmm yyyy' en UTC (ej: '7 ene 2026'). */
  transform(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getUTCDate()} ${MESES_ABREVIADOS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }
}
