import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFormat', pure: true })
export class DateFormatPipe implements PipeTransform {
  /**
   * Convierte 'YYYY-MM-DD' (o un timestamp ISO 'YYYY-MM-DDTHH:mm:ssZ', del que solo se toma
   * la parte de fecha) a 'DD/MM/YYYY'. Evita desfases de timezone al no usar Date().
   */
  transform(value: string): string {
    if (!value) return '';
    const datePart = value.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return value;
    const [y, m, d] = parts;
    if (y.length !== 4 || m.length !== 2 || d.length !== 2) return value;
    return `${d}/${m}/${y}`;
  }
}
