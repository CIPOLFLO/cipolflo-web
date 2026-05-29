import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppButton } from '../../../shared';
import { ClienteRespuestaDto } from '../models/cliente.model';

export interface PagoCuotaDto {
  clienteId: number;
  cantidadCuotas: number;
  formaPago: string;
  fechaPago: string;
  total: number;
}

@Component({
  selector: 'app-pago-cuota',
  standalone: true,
  imports: [ReactiveFormsModule, AppButton],
  templateUrl: './pago-cuota.html',
  styleUrl: './pago-cuota.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagoCuota {
  readonly cliente = input.required<ClienteRespuestaDto>();
  readonly cancelado = output<void>();
  readonly confirmado = output<PagoCuotaDto>();

  private readonly costoCuota = 5000;

  protected readonly form = new FormGroup({
    cantidadCuotas: new FormControl<number>(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    formaPago: new FormControl<string>('EFECTIVO', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaPago: new FormControl<string>(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly total = computed(() => {
    const cantidad = this.form.controls.cantidadCuotas.value;
    return cantidad * this.costoCuota;
  });

  protected readonly fechaSeleccionada = computed(() =>
    this.formatFecha(this.form.controls.fechaPago.value),
  );

  protected onCancelar(): void {
    this.cancelado.emit();
  }

  protected onConfirmar(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.fechaEsFutura()) return;

    this.confirmado.emit({
      clienteId: this.cliente().id,
      cantidadCuotas: this.form.controls.cantidadCuotas.value,
      formaPago: this.form.controls.formaPago.value,
      fechaPago: this.form.controls.fechaPago.value,
      total: this.total(),
    });
  }

  protected fechaEsFutura(): boolean {
    return this.form.controls.fechaPago.value > this.today();
  }

  protected cantidadInvalida(): boolean {
    const control = this.form.controls.cantidadCuotas;
    return control.touched && control.invalid;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private formatFecha(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  protected formatMoney(value: number): string {
    return `$ ${value.toLocaleString('es-UY')},00`;
  }
}
