import { Signal } from '@angular/core';
import { FormFieldConfig } from '../models/form-field.model';

export abstract class FilterConfigProvider {
  abstract readonly filterFields: Signal<FormFieldConfig[]>;
}
