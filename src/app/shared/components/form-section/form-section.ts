import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
}
