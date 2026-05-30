import { CurrencyFormatPipe } from './currency-format.pipe';
import { describe, expect, it } from 'vitest';

describe('CurrencyFormatPipe', () => {
  const pipe = new CurrencyFormatPipe();

  it('formatea valores correctamente', () => {
    expect(pipe.transform(5000)).toBe('$ 5.000,00');
  });
});
