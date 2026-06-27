import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormField } from '../form-field/form-field';
import { AppButton } from '../button/button';
import { FilterConfigProvider } from '../../services/filter-config.provider';
import { FILTER_DEBOUNCE_MS } from '../../config/filter.config';
import { buildActiveFilters, buildDefaultFilterValues } from '../../utils/filter.utils';

@Component({
  selector: 'app-filter-panel',
  imports: [FormField, AppButton],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanel {
  filterChange = output<Record<string, string>>();

  protected readonly filterConfigProvider = inject(FilterConfigProvider);
  protected readonly filterFields = this.filterConfigProvider.filterFields;
  protected readonly isExpanded = signal(true);
  protected readonly filterValues = signal<Record<string, string | null>>(
    buildDefaultFilterValues(this.filterFields()),
  );

  private readonly debounceMs = inject(FILTER_DEBOUNCE_MS);
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected toggle(): void {
    this.isExpanded.update((v) => !v);
  }

  protected onHeaderKeypress(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }

  protected updateValue(key: string, value: string | null): void {
    this.filterValues.update((prev) => ({ ...prev, [key]: value }));
    const result = this.filterConfigProvider.onValueChange?.(key, value);
    if (result?.resetKeys?.length) {
      this.filterValues.update((prev) => {
        const next = { ...prev };
        result.resetKeys!.forEach((k) => (next[k] = null));
        return next;
      });
    }
    const field = this.filterFields().find((f) => f.key === key);
    if (field?.type === 'select') {
      this.emitFilters();
    } else {
      if (this._debounceTimer !== null) {
        clearTimeout(this._debounceTimer);
      }
      this._debounceTimer = setTimeout(() => {
        this._debounceTimer = null;
        this.emitFilters();
      }, this.debounceMs);
    }
  }

  protected emitFilters(): void {
    this.filterChange.emit(buildActiveFilters(this.filterValues()));
  }

  protected onClear(): void {
    if (this._debounceTimer !== null) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    this.filterConfigProvider.onClear?.();
    this.filterValues.set({});
    this.filterChange.emit({});
  }
}
