import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { FormFieldConfig } from '../../models/form-field.model';

@Component({
  selector: 'app-form-field',
  imports: [Select, InputText, Textarea],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.form-field--full]': 'config().fullWidth',
  },
})
export class FormField {
  config = input.required<FormFieldConfig>();
}
