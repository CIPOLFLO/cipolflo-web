import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cedulaFormat', pure: true })
export class CedulaFormatPipe implements PipeTransform {
  transform(value?: string | null): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 8) return value;
    return `${digits[0]}.${digits.slice(1, 4)}.${digits.slice(4, 7)}-${digits[7]}`;
  }
}
