import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '../form-field/form-field';
import { DetailFieldConfig } from '../../models/detail-field.model';
import { FormFieldConfig } from '../../models/form-field.model';

@Component({
  selector: 'app-detail-section',
  imports: [FormField],
  templateUrl: './detail-section.html',
  styleUrl: './detail-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.title]': 'null' },
})
export class DetailSection {
  title = input.required<string>();
  fields = input<DetailFieldConfig[]>([]);
  note = input<string>('');
  locked = input<boolean>(false);

  protected readonly formFields = computed<FormFieldConfig[]>(() =>
    this.fields().map((f) => ({
      key: f.key,
      label: f.label,
      type: f.multiline ? 'textarea' : 'text',
      defaultValue: f.value ?? undefined,
      fullWidth: f.fullWidth,
      valueClass: f.valueClass,
    })),
  );
}
