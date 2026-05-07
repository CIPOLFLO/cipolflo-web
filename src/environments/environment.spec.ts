import { describe, expect, it } from 'vitest';

import { environment } from './environment.test';

describe('environment de test', () => {
  it('no debería estar en modo producción', () => {
    expect(environment.production).toBe(false);
  });

  it('debería apuntar a localhost para evitar requests reales', () => {
    expect(environment.apiUrl).toContain('localhost');
  });

  it('debería usar el puerto 0 para que los requests fallen de inmediato', () => {
    expect(environment.apiUrl).toBe('http://localhost:0');
  });
});
