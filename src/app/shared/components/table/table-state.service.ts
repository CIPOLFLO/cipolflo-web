import { computed, Injectable, Signal, signal } from '@angular/core';
import { TableQueryParams } from './table.models';

/**
 * Centraliza el estado de la tabla reutilizable (paginación, ordenamiento y filtros).
 * Expone `queryParams` como signal computado, que la tabla consume para disparar
 * cada nueva llamada al backend ante cualquier cambio de estado.
 * Debe proveerse a nivel de componente (no root) para que cada tabla tenga su propia instancia.
 */
@Injectable()
export class TableStateService {
  private readonly filters = signal<Record<string, string | null>>({});
  private readonly page = signal(0);
  private readonly size = signal(10);
  private readonly sortField = signal<string | undefined>(undefined);
  private readonly sortOrder = signal<'asc' | 'desc'>('asc');
  private readonly _totalElements = signal(0);
  private readonly _loading = signal(false);
  private readonly reloadTrigger = signal(0);

  readonly queryParams: Signal<TableQueryParams> = computed(() => {
    // Se lee para que el computed dependa de reloadTrigger sin alterar el resultado:
    // al incrementarlo, se fuerza una nueva emisión con los mismos filtros/página/orden.
    this.reloadTrigger();
    return {
      filters: this.filters(),
      page: this.page(),
      size: this.size(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
    };
  });
  readonly totalElements = this._totalElements.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly hasResults = computed(() => this._totalElements() > 0);

  updateFilters(f: Record<string, string | null>): void {
    this.filters.set(f);
    this.page.set(0);
  }

  updatePage(p: number): void {
    this.page.set(p);
  }

  updateSize(s: number): void {
    this.size.set(Math.min(100, Math.max(1, s)));
    this.page.set(0);
  }

  updateSort(field: string, order: 'asc' | 'desc'): void {
    this.sortField.set(field);
    this.sortOrder.set(order);
    this.page.set(0);
  }

  clearSort(): void {
    this.sortField.set(undefined);
    this.sortOrder.set('asc');
    this.page.set(0);
  }

  reload(): void {
    this.reloadTrigger.update((v) => v + 1);
  }

  setResult(totalElements: number): void {
    this._totalElements.set(totalElements);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }
}