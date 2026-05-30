import {
  ChangeDetectionStrategy,
  computed,
  inject,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppButton, CurrencyFormatPipe } from '../../../shared';
import { ClienteRespuestaDto } from '../models/cliente.model';
import { ClientesService } from '../services/cliente.service';
import { PagoCuotaDto } from '../models/pago-cuota.model';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { toSignal } from '@angular/core/rxjs-interop';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-pago-cuota',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyFormatPipe,
    AppButton,
    InputNumber,
    Select,
    DatePicker,
    Dialog,
  ],
  templateUrl: './pago-cuota.html',
  styleUrl: './pago-cuota.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagoCuota {
  readonly cliente = input<ClienteRespuestaDto | null>(null);
  readonly cerrado = output<void>();
  protected readonly visible = signal(true);
  protected readonly pagoConfirmado = signal<PagoCuotaDto | null>(null);
  private readonly clientesService = inject(ClientesService);
  private readonly touched = signal(false);

  protected readonly FormaPago = FormaPago;
  protected readonly costoCuota = this.clientesService.getCostoCuota();

  protected readonly form = new FormGroup({
    cantidadCuotas: new FormControl<number>(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    formaPago: new FormControl<FormaPago>(FormaPago.Efectivo, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaPago: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected getTotal(): number {
    return this.form.controls.cantidadCuotas.value * this.costoCuota;
  }

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly confirmDisabled = computed(
    () => this.formStatus() === 'INVALID' || this.fechaEsFutura(),
  );

  protected readonly cantidadCuotas = toSignal(this.form.controls.cantidadCuotas.valueChanges, {
    initialValue: this.form.controls.cantidadCuotas.value,
  });

  protected readonly fechaPago = toSignal(this.form.controls.fechaPago.valueChanges, {
    initialValue: this.form.controls.fechaPago.value,
  });

  protected onCancelar(): void {
    this.cerrar();
  }

  protected onConfirmar(): void {
    this.touched.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.fechaEsFutura()) return;

    this.pagoConfirmado.set({
      clienteId: this.cliente()!.id,
      cantidadCuotas: this.form.controls.cantidadCuotas.value,
      formaPago: this.form.controls.formaPago.value,
      fechaPago: this.toDateString(this.form.controls.fechaPago.value),
      total: this.getTotal(),
    });
  }

  protected fechaEsFutura(): boolean {
    const fechaPago = this.form.controls.fechaPago.value;
    const hoy = new Date();

    fechaPago.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    return fechaPago > hoy;
  }

  protected readonly cantidadInvalida = computed(() => this.touched() && this.cantidadCuotas() < 1);

  protected readonly formasPago = [
    { label: 'Efectivo', value: FormaPago.Efectivo },
    { label: 'Tarjeta', value: FormaPago.Tarjeta },
    { label: 'Transferencia', value: FormaPago.Transferencia },
    { label: 'Débito automático', value: FormaPago.DebitoAutomatico },
    { label: 'Cobradora', value: FormaPago.Cobradora },
  ];

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  protected cerrarConfirmacion(): void {
    this.pagoConfirmado.set(null);
    this.cerrar();
  }

  private cerrar(): void {
    this.pagoConfirmado.set(null);
    this.form.reset({
      cantidadCuotas: 1,
      formaPago: FormaPago.Efectivo,
      fechaPago: new Date(),
    });
    this.touched.set(false);
    this.cerrado.emit();
  }
}
