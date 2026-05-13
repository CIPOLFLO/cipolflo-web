import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

import { routes } from './app.routes';

const CipolfloPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#1447e6',
      600: '#193cb8',
      700: '#1e40af',
      800: '#1e3a8a',
      900: '#172554',
      950: '#0d1b3e',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    providePrimeNG({
      theme: { preset: CipolfloPreset, options: { darkModeSelector: false } },
      translation: { emptyMessage: 'Sin resultados', emptyFilterMessage: 'Sin resultados' },
    }),
  ],
};
