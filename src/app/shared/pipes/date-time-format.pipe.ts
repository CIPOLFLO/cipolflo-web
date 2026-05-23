import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateTimeFormat', pure: true })
export class DateTimeFormatPipe implements PipeTransform {
  /** Convierte ISO 8601 ('YYYY-MM-DDTHH:MM:SSZ') a 'dd/mm/yyyy HH:mm' en hora local del navegador. */
  transform(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}hs`;
  }
}
