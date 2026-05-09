import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { FormFieldConfig } from '../../models/form-field.model';

@Component({
  selector: 'app-form-field',
  imports: [FormsModule, Select, InputText, Textarea],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.form-field--full]': 'config().fullWidth',
  },
})
export class FormField {
  config = input.required<FormFieldConfig>();
  value = model<string | null>(null);

  protected captureInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }
}
