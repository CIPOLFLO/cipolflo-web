import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { AppButton } from '../../../../shared';
import { ClienteTelegramResponseDto } from '../../models/ajuste.model';
import { ALIAS_ERROR_MESSAGES, crearControlAlias } from '../../utils/alias-field.helper';
import { mensajeErrorControl } from '../../utils/form-field-error.helper';

function chatIdValido(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? null : { chatIdInvalido: true };
}

export interface ClienteTelegramFormValue {
  chatId: number;
  alias: string;
}

@Component({
  standalone: true,
  selector: 'app-cliente-telegram-form-dialog',
  imports: [ReactiveFormsModule, Dialog, InputText, AppButton],
  templateUrl: './cliente-telegram-form-dialog.html',
  styleUrl: './cliente-telegram-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteTelegramFormDialog {
  visible = input<boolean>(false);
  cliente = input<ClienteTelegramResponseDto | null>(null);

  cancelado = output<void>();
  guardado = output<ClienteTelegramFormValue>();

  protected readonly esEdicion = computed(() => this.cliente() !== null);
  protected readonly titulo = computed(() =>
    this.esEdicion() ? 'Editar usuario' : 'Nuevo usuario',
  );

  protected readonly form = new FormGroup({
    chatId: new FormControl<string | null>(null, [Validators.required, chatIdValido]),
    alias: crearControlAlias(),
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly submitted = signal(false);

  protected readonly chatIdError = computed(() => {
    this.formStatus();
    const control = this.form.get('chatId');
    return mensajeErrorControl(control, this.submitted() || !!control?.touched, {
      required: 'El Chat ID es obligatorio.',
      chatIdInvalido: 'El Chat ID debe ser un número entero positivo.',
    });
  });

  protected readonly aliasError = computed(() => {
    this.formStatus();
    const control = this.form.get('alias');
    return mensajeErrorControl(
      control,
      this.submitted() || !!control?.touched,
      ALIAS_ERROR_MESSAGES,
    );
  });

  constructor() {
    effect(() => {
      const visible = this.visible();
      const cliente = this.cliente();
      if (!visible) return;

      this.submitted.set(false);

      if (cliente) {
        this.form.reset({
          chatId: String(cliente.chatId),
          alias: cliente.alias,
        });
        this.form.controls.chatId.disable();
      } else {
        this.form.reset({ chatId: null, alias: null });
        this.form.controls.chatId.enable();
      }
    });
  }

  protected onCancelar(): void {
    this.cancelado.emit();
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    this.guardado.emit({
      chatId: Number(v.chatId),
      alias: v.alias!.trim(),
    });
  }
}
