import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyFormat', pure: true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number): string {
    return `$ ${Math.abs(value).toLocaleString('es-AR')}`;
  }
}
