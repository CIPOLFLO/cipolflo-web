import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { FormFieldConfig } from '../../models/form-field.model';

@Component({
  selector: 'app-form-field',
  imports: [FormsModule, Select, InputText, Textarea, InputNumber],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.form-field--full]': 'config().fullWidth',
    '[class.form-field--display]': 'displayOnly()',
    '[class.form-field--locked]': 'config().locked ?? false',
  },
})
export class FormField {
  config = input.required<FormFieldConfig>();
  value = model<string | null>(null);
  displayOnly = input<boolean>(false);
  error = input<string | null>(null);

  protected get numericValue(): number | null {
    const v = this.value();
    if (v === null || v === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }

  protected captureInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  protected captureNumericInput(val: number | null): void {
    this.value.set(val !== null ? String(val) : null);
  }
}
