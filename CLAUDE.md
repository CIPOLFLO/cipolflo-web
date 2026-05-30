# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                          # dev server at http://localhost:4200
npm run build                      # production build → dist/
ng test                            # unit tests (Vitest, watch mode)
npm run test:coverage              # tests with coverage → coverage/lcov.info
ng lint                            # ESLint

# Pre-PR checklist (must all pass before opening a PR):
npx prettier --write .
npx ng test --no-watch --coverage
npx ng lint
```

## Architecture

**Stack:** Angular 21 (standalone, no NgModules), TypeScript 5.9 (strict), RxJS 7.8, PrimeNG with Aura theme, Vitest.

**Module layout:**

```
src/app/
├── app.config.ts          # Global providers (HttpClient, Router, PrimeNG theme)
├── app.routes.ts          # Root routing with lazy loading
├── core/services/         # Global providers: BaseHttpService and other singletons
├── shared/
│   ├── layout/            # page-layout, sub-header, header, footer
│   ├── components/        # Reusable UI components (table, button, filter-panel, form-*)
│   └── models/            # Shared interfaces: AuditInfoDto (audit.model.ts)
└── <modulo>/
    ├── models/            # Module-specific interfaces and DTOs
    ├── services/          # HTTP services extending BaseHttpService
    ├── components/        # Module-specific components and pages
    └── <modulo>.routes.ts # Lazy routes for the module
```

## Key Patterns

### HTTP services

All feature services **must extend `BaseHttpService`** — never inject `HttpClient` directly in feature services. Available methods: `get`, `post`, `put`, `delete`.

```typescript
@Injectable({ providedIn: 'root' })
export class MiService extends BaseHttpService {
  getItems(): Observable<MiDto[]> {
    // TODO: reemplazar cuando el backend esté disponible
    // return this.get<MiDto[]>('mi-endpoint');
    return of(PLACEHOLDER_DATA);
  }
}
```

While the backend is unavailable, return `of(mockData)` with a `// TODO` comment.

### Environment

Always import environment via the alias — never use relative paths:

```typescript
import { environment } from '@env/environment';
```

Three environments exist: production (`api.cipolflo.com`), development (`localhost:8080`), and test (`localhost:0` — intentionally invalid to catch missing HTTP mocks).

### Page layout

Every page component must use `app-page-layout` and include this host CSS:

```css
:host {
  display: flex;
  flex-direction: column;
  flex: 1;
}
```

```html
<app-page-layout
  pageTitle="Listado de Servicios"
  pageDescription="..."
  [showBackButton]="true"
  backButtonLink="/servicios"
>
  <button actions>+ Nuevo</button>
  <!-- projected into sub-header right side -->
  <app-filter-panel />
  <app-table />
</app-page-layout>
```

### Row actions order

When implementing `rowActions` in a list, always follow this order (established in DEV-53):

1. Ver detalle (`pi pi-eye`)
2. Modificar (`pi pi-pencil`)
3. Habilitar (`pi pi-check-circle`) / Deshabilitar (`pi pi-ban`) — mutually exclusive via spread ternary
4. `separator: true`
5. Eliminar (`pi pi-trash`)

```typescript
...(row.estado === Estado.Deshabilitado ? [accionHabilitar] : [accionDeshabilitar])
```

Load all actions commented out and uncomment as they are implemented.

### Detail DTOs and audit fields

Detail-response DTOs extend `AuditInfoDto` (from `src/app/shared/models/audit.model.ts`) with a flat extension — not nested — because the backend returns audit fields at the same level as entity fields:

```typescript
export interface ServicioDetalleRespuestaDto extends AuditInfoDto {
  id: number;
  // ...entity fields
}
```

`AuditInfoDto` is exported from the shared barrel `src/app/shared/index.ts`.

### Components

- All components: `standalone: true`, `ChangeDetectionStrategy.OnPush`, `app-` selector prefix.
- Reusable components (used across more than one module) go in `shared/components/` — their names must not reference any specific module.
- Business logic lives in services; components only coordinate the view.

### Select options convention

- **Filtros** (`FilterConfigProvider`): todo select debe incluir como primera opción `{ label: 'Todos', value: '' }`. Esto permite limpiar el filtro seleccionando "Todos" además del botón "Limpiar Filtros".
- **Formularios** (campos no obligatorios): todo select cuyo `required` sea `false` o esté ausente debe incluir como primera opción `{ label: '', value: '' }` (opción vacía), para que el usuario pueda dejar el campo sin selección.
- Los campos con `required: true` en formularios no llevan opción vacía.

```typescript
// Filtro
options: [
  { label: 'Todos', value: '' },
  { label: 'Habilitado', value: 'HABILITADO' },
  { label: 'Deshabilitado', value: 'DESHABILITADO' },
];

// Formulario — campo no obligatorio
options: [
  { label: '', value: '' },
  { label: 'Opción A', value: 'A' },
  { label: 'Opción B', value: 'B' },
];
```

### PrimeNG

Import only the specific modules needed (`primeng/button`, not `PrimeNGModule`). Use PrimeIcons (`pi pi-*`) — no additional icon libraries. Never override PrimeNG theme variables in individual components; all theme config is in `app.config.ts`.

## Testing

Vitest is the test runner — not Karma, not Jest. `.spec.ts` files live next to the file they test.

HTTP services must use `provideHttpClientTesting()`:

```typescript
TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting(), MiService],
});
```

## Hard rules

- **No NgModules** — architecture is 100% standalone.
- **No direct `HttpClient` injection** in feature services — extend `BaseHttpService`.
- **No relative environment imports** — use `@env/environment`.
- **No `any`** without a comment justifying it.
- **No real HTTP requests in tests** — always `provideHttpClientTesting`.
- **No hardcoded backend URLs** — base URL always from `environment`.
- **No PrimeNG theme overrides** in component styles.
