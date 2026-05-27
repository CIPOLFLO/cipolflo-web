# CIPOLFLO Web

Frontend for the CIPOLFLO reservation management system (Círculo Policial de Flores).

## Stack

- Angular 21 — standalone components, signals, `input()`
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
<app-page-layout pageTitle="Page title" pageDescription="Short description">
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

See `agents.md` for internal conventions and architecture decisions.

## Troubleshooting

### CI falla con `npm ci` — paquetes faltantes en el lock file

Ocurre cuando se instala un paquete nuevo en Windows: el `package-lock.json` resultante omite dependencias opcionales de Linux que el CI necesita. Para corregirlo, regenerar el lock file desde Linux usando WSL:

```bash
wsl
cd /mnt/c/Users/<tu-usuario>/Desktop/Proyecto\ CIPOLFLO/cipolflo-web
rm package-lock.json
npm install
exit
```

Commitear el `package-lock.json` regenerado.

## Pre-PR checklist

Before opening a pull request, run the following commands and make sure they all pass:

```bash
# 1. Tests with coverage — all new lines must be covered
npx ng test --no-watch --coverage

# 2. Lint — code must comply with ESLint rules
npx ng lint

# 3. Formatting — auto-fixes code style
npx prettier --write .

```

> SonarQube will fail if coverage drops. Make sure to add tests for all new code before opening a PR.
