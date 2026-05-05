// Esta URL es intencionalmente inválida.
// Los tests unitarios nunca deben hacer requests HTTP reales; todas las
// llamadas al backend deben estar mockeadas con provideHttpClientTesting.
// Si un test llega a usar esta URL significa que le falta el mock correspondiente,
// y fallará rápido y de forma obvia en lugar de impactar el backend de producción.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:0',
};

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
