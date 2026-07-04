import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
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
import { InputNumber } from 'primeng/inputnumber';

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
    InputNumber,
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
  protected readonly importeDevolucion = signal(0);

  protected readonly formaPagoOptions = Object.entries(FORMA_PAGO_RESERVA_LABEL).map(
    ([value, label]) => ({ value: value as FormaPago, label }),
  );

  protected readonly confirmarDisabled = computed(() => {
    if (!this.generarDevolucion()) return false;

    return (
      this.formaPago() === null ||
      this.importeDevolucion() <= 0 ||
      this.importeDevolucion() > this.importeTotalPagos()
    );
  });

  protected onGenerarDevolucionChange(checked: boolean): void {
    this.generarDevolucion.set(checked);
    if (checked) {
      this.importeDevolucion.set(this.importeTotalPagos());
    }

    if (!checked) {
      this.formaPago.set(null);
      this.importeDevolucion.set(0);
    }
  }

  protected onConfirmar(): void {
    this.confirmar.emit({
      generarDevolucion: this.generarDevolucion(),
      formaPago: this.formaPago() ?? undefined,
      importeDevolucion: this.generarDevolucion() ? this.importeDevolucion() : undefined,
    });
  }
}
