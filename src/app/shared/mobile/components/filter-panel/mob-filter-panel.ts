import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormField } from '../../../components/form-field/form-field';
import { AppButton } from '../../../components/button/button';
import { FilterConfigProvider } from '../../../services/filter-config.provider';
import { buildActiveFilters, buildDefaultFilterValues } from '../../../utils/filter.utils';

@Component({
  selector: 'app-mob-filter-panel',
  imports: [FormField, AppButton],
  templateUrl: './mob-filter-panel.html',
  styleUrl: './mob-filter-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobFilterPanel {
  filtersApply = output<Record<string, string>>();
  filtersClear = output<void>();

  protected readonly filterConfigProvider = inject(FilterConfigProvider);
  protected readonly filterFields = this.filterConfigProvider.filterFields;
  protected readonly isExpanded = signal(false);
  protected readonly filterValues = signal<Record<string, string | null>>(
    buildDefaultFilterValues(this.filterFields()),
  );

  protected toggle(): void {
    this.isExpanded.update((v) => !v);
  }

  protected updateFilterValue(key: string, value: string | null): void {
    this.filterValues.update((prev) => ({ ...prev, [key]: value }));
  }

  protected onApply(): void {
    this.filtersApply.emit(buildActiveFilters(this.filterValues()));
    this.isExpanded.set(false);
  }

  protected onClear(): void {
    this.filterValues.set({});
    this.filtersClear.emit();
  }
}
