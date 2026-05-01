# CIPOLFLO Web

Frontend for the CIPOLFLO reservation management system (Círculo Policial de Flores).

## Stack

- Angular 19 — standalone components, signals, `input()`
- Vitest — unit testing
- PrimeIcons — iconography
- Inter (Google Fonts) — typography

## Development

```bash
npm install
ng serve        # http://localhost:4200
ng test         # unit tests with Vitest
ng build        # production build → dist/
```

## Project structure

```
src/
  app/
    shared/
      layout/        # Global layout components
        header/
        footer/
        sub-header/
        page-layout/  # Standard wrapper for all pages
  components/
    reservas/
    clientes/
    estadisticas/
    finanzas/
    servicios/
  styles.css          # Global styles
```

## Adding a new page

1. Generate the component: `ng generate component components/<module>/<name>`
2. Register the route in `app.routes.ts`
3. Use `app-page-layout` as the page wrapper:

```html
<app-page-layout
  pageTitle="Page title"
  pageDescription="Short description"
>
  <!-- Sub-header action buttons (optional) -->
  <button actions>Export</button>

  <!-- Page content (cards, tables, forms...) -->
</app-page-layout>
```

4. Add to the component CSS:

```css
:host {
  display: flex;
  flex-direction: column;
  flex: 1;
}
```

See `CLAUDE.md` for internal conventions and architecture decisions.
