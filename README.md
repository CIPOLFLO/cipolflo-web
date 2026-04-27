# CIPOLFLO — Frontend

Frontend web del sistema CIPOLFLO, desarrollado en Angular 21 con arquitectura standalone.

## Requisitos

- Node.js `^20.19.0 || ^22.13.0 || >=24`
- npm `10.9.2`

## Instalación

```bash
npm install
```

## Comandos

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `http://localhost:4200` (live reload) |
| `npm run build` | Build de producción optimizado en `/dist` |
| `npm run watch` | Build de desarrollo en modo watch |
| `npm test` | Tests unitarios con Vitest (modo watch) |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run lint` | Análisis estático con ESLint |

## Estructura del proyecto

```
src/
├── environments/
│   ├── environment.ts               # URLs de producción
│   ├── environment.development.ts   # URLs de desarrollo local
│   └── environment.test.ts          # URLs de test (localhost:0, inválida a propósito)
└── app/
    ├── app.config.ts                # Bootstrap: providers globales (HttpClient, Router)
    ├── app.routes.ts                # Definición de rutas
    ├── core/                        # Infraestructura transversal (1 sola instancia)
    │   └── services/
    │       └── base-http.service.ts
    ├── shared/                      # Componentes, pipes y directivas reutilizables
    │   └── components/
    └── <modulo>/                    # Un directorio por feature/módulo de negocio
        ├── models/                  # Interfaces y DTOs del módulo
        ├── services/                # Servicios del módulo
        ├── components/              # Componentes propios del módulo
        └── <modulo>.routes.ts       # Rutas lazy del módulo (si aplica)
```

### Dónde ubicar cada cosa

| Qué | Dónde |
|---|---|
| Componente reutilizable en múltiples módulos (botón, tabla, modal…) | `src/app/shared/components/` |
| Servicio de comunicación con el backend | `src/app/<modulo>/services/` extendiendo `BaseHttpService` |
| Interface / DTO de respuesta del backend | `src/app/<modulo>/models/` |
| Componente de página o específico de un módulo | `src/app/<modulo>/components/` |
| Provider o servicio global (auth, logger…) | `src/app/core/services/` |
| Ruta nueva | `src/app/app.routes.ts` (o el archivo de rutas del módulo) |

## Arquitectura de servicios

### Clase base `BaseHttpService`

Todos los servicios que consumen el backend extienden `BaseHttpService` (`src/app/core/services/base-http.service.ts`). Centraliza `HttpClient` y la URL base para no repetir configuración en cada servicio.

```typescript
// src/app/<modulo>/services/<entidad>.service.ts
@Injectable({ providedIn: 'root' })
export class MiService extends BaseHttpService {
  getItems(): Observable<MiDto[]> {
    return this.get<MiDto[]>('mi-endpoint');
  }

  createItem(body: MiDto): Observable<MiDto> {
    return this.post<MiDto>('mi-endpoint', body);
  }
}
```

Métodos disponibles en `BaseHttpService`: `get`, `post`, `put`, `delete`.

### Datos placeholder

Mientras el backend no esté disponible, los métodos retornan datos mock con `of()`. Para conectar al backend real, descomentar la llamada HTTP y eliminar el placeholder:

```typescript
getItems(): Observable<MiDto[]> {
  // TODO: reemplazar cuando el backend esté disponible
  // return this.get<MiDto[]>('mi-endpoint');
  return of(PLACEHOLDER_DATA);
}
```

### Configuración de entornos

El environment se importa siempre con el alias `@env/environment`. Según el tsconfig activo se resuelve al archivo correcto automáticamente:

| Contexto | Archivo |
|---|---|
| `ng serve` / `ng build --dev` | `environment.development.ts` |
| `ng build` (producción) | `environment.ts` |
| `ng test` | `environment.test.ts` (`localhost:0`, falla rápido si falta un mock) |

## Guía para implementar una nueva feature

1. **Crear la carpeta del módulo** en `src/app/<modulo>/`
2. **Definir el modelo** en `<modulo>/models/<entidad>.model.ts`
3. **Crear el servicio** en `<modulo>/services/<entidad>.service.ts` extendiendo `BaseHttpService`
4. **Crear los componentes** en `<modulo>/components/`. Si alguno es reutilizable en otros módulos, moverlo a `shared/components/`
5. **Registrar la ruta** en `app.routes.ts`
6. **Escribir los tests** junto al archivo que testean (mismo directorio, extensión `.spec.ts`)

## Tests

Los archivos de test viven junto al archivo que testean:

```
src/app/servicios/services/
├── servicio.service.ts
└── servicio.service.spec.ts
```

Los tests de servicios HTTP deben usar `provideHttpClientTesting` en lugar de hacer requests reales. El `environment.test.ts` con `localhost:0` actúa como red de seguridad: si falta el mock, el test falla de forma obvia en lugar de impactar el backend.

```typescript
// Ejemplo de setup para test de servicio HTTP
TestBed.configureTestingModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
    MiService,
  ],
});
```

Para generar archivos con Angular CLI:

```bash
ng generate component <modulo>/components/<nombre>
ng generate service <modulo>/services/<nombre>
```

## PrimeNG

El proyecto usa [PrimeNG](https://primeng.org/) como librería de componentes UI, con el tema **Aura** configurado en `app.config.ts`.

### Usar un componente de PrimeNG

Los componentes se importan directamente en el `imports` del `@Component` (no hay módulo global que registrar):

```typescript
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-mi-componente',
  imports: [ButtonModule, TableModule],
  templateUrl: './mi-componente.html',
})
export class MiComponente {}
```

### Íconos

Se usa [PrimeIcons](https://primeng.org/icons). El CSS ya está importado globalmente en `src/styles.css`. Uso en template:

```html
<i class="pi pi-check"></i>
<p-button icon="pi pi-search" label="Buscar" />
```

### Cambiar el tema

El preset se configura en `src/app/app.config.ts`. Para cambiar de Aura a otro preset (Lara, Nora, Material):

```typescript
import Lara from '@primeng/themes/lara';

providePrimeNG({ theme: { preset: Lara } })
```

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21.2 | Framework principal |
| TypeScript | 5.9 | Lenguaje |
| RxJS | 7.8 | Programación reactiva |
| PrimeNG + PrimeIcons | 21.x | Componentes UI |
| Vitest | 4.x | Tests unitarios |
| ESLint + angular-eslint | 21.x | Linting |
| Prettier | 3.x | Formato de código |

## Antes de abrir un PR

Ejecutar el code review de Claude Code desde la terminal antes de abrir el pull request:

```bash
/review
```

Esto analiza los cambios del branch actual y reporta problemas de calidad, seguridad y convenciones antes de que lleguen a revisión.

## Pendiente

- [ ] Layout general: wrapper con header y footer que envuelva todas las páginas
- [ ] Conexión real con el backend (reemplazar placeholders en servicios)
- [ ] Completar modelos con los campos definitivos del contrato de API

## Recursos

- [Angular CLI — documentación](https://angular.dev/tools/cli)
- [Angular — guía de standalone](https://angular.dev/guide/components/importing)
- [Vitest — documentación](https://vitest.dev/)
