import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { AppButton, emailValido } from '../../../../shared';
import { DestinatarioNotificacionEmailResponseDto } from '../../models/ajuste.model';

export interface DestinatarioNotificacionEmailFormValue {
  email: string;
  alias: string;
}

@Component({
  standalone: true,
  selector: 'app-destinatario-notificacion-email-form-dialog',
  imports: [ReactiveFormsModule, Dialog, InputText, AppButton],
  templateUrl: './destinatario-notificacion-email-form-dialog.html',
  styleUrl: './destinatario-notificacion-email-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DestinatarioNotificacionEmailFormDialog {
  visible = input<boolean>(false);
  destinatario = input<DestinatarioNotificacionEmailResponseDto | null>(null);

  cancelado = output<void>();
  guardado = output<DestinatarioNotificacionEmailFormValue>();

  protected readonly esEdicion = computed(() => this.destinatario() !== null);
  protected readonly titulo = computed(() =>
    this.esEdicion() ? 'Editar destinatario' : 'Nuevo destinatario',
  );

  protected readonly form = new FormGroup({
    email: new FormControl<string | null>(null, [
      Validators.required,
      Validators.maxLength(255),
      emailValido,
    ]),
    alias: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(100)]),
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly submitted = signal(false);

  protected readonly emailError = computed(() => {
    this.formStatus();
    const control = this.form.get('email');
    if (!(this.submitted() || control?.touched)) return null;
    if (control?.hasError('required')) return 'El email es obligatorio.';
    if (control?.hasError('emailInvalido')) return 'El email no tiene un formato válido.';
    if (control?.hasError('maxlength')) return 'El email no puede superar los 255 caracteres.';
    return null;
  });

  protected readonly aliasError = computed(() => {
    this.formStatus();
    const control = this.form.get('alias');
    if (!(this.submitted() || control?.touched)) return null;
    if (control?.hasError('required')) return 'El alias es obligatorio.';
    if (control?.hasError('maxlength')) return 'El alias no puede superar los 100 caracteres.';
    return null;
  });

  constructor() {
    effect(() => {
      const visible = this.visible();
      const destinatario = this.destinatario();
      if (!visible) return;

      this.submitted.set(false);

      if (destinatario) {
        this.form.reset({
          email: destinatario.email,
          alias: destinatario.alias,
        });
        this.form.controls.email.disable();
      } else {
        this.form.reset({ email: null, alias: null });
        this.form.controls.email.enable();
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
      email: v.email!.trim(),
      alias: v.alias!.trim(),
    });
  }
}
