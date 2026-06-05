import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { environment } from '@env/environment';

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
    provideAnimationsAsync(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authHttpInterceptorFn])),
    providePrimeNG({
      theme: { preset: CipolfloPreset, options: { darkModeSelector: false } },
      translation: { emptyMessage: 'Sin resultados', emptyFilterMessage: 'Sin resultados' },
    }),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: globalThis.location.origin,
        audience: environment.auth0.audience,
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      httpInterceptor: {
        allowedList: [`${environment.apiUrl}/*`],
      },
    }),
  ],
};
