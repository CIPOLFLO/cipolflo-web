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
import { AppButton, CurrencyFormatPipe, DateShortFormatPipe } from '../../../../shared';
import { FormaPago } from '../../../../shared/models/forma-pago.model';
import {
  FORMA_PAGO_RESERVA_LABEL,
  PagoAsociadoReservaDto,
  ReservaCancelacionRequestDto,
} from '../../models/reserva.model';

@Component({
  selector: 'app-pagos-asociados-dialog',
  standalone: true,
  imports: [
    Dialog,
    Checkbox,
    Select,
    FormsModule,
    AppButton,
    CurrencyFormatPipe,
    DateShortFormatPipe,
  ],
  templateUrl: './pagos-asociados-dialog.html',
  styleUrl: './pagos-asociados-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagosAsociadosDialog {
  visible = input<boolean>(false);
  numeroReserva = input<number | null>(null);
  pagos = input<PagoAsociadoReservaDto[]>([]);
  importeTotalPagos = input<number>(0);

  cancelar = output<void>();
  confirmar = output<ReservaCancelacionRequestDto>();

  protected readonly generarDevolucion = signal(false);
  protected readonly formaPago = signal<FormaPago | null>(null);

  protected readonly formaPagoOptions = Object.entries(FORMA_PAGO_RESERVA_LABEL).map(
    ([value, label]) => ({ value: value as FormaPago, label }),
  );

  protected readonly confirmarDisabled = computed(
    () => this.generarDevolucion() && this.formaPago() === null,
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.generarDevolucion.set(false);
        this.formaPago.set(null);
      }
    });
  }

  protected onGenerarDevolucionChange(checked: boolean): void {
    this.generarDevolucion.set(checked);
    if (!checked) {
      this.formaPago.set(null);
    }
  }

  protected onConfirmar(): void {
    this.confirmar.emit({
      generarDevolucion: this.generarDevolucion(),
      formaPago: this.formaPago() ?? undefined,
    });
  }
}
