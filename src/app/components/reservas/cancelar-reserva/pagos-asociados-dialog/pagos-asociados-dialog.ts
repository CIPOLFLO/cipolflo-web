import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  effect,
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
  procesando = input<boolean>(false);

  cancelar = output<void>();
  confirmar = output<ReservaCancelacionRequestDto>();

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.resetFormulario();
      }
    });
  }

  protected readonly generarDevolucion = signal(false);
  protected readonly formaPago = signal<FormaPago | null>(null);
  protected readonly importeDevolucion = signal(0);
  protected readonly formaPagoReservaLabel = FORMA_PAGO_RESERVA_LABEL;

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

  protected onCancelar(): void {
    this.resetFormulario();
    this.cancelar.emit();
  }

  protected onConfirmar(): void {
    if (this.procesando()) return;

    this.confirmar.emit({
      generarDevolucion: this.generarDevolucion(),
      formaPago: this.formaPago() ?? undefined,
      importeDevolucion: this.generarDevolucion() ? this.importeDevolucion() : undefined,
    });
  }
  protected readonly importeDevolucionInvalido = computed(
    () =>
      this.generarDevolucion() &&
      (this.importeDevolucion() <= 0 || this.importeDevolucion() > this.importeTotalPagos()),
  );

  protected readonly mensajeErrorImporteDevolucion = computed(() => {
    if (this.importeDevolucion() <= 0) {
      return 'El monto a devolver debe ser mayor a 0.';
    }

    if (this.importeDevolucion() > this.importeTotalPagos()) {
      return 'El monto a devolver no puede superar el total pagado.';
    }

    return '';
  });

  private resetFormulario(): void {
    this.generarDevolucion.set(false);
    this.formaPago.set(null);
    this.importeDevolucion.set(0);
  }
}
