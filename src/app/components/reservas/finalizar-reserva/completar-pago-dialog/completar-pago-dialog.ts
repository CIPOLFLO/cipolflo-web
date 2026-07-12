import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { AppButton, CurrencyFormatPipe } from '../../../../shared';
import { FormaPago } from '../../../../shared/models/forma-pago.model';
import {
  FORMA_PAGO_RESERVA_LABEL,
  ReservaFinalizacionRequestDto,
} from '../../models/reserva.model';

@Component({
  selector: 'app-completar-pago-dialog',
  standalone: true,
  imports: [Dialog, Checkbox, Select, FormsModule, AppButton, CurrencyFormatPipe],
  templateUrl: './completar-pago-dialog.html',
  styleUrl: './completar-pago-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletarPagoDialog {
  visible = input<boolean>(false);
  numeroReserva = input<number | null>(null);
  montoImpago = input<number>(0);
  procesando = input<boolean>(false);

  cancelar = output<void>();
  confirmar = output<ReservaFinalizacionRequestDto>();

  protected readonly completarPago = signal(false);
  protected readonly formaPago = signal<FormaPago | null>(null);
  protected readonly notas = signal('');

  protected readonly formaPagoOptions = Object.entries(FORMA_PAGO_RESERVA_LABEL).map(
    ([value, label]) => ({ value: value as FormaPago, label }),
  );

  protected readonly confirmarDisabled = computed(
    () => this.completarPago() && this.formaPago() === null,
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.resetFormulario();
      }
    });
  }

  protected onCompletarPagoChange(checked: boolean): void {
    this.completarPago.set(checked);

    if (!checked) {
      this.formaPago.set(null);
      this.notas.set('');
    }
  }

  protected onCancelar(): void {
    this.resetFormulario();
    this.cancelar.emit();
  }

  protected onConfirmar(): void {
    if (this.procesando()) return;

    this.confirmar.emit({
      completarPago: this.completarPago(),
      formaPago: this.completarPago() ? (this.formaPago() ?? undefined) : undefined,
      notas: this.completarPago() ? this.notas() || undefined : undefined,
    });
  }

  private resetFormulario(): void {
    this.completarPago.set(false);
    this.formaPago.set(null);
    this.notas.set('');
  }
}
