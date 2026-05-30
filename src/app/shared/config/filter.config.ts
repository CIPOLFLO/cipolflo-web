import { InjectionToken } from '@angular/core';

export const FILTER_DEBOUNCE_MS = new InjectionToken<number>('FILTER_DEBOUNCE_MS', {
  providedIn: 'root',
  factory: () => 1500,
});
