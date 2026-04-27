# Convenciones del Proyecto

## Arquitectura
- Componentes standalone.
- No usar NgModules.
- Servicios de feature heredan de `BaseHttpService`.
- Importar el environment con `@env/environment`.

## Código
- TypeScript strict.
- `app-` para selectores de componentes.
- `app` para selectores de directivas.
- Single quotes en TypeScript.
- Doble quotes en HTML.
- Máximo 100 caracteres por línea.

## Tests
- Usar Vitest.
- Mantener `.spec.ts` junto al archivo probado.
- En tests HTTP usar `provideHttpClientTesting`.
- No hacer requests reales.

## PrimeNG
- Importar módulos específicos, no un módulo global.
- Usar PrimeIcons cuando exista equivalente.