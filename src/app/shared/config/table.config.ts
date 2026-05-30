import { InjectionToken } from '@angular/core';

export const TABLE_MIN_LOADING_MS = new InjectionToken<number>('TABLE_MIN_LOADING_MS', {
  providedIn: 'root',
  factory: () => 400,
});

export const TABLE_SKELETON_ROW_COUNT = new InjectionToken<number>('TABLE_SKELETON_ROW_COUNT', {
  providedIn: 'root',
  factory: () => 10,
});
