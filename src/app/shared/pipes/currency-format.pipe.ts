import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
      return '$ 0,00';
    }

    return value.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
