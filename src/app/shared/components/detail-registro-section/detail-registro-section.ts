import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '../form-field/form-field';
import { DetailFieldConfig, DetailRegistroData } from '../../models/detail-field.model';
import { FormFieldConfig } from '../../models/form-field.model';
import { DateTimeFormatPipe } from '../../pipes/date-time-format.pipe';

@Component({
  selector: 'app-detail-registro-section',
  imports: [FormField],
  providers: [DateTimeFormatPipe],
  templateUrl: './detail-registro-section.html',
  styleUrl: './detail-registro-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailRegistroSection {
  private readonly dateTimePipe = inject(DateTimeFormatPipe);

  data = input.required<DetailRegistroData>();
  extraFields = input<DetailFieldConfig[]>([]);

  protected readonly allFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'entityId',
      label: this.data().entityIdLabel ?? 'ID',
      type: 'text',
      defaultValue: this.data().entityId,
    },
    {
      key: 'fechaRegistro',
      label: 'Fecha de Registro',
      type: 'text',
      defaultValue: this.dateTimePipe.transform(this.data().fechaRegistro),
    },
    {
      key: 'registradoPor',
      label: 'Registrado por',
      type: 'text',
      defaultValue: this.data().registradoPor,
    },
    ...this.extraFields().map(
      (f): FormFieldConfig => ({
        key: f.key,
        label: f.label,
        type: f.multiline ? 'textarea' : 'text',
        defaultValue: f.value ?? undefined,
        fullWidth: f.fullWidth,
      }),
    ),
  ]);
}
