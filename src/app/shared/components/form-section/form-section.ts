import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormField } from '../form-field/form-field';
import { FormFieldConfig } from '../../models/form-field.model';

@Component({
  selector: 'app-form-section',
  imports: [FormField],
  templateUrl: './form-section.html',
  styleUrl: './form-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.title]': 'null' },
})
export class FormSection {
  title = input.required<string>();
  fields = input<FormFieldConfig[]>([]);
  errors = input<Record<string, string | undefined>>({});

  readonly valuesChange = output<Record<string, string | null>>();
  readonly fieldBlur = output<string>();

  private readonly currentValues: Record<string, string | null> = {};

  constructor() {
    effect(() => {
      for (const field of this.fields()) {
        if (!(field.key in this.currentValues) && field.defaultValue !== undefined) {
          this.currentValues[field.key] = field.defaultValue;
        }
      }
    });
  }

  protected onFieldValueChange(key: string, value: string | null): void {
    this.currentValues[key] = value;
    this.valuesChange.emit({ ...this.currentValues });
  }

  protected onFieldBlur(key: string): void {
    this.fieldBlur.emit(key);
  }
}
