# CIPOLFLO — Frontend: Contexto para agentes de IA

## Descripción del proyecto

Frontend web del sistema CIPOLFLO, desarrollado en **Angular 21** con arquitectura **standalone** (sin NgModules). El proyecto está en fase de scaffold; la mayoría de los módulos de negocio aún no están implementados.

- **Repositorio:** `cipolflo-web`
- **Organización:** CIPOLFLO
- **SonarQube project key:** `CIPOLFLO_cipolflo-web`

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Angular | 21.2 | Framework principal |
| TypeScript | 5.9 | Lenguaje (strict mode activado) |
| RxJS | 7.8 | Programación reactiva |
| PrimeNG | 19.x | Biblioteca de componentes UI |
| PrimeIcons | — | Iconografía (incluida con PrimeNG) |
| Vitest | 4.x | Tests unitarios |
| ESLint + angular-eslint | 21.x | Linting |
| Prettier | 3.x | Formato de código (print width: 100, single quotes) |

---

## Estructura de directorios

```
src/
├── environments/
│   ├── environment.ts               # URLs de producción
│   ├── environment.development.ts   # URLs de desarrollo local
│   └── environment.test.ts          # localhost:0 (inválida a propósito para detectar mocks faltantes)
└── app/
    ├── app.config.ts                # Providers globales (HttpClient, Router)
    ├── app.routes.ts                # Rutas raíz
    ├── app.ts                       # Componente raíz
    ├── core/
    │   └── services/
    │       └── base-http.service.ts # Clase base para todos los servicios HTTP
    ├── shared/
    │   ├── layout/                  # Componentes de layout globales
    │   │   ├── header/              # Barra de navegación principal
    │   │   ├── footer/              # Pie de página
    │   │   ├── sub-header/          # Título de página + back button (usado internamente por page-layout)
    │   │   └── page-layout/         # Wrapper estándar para todas las páginas
    │   └── components/              # Componentes UI reutilizables entre módulos
    └── <modulo>/
        ├── models/                  # Interfaces y DTOs del módulo
        ├── services/                # Servicios del módulo (extienden BaseHttpService)
        ├── components/              # Componentes del módulo
        └── <modulo>.routes.ts       # Rutas lazy del módulo
```

---

## Reglas de arquitectura

### Componentes standalone
Todos los componentes usan `standalone: true`. No se crean NgModules.

### Alias de entorno
El entorno siempre se importa con el alias `@env/environment`. Nunca se importa la ruta relativa directamente.

```typescript
import { environment } from '@env/environment';
```

### Servicios HTTP — BaseHttpService
Todos los servicios que consumen el backend **deben extender `BaseHttpService`**. No se inyecta `HttpClient` directamente en servicios de feature.

```typescript
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

### Datos placeholder (backend no disponible)
Mientras el backend no esté listo, los métodos retornan datos mock con `of()`. Dejar un comentario `TODO` para el reemplazo futuro:

```typescript
getItems(): Observable<MiDto[]> {
  // TODO: reemplazar cuando el backend esté disponible
  // return this.get<MiDto[]>('mi-endpoint');
  return of(PLACEHOLDER_DATA);
}
```

### Ubicación de archivos

| Qué crear | Dónde |
|---|---|
| Componente reutilizable (botón, tabla, modal…) | `src/app/shared/components/` |
| Servicio de comunicación con backend | `src/app/<modulo>/services/` extendiendo `BaseHttpService` |
| Interface / DTO del backend | `src/app/<modulo>/models/` |
| Componente de página o específico del módulo | `src/app/<modulo>/components/` |
| Provider o servicio global (auth, logger…) | `src/app/core/services/` |
| Ruta nueva | `src/app/app.routes.ts` o el archivo de rutas del módulo |

---

## Layout de páginas

### `app-page-layout`

Wrapper estándar que **todas las páginas deben usar**. Combina `app-sub-header` (título + botones) con el contenedor de contenido. Importar desde `shared/layout/page-layout/page-layout`.

**Inputs:**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `pageTitle` | `string` | `''` | Título de la página |
| `pageDescription` | `string` | `''` | Subtítulo bajo el título |
| `showBackButton` | `boolean` | `false` | Muestra botón "← Volver" |
| `backButtonLink` | `string` | `'/'` | Ruta del botón volver |

**Slots de contenido (`ng-content`):**
- `[actions]` — botones proyectados en el sub-header (lado derecho)
- default — contenido de la página (cards, tablas, formularios)

**Uso — listado con filtros y tabla:**
```html
<app-page-layout pageTitle="Listado de Reservas" pageDescription="...">
  <button actions>Exportar</button>
  <button actions>+ Nueva Reserva</button>

  <app-reservas-filtros />
  <app-reservas-tabla />
</app-page-layout>
```

**Uso — formulario con botón volver:**
```html
<app-page-layout
  pageTitle="Nueva Reserva"
  pageDescription="Complete los datos"
  [showBackButton]="true"
  backButtonLink="/reservas"
>
  <app-nueva-reserva-form />
</app-page-layout>
```

### CSS requerido en cada componente de página

El host de cada página debe participar en la cadena flexbox para ocupar el alto completo de la pantalla:

```css
:host {
  display: flex;
  flex-direction: column;
  flex: 1;
}
```

Sin esto, el componente colapsa a su alto de contenido y deja un espacio vacío debajo.

### `app-sub-header`

Usado internamente por `app-page-layout`. Solo usarlo directamente si una página necesita el sub-header sin el contenedor de contenido (caso excepcional).

### Notas de implementación

- **`ngProjectAs`:** `page-layout` usa `ng-container ngProjectAs="[actions]"` para re-proyectar el slot de acciones hacia `sub-header`. Angular no forwarda selectores de `ng-content` automáticamente en múltiples niveles. No eliminarlo.
- **Color de fondo global:** `body { background-color: #f8fafc }` está en `src/styles.css`. No definir `background` en selectores `body` o `*` dentro de estilos de componentes — la encapsulación de Angular los ignora.

---

## Testing

- **Runner:** Vitest (no Karma/Jest).
- Los archivos `.spec.ts` viven **junto** al archivo que testean (mismo directorio).
- Los tests de servicios HTTP **deben usar `provideHttpClientTesting`**, nunca hacer requests reales.
- El `environment.test.ts` con `localhost:0` hace que los tests fallen rápido si falta un mock HTTP.

```typescript
TestBed.configureTestingModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
    MiService,
  ],
});
```

Comandos de test:

```bash
npm test                  # watch mode
npm run test:coverage     # cobertura (genera coverage/lcov.info para SonarQube)
```

---

## CI/CD

El pipeline se encuentra en `.github/workflows/ci.yml` y actualmente está comentado (sin código suficiente para correr). Se activa en PRs a `develop` y `main`. Jobs previstos:

1. **lint** — Prettier check + ESLint
2. **unit-tests** — Vitest con cobertura, sube artefacto `coverage/`
3. **sonarqube** — Escaneo con `coverage/lcov.info`

Secretos requeridos: `SONAR_TOKEN`.

---

## PrimeNG — Biblioteca de componentes UI

El proyecto usa **PrimeNG 19** como biblioteca de componentes visuales. Es compatible con Angular standalone y no requiere módulos adicionales.

### Instalación (pendiente)

```bash
npm install primeng
```

Agregar el tema en `src/styles.css`:

```css
@import "primeng/resources/themes/lara-light-blue/theme.css";
@import "primeng/resources/primeng.css";
@import "primeicons/primeicons.css";
```

O usando el nuevo sistema de temas con `providePrimeNG` en `app.config.ts`:

```typescript
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({ theme: { preset: Aura } }),
  ],
};
```

### Uso de componentes

Los componentes de PrimeNG son standalone. Se importan directamente en el componente que los usa, no en un módulo global.

```typescript
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  standalone: true,
  imports: [ButtonModule, TableModule, DialogModule],
  ...
})
```

### Convenciones en este proyecto

- **No crear wrappers innecesarios** sobre componentes PrimeNG; usarlos directamente en los templates.
- **Preferir los módulos específicos** (`primeng/button`, `primeng/table`) sobre importar `PrimeNGModule` completo, para mantener el bundle pequeño.
- **Iconos:** usar `PrimeIcons` (`pi pi-check`, `pi pi-trash`, etc.) como clases CSS. No instalar librerías de iconos adicionales.
- **Formularios reactivos:** integrar PrimeNG con `ReactiveFormsModule`; usar `formControlName` en los inputs de PrimeNG.
- **Temas:** el tema se define una sola vez en `app.config.ts` o en `styles.css`. No sobreescribir variables de tema en componentes individuales; usar las clases utilitarias de PrimeNG o estilos locales del componente.

### Componentes más usados (referencia rápida)

| Componente | Import |
|---|---|
| Botón | `primeng/button` → `<p-button>` |
| Tabla | `primeng/table` → `<p-table>` |
| Diálogo / Modal | `primeng/dialog` → `<p-dialog>` |
| Input text | `primeng/inputtext` → `<input pInputText>` |
| Dropdown | `primeng/select` → `<p-select>` |
| Toast / notificaciones | `primeng/toast` + `MessageService` |
| Confirmación | `primeng/confirmdialog` + `ConfirmationService` |
| Menú / sidebar nav | `primeng/menu` o `primeng/panelmenu` |

### Servicios globales de PrimeNG

`MessageService` (toasts) y `ConfirmationService` deben proveerse en `app.config.ts` si se usan de forma global:

```typescript
providers: [
  MessageService,
  ConfirmationService,
]
```

---

## Convenciones de código

- **TypeScript strict:** activado. No usar `any` sin justificación.
- **Selectores de componentes:** prefijo `app-` en kebab-case (ej. `app-user-card`).
- **Selectores de directivas:** prefijo `app` en camelCase (ej. `appHighlight`).
- **Quotes:** single quotes en TypeScript, doble en HTML.
- **Línea máxima:** 100 caracteres.
- **Imports:** usar `@env/environment` para entornos; usar paths relativos para el resto (no hay path aliases de módulos configurados aún).
- **No comentarios obvios:** solo comentar el _por qué_ cuando no es evidente.

---

## Comandos útiles

```bash
npm start                          # dev server en localhost:4200
npm run build                      # build de producción
npm run lint                       # ESLint
ng generate component <ruta>       # genera componente standalone
ng generate service <ruta>         # genera servicio
```

---

## Qué NO hacer

### Angular
- **No crear NgModules.** La arquitectura es 100% standalone. Si se necesita compartir algo, va en `shared/`.
- **No inyectar `HttpClient` directamente** en servicios de feature. Siempre extender `BaseHttpService`.
- **No importar la ruta relativa de environments** (`../../environments/environment`). Usar el alias `@env/environment`.
- **No usar `any`** salvo que sea estrictamente inevitable y justificado con un comentario.
- **No poner lógica de negocio en los componentes.** Los componentes solo coordinan la vista; la lógica va en servicios.
- **No hardcodear URLs del backend** en los servicios. Las URLs base vienen del `environment`.

### Estructura
- **No crear archivos fuera de su módulo correspondiente.** Cada feature tiene su propio directorio en `src/app/<modulo>/`.
- **No poner componentes reutilizables dentro de un módulo.** Si se usa en más de un módulo, va en `src/app/shared/components/` y el nombre del componente y sus elementos no puede hacer referencia a ningun modulo específico.
- **No crear un `<modulo>.module.ts`** — este proyecto no usa NgModules.

### Testing
- **No usar Karma ni Jest.** El runner es Vitest.
- **No hacer requests HTTP reales en tests.** Siempre usar `provideHttpClientTesting`.
- **No poner archivos `.spec.ts` en una carpeta separada.** Viven junto al archivo que testean.
- **No mockear el módulo HTTP con `HttpClientModule` directamente.** Usar `provideHttpClient()` + `provideHttpClientTesting()`.

### PrimeNG
- **No importar `PrimeNGModule`** (el módulo completo). Importar solo los módulos específicos que se necesitan.
- **No crear componentes wrapper** alrededor de componentes PrimeNG sin una razón real.
- **No instalar otras librerías de iconos** (FontAwesome, Material Icons, etc.). Usar `PrimeIcons`.
- **No sobreescribir variables de tema de PrimeNG dentro de componentes.** Los ajustes de tema van en `app.config.ts` o `styles.css`.

### General
- **No diseñar para requisitos futuros hipotéticos.** Implementar lo necesario hoy.
- **No agregar manejo de errores para escenarios que no pueden ocurrir.** Solo validar en los límites del sistema (inputs del usuario, respuestas del backend).

---

## Pendiente (no implementado)

- `src/app/core/services/base-http.service.ts` — aún no existe, debe crearse.
- `src/environments/` — archivos de entorno aún no creados.
- **PrimeNG** — pendiente instalar (`npm install primeng`) y configurar tema en `app.config.ts`.
- Conexión real con el backend (reemplazar todos los `of()` placeholder).
- Rutas de módulos de negocio (actualmente `app.routes.ts` retorna `[]`).
- Implementar contenido real de los módulos (tablas, filtros, formularios) reemplazando los placeholders actuales.
