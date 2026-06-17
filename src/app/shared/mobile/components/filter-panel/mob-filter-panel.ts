import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormField } from '../../../components/form-field/form-field';
import { AppButton } from '../../../components/button/button';
import { FilterConfigProvider } from '../../../services/filter-config.provider';
import { FILTER_DEBOUNCE_MS } from '../../../config/filter.config';
@Component({
  selector: 'app-mob-filter-panel',
  imports: [FormField, AppButton],
  templateUrl: './mob-filter-panel.html',
  styleUrl: './mob-filter-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobFilterPanel {
  searchPlaceholder = input<string>('Buscar...');

  searchChange = output<string>();
  filtersApply = output<Record<string, string>>();
  filtersClear = output<void>();

  protected readonly filterConfigProvider = inject(FilterConfigProvider);
  protected readonly filterFields = this.filterConfigProvider.filterFields;
  protected readonly isExpanded = signal(false);
  protected readonly searchValue = signal('');
  protected readonly filterValues = signal<Record<string, string | null>>(
    Object.fromEntries(
      this.filterFields()
        .filter((f) => f.defaultValue != null)
        .map((f) => [f.key, f.defaultValue!]),
    ),
  );

  private readonly debounceMs = inject(FILTER_DEBOUNCE_MS);
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected toggle(): void {
    this.isExpanded.update((v) => !v);
  }

  protected updateSearch(value: string | null): void {
    const normalized = value ?? '';
    this.searchValue.set(normalized);

    if (this._debounceTimer !== null) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._debounceTimer = null;
      this.searchChange.emit(normalized);
    }, this.debounceMs);
  }

  protected updateFilterValue(key: string, value: string | null): void {
    this.filterValues.update((prev) => ({ ...prev, [key]: value }));
  }

  protected onApply(): void {
    const active = Object.fromEntries(
      Object.entries(this.filterValues()).filter(
        (entry): entry is [string, string] => entry[1] !== null && entry[1] !== '',
      ),
    );
    this.filtersApply.emit({ ...active });
  }

  protected onClear(): void {
    if (this._debounceTimer !== null) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    this.filterValues.set({});
    this.searchValue.set('');
    this.filtersClear.emit();
  }
}
