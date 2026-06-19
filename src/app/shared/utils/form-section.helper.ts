import { FormGroup } from '@angular/forms';

/**
 * Aplica al form los valores emitidos por una sección (`app-form-section`),
 * marcándolos como dirty/touched para disparar las validaciones visibles.
 */
export function applySectionChange(form: FormGroup, values: Record<string, unknown>): void {
  form.patchValue(values);
  form.markAsDirty();
  Object.keys(values).forEach((key) => form.get(key)?.markAsTouched());
}

export function markFieldAsTouched(form: FormGroup, key: string): void {
  form.get(key)?.markAsTouched();
}
