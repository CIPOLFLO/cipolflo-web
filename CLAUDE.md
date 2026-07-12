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
│   ├── models/            # Shared interfaces: AuditInfoDto (audit.model.ts)
│   └── mobile/
│       ├── layout/        # MobPageHeader, MobSidebar (estructura de página mobile)
│       └── components/    # MobStepper, MobStepCard, MobStepFooter (bloques reutilizables mobile)
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

**No mapping/transformation logic in HTTP services.** A service method only performs the request and returns the backend DTO (or `PageResponse<DTO>`) as-is — no `map` to reshape, unwrap `.content`, filter, or adapt the payload. Any transformation to the shape a component needs lives in a dedicated mapper (a pure function in a `mappers/` file next to the consumer) and is applied by the consumer:

```typescript
// ❌ NO: el service desempaqueta/transforma
getHabilitados(p: Procedencia): Observable<ItemDto[]> {
  return this.get<PageResponse<ItemDto>>('items', { ... }).pipe(map((page) => page.content));
}

// ✅ SÍ: el service devuelve el DTO crudo; el consumidor mapea
this.service
  .getAll({ page: 0, size: 100, filters: { procedencia, estado: Estado.Habilitado } })
  .pipe(map(mapItemsConsumidor));
```

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

## Resolución mobile

El breakpoint mobile está fijado en **767px** (`max-width: 767px`).

### BreakpointService

Servicio singleton (`providedIn: 'root'`) en `src/app/core/services/breakpoint.service.ts`. Expone un único signal:

```typescript
isMobile = toSignal(
  this.observer.observe('(max-width: 767px)').pipe(map((result) => result.matches)),
  { initialValue: false },
);
```

El signal reacciona a cambios de tamaño de ventana en tiempo real vía `BreakpointObserver` de `@angular/cdk/layout`.

### Patrón de uso en páginas

Cada página que tenga vista mobile inyecta `BreakpointService` y usa `@if`/`@else` para decidir qué árbol de componentes renderizar:

```typescript
export class ListadoClientes {
  protected readonly breakpoint = inject(BreakpointService);
}
```

```html
@if (breakpoint.isMobile()) { } @else { }
```

El componente mobile nunca se renderiza en desktop y viceversa.

### Componentes mobile

Los componentes exclusivos de resolución mobile viven en `src/app/shared/mobile/`:

- `mobile/layout/` — estructura de página: `MobPageHeader` (`app-mob-page-header`), `MobSidebar` (`app-mob-sidebar`).
- `mobile/components/` — bloques reutilizables: `MobStepper`, `MobStepCard`, `MobStepFooter`, `MobFab` (botón flotante), `MobFilterPanel`, `MobListCard` (shell genérico de card), `MobListLayout` (shell de página de listado).
- `mobile/list/` — utilidades de listado mobile: `MobileListLoader` (servicio de scroll infinito) y `MobInfiniteScroll` (directiva centinela).

Los reutilizables se exportan por el barrel `src/app/shared/index.ts`; importarlos desde `'.../shared'`, no por ruta profunda.

**Convención de nombres:**

- Clase: prefijo `Mob` (ej. `MobStepper`); archivos: prefijo `mob-` (ej. `mob-stepper.ts`).
- Selector: prefijo `app-mob-` (ej. `app-mob-stepper`). El `app-` lo exige ESLint; el `mob-` identifica el componente como mobile-only.

**Cuándo crear un `mob-` vs reutilizar un `app-` existente:** crear `mob-` solo si no hay análogo desktop (estructura propia de la vista mobile). Si el componente desktop ya sirve (ej. `app-button`), reutilizarlo directamente.

### MobPageHeader y el menú hamburguesa

`MobPageHeader` emite el output `menuToggled` al hacer clic en el ícono de menú. La apertura del
sidebar está a cargo de `SidebarService` (`src/app/core/services/sidebar.service.ts`).

- **Páginas normales** (usan `app-page-layout`): el layout ya conecta `(menuToggled)="sidebar.open()"` internamente. No requiere código extra en la página.
- **Páginas que usan `app-mob-page-header` directamente** (ej. wizards): deben inyectar `SidebarService` y enlazar el output manualmente:

```typescript
protected readonly sidebar = inject(SidebarService);
```

```html
<app-mob-page-header title="..." (menuToggled)="sidebar.open()"></app-mob-page-header>
```

### Wizard mobile (`MobStepper` / `MobStepCard` / `MobStepFooter`)

Son los bloques estructurales de cualquier flujo mobile de múltiples pasos. Son
**presentacionales y sin estado**:

- `MobStepper`: deriva el estado visual de cada paso (`active`/`completed`/`future`) únicamente de `currentStep`; no guarda historial de pasos visitados. Al retroceder, los pasos que superan `currentStep` vuelven a estado `future`.
- `MobStepCard`: proyecta contenido del padre con `<ng-content>`; no conoce campos ni lógica de negocio.
- `MobStepFooter`: recibe `showPrevious`, `nextDisabled`, `isLastStep` y emite `previous`/`next`/`confirm`; no decide la navegación ni la validez.

El **componente padre wizard** es responsable de la lógica de navegación, calcular `nextDisabled` según la validez del paso, y mantener un **único modelo de datos persistente** (reactive form o signals) que sobreviva al cambio de paso.

`MobPageHeader` acepta `<ng-content>` (debajo de la barra menú/título/avatar) para proyectar contenido opcional dentro del header azul. El wizard coloca ahí el `MobStepper`. Si no se proyecta nada, el header se ve igual que siempre.

### Listado mobile (`MobListLayout` / `MobileListLoader` / `MobInfiniteScroll`)

Patrón para la vista mobile de una página de listado. El switch de breakpoint va **a nivel raíz del template** (no dentro de `app-page-layout`):

- **Mobile** usa `MobListLayout` (`app-mob-list-layout`) como shell: ocupa `100dvh` y su lista interna es el contenedor scrolleable, por lo que **reemplaza a `app-page-layout`** (no se anida). Proyecta `MobPageHeader` en el slot `[header]`, `MobFilterPanel` en `[filters]` y las cards en el slot por defecto. Como usa `MobPageHeader` directamente, la página inyecta `SidebarService` y enlaza `(menuToggled)="sidebar.open()"`.
- **Desktop** sigue con `app-page-layout` + `app-table` en el `@else`.

**Datos con scroll infinito:** `MobileListLoader<T>` es el análogo mobile de `AppTable`. Se **provee a nivel de componente** junto al `TableStateService` y reutiliza su mismo estado (idénticos filtros/paginación que el escritorio); en vez de reemplazar la página, **acumula** las filas. El componente lo conecta en el constructor y expone `rows/hasMore/loading`; la directiva `MobInfiniteScroll` (centinela con `IntersectionObserver`) llama a `loadMore()`.

```typescript
// inject genérico por token: el cast fija T (no es any)
protected readonly mobileList = inject(MobileListLoader) as MobileListLoader<MiCardRow>;

constructor() {
  this.mobileList.connect((params) => this.miService.getAll(params), mapMiCardRow);
}
```

```html
@if (mobileList.hasMore()) {
<div appMobInfiniteScroll (scrolled)="mobileList.loadMore()"></div>
}
```

**Cards:** lo que se muestra en cada card se resuelve en un **mapper** (única cosa específica del listado); el resto se reutiliza. La presentación concreta de la entidad va en un componente de card **específico del módulo** (ej. `MobClienteCard`) que compone el shell genérico `MobListCard`. `MobListCard` oculta el menú de acciones (`⋮`) cuando la lista de `actions` está vacía — si un listado aún no tiene acciones mobile, no pasar `[actions]`.

### Tokens de diseño

Usar siempre los tokens del proyecto definidos en `src/styles/variables.css` (`--color-*`, `--tag-*`, `--shadow-*`), **no** los del tema de PrimeNG (`--primary-color`, `--text-color`, `--surface-*`). Si falta un token para un color o sombra hardcodeado, agregarlo a `variables.css` en vez de dejar el literal.

**Tags:** para cualquier etiqueta de color usar el componente reutilizable `AppTag` (`app-tag`), que aplica los estilos globales `.app-tag` + `.tag--*` (`src/styles.css`). Acepta `colorClass` (`tag--green`, etc.), un `icon` opcional y `size` (`md` por defecto — como la tabla de escritorio — o `sm` compacto para cards mobile). Las tags de escritorio y mobile comparten así el mismo estilo.

## Hard rules

- **No NgModules** — architecture is 100% standalone.
- **No direct `HttpClient` injection** in feature services — extend `BaseHttpService`.
- **No mapping/transformation in HTTP services** — return the backend DTO as-is; transform via a mapper in the consumer.
- **No relative environment imports** — use `@env/environment`.
- **No `any`** without a comment justifying it.
- **No real HTTP requests in tests** — always `provideHttpClientTesting`.
- **No hardcoded backend URLs** — base URL always from `environment`.
- **No PrimeNG theme overrides** in component styles.
- **No hardcoded colors/shadows** in component styles — use the tokens from `src/styles/variables.css` (`--color-*`, `--tag-*`, `--shadow-*`); if one is missing, add it there.
- **Line length (`printWidth: 100`) does not apply to string literals** — Prettier no parte cadenas y el proyecto no usa la regla `max-len` de ESLint. Un mensaje de usuario que supera los 100 caracteres en una sola línea es correcto y **no debe partirse con `+`**: partirlo pelea con el formateo y ensucia los diffs. El límite aplica al código, no al contenido de las cadenas.
