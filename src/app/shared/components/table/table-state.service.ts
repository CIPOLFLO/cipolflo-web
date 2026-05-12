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

  readonly queryParams: Signal<TableQueryParams> = computed(() => ({
    filters: this.filters(),
    page: this.page(),
    size: this.size(),
    sortField: this.sortField(),
    sortOrder: this.sortOrder(),
  }));

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
}
