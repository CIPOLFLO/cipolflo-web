import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { DateTimeFormatPipe } from '../index';

describe('DateTimeFormatPipe', () => {
  const pipe = new DateTimeFormatPipe();

  it('debe formatear una fecha ISO a hora local con el formato esperado', () => {
    const value = '2026-05-22T14:05:00Z';
    const date = new Date(value);
    const expected = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} hs`;

    expect(pipe.transform(value)).toBe(expected);
  });

  it('debe devolver una cadena vacía cuando el valor es null o undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debe devolver una cadena vacía cuando la fecha es inválida', () => {
    expect(pipe.transform('no-es-una-fecha')).toBe('');
  });
});
