// Esta URL es intencionalmente inválida.
// Los tests unitarios nunca deben hacer requests HTTP reales; todas las
// llamadas al backend deben estar mockeadas con provideHttpClientTesting.
// Si un test llega a usar esta URL significa que le falta el mock correspondiente,
// y fallará rápido y de forma obvia en lugar de impactar el backend de producción.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:0',
  auth0: {
    domain: '',
    clientId: '',
    audience: '',
  },
};
