import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) {
      return '$ 0,00';
    }

    return `$ ${value.toLocaleString('es-UY')},00`;
  }
}
