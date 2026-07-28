import { FormControl, Validators } from '@angular/forms';

/** Control reutilizado por los diálogos de alta/edición de clientes de Telegram y destinatarios de email. */
export function crearControlAlias(): FormControl<string | null> {
  return new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]);
}

export const ALIAS_ERROR_MESSAGES: Record<string, string> = {
  required: 'El alias es obligatorio.',
  maxlength: 'El alias no puede superar los 100 caracteres.',
};
