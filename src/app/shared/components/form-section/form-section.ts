import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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

  private readonly currentValues: Record<string, string | null> = {};

  protected onFieldValueChange(key: string, value: string | null): void {
    this.currentValues[key] = value;
    this.valuesChange.emit({ ...this.currentValues });
  }
}
