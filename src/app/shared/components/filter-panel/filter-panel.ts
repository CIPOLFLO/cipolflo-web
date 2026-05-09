import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormField } from '../form-field/form-field';
import { AppButton } from '../button/button';
import { FilterConfigProvider } from '../../services/filter-config.provider';

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
  protected readonly filterValues = signal<Record<string, string | null>>({});

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
  }

  protected onSearch(): void {
    const active = Object.fromEntries(
      Object.entries(this.filterValues()).filter(
        (entry): entry is [string, string] => entry[1] !== null && entry[1] !== '',
      ),
    );
    this.filterChange.emit({ ...active });
  }

  protected onClear(): void {
    this.filterValues.set({});
    this.filterChange.emit({});
  }
}
