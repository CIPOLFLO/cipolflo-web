import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Injectable({ providedIn: 'root' })
@Pipe({ name: 'cedulaFormat', pure: true })
export class CedulaFormatPipe implements PipeTransform {
  /**
   * Formatea una cédula uruguaya como `1.234.567-8` (8 dígitos) o `100.000-1` (7 dígitos).
   * El rango 7-8 es el mismo que aceptan `cedulaValida` y el validador del backend: las
   * cédulas de numeración baja llevan un dígito menos y no se escriben con el cero a la
   * izquierda. Fuera de ese rango se devuelve el valor sin tocar.
   */
  transform(value?: string | null): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 8) return value;
    const numero = digits.slice(0, -1);
    const verificador = digits.slice(-1);
    return `${numero.replace(/\B(?=(\d{3})+$)/g, '.')}-${verificador}`;
  }
}
