import { CurrencyFormatPipe } from './currency-format.pipe';
import { describe, expect, it } from 'vitest';

describe('CurrencyFormatPipe', () => {
  const pipe = new CurrencyFormatPipe();

  it('formatea enteros correctamente', () => {
    expect(pipe.transform(5000)).toBe('5.000,00');
  });

  it('formatea valores con decimales correctamente', () => {
    expect(pipe.transform(2500.5)).toBe('2.500,50');
  });

  it('devuelve $ 0,00 para null', () => {
    expect(pipe.transform(null)).toBe('$ 0,00');
  });

  it('devuelve $ 0,00 para undefined', () => {
    expect(pipe.transform(undefined)).toBe('$ 0,00');
  });

  it('devuelve $ 0,00 para NaN', () => {
    expect(pipe.transform(NaN)).toBe('$ 0,00');
  });
});
