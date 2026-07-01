import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import {
  FORMA_PAGO_RESERVA_LABEL,
  RegistroPagoReservaRequestDto,
  ReservaRow,
} from '../models/reserva.model';
import { RegistroPagoReservaService } from '../services/registro-pago-reserva.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { AppButton, CurrencyFormatPipe } from '../../../shared';

@Component({
  selector: 'app-pago-reserva',
  imports: [ReactiveFormsModule, Dialog, InputNumber, Select, AppButton, CurrencyFormatPipe],
  templateUrl: './pago-reserva.html',
  styleUrl: './pago-reserva.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagoReserva {
  reserva = input.required<ReservaRow | null>();

  closed = output<void>();
  pagoRegistrado = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly registroPagoReservaService = inject(RegistroPagoReservaService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly guardando = signal(false);

  protected readonly formaPagoOptions = Object.entries(FORMA_PAGO_RESERVA_LABEL).map(
    ([value, label]) => ({ value: value as FormaPago, label }),
  );

  protected readonly form = this.fb.nonNullable.group({
    esPagoTotal: [true],
    importe: [0, [Validators.required, Validators.min(1)]],
    formaPago: ['', Validators.required],
    notas: [''],
  });

  constructor() {
    effect(() => {
      const reserva = this.reserva();

      if (!reserva) {
        this.form.reset({
          esPagoTotal: true,
          importe: 0,
          formaPago: '',
          notas: '',
        });
        return;
      }

      this.form.controls.importe.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(reserva.montoImpago),
      ]);

      this.form.reset({
        esPagoTotal: true,
        importe: reserva.montoImpago,
        formaPago: '',
        notas: '',
      });

      this.form.controls.importe.updateValueAndValidity();
    });
  }

  protected onCerrar(): void {
    if (this.guardando()) return;
    this.closed.emit();
  }

  protected onCancelar(): void {
    this.onCerrar();
  }

  protected importeInvalido(): boolean {
    return this.campoInvalido('importe');
  }

  protected formaPagoInvalida(): boolean {
    return this.campoInvalido('formaPago');
  }

  protected confirmDisabled(): boolean {
    return this.form.invalid || this.guardando();
  }

  protected onConfirmar(): void {
    const reserva = this.reserva();

    if (!reserva || this.form.invalid || this.guardando()) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: RegistroPagoReservaRequestDto = {
      importe: this.form.controls.importe.value,
      esPagoTotal: this.form.controls.esPagoTotal.value,
      formaPago: this.form.controls.formaPago.value as FormaPago,
      notas: this.form.controls.notas.value || null,
    };

    this.guardando.set(true);

    this.registroPagoReservaService
      .registrarPago(reserva.id, dto)
      .pipe(
        finalize(() => this.guardando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.pagoRegistrado.emit(),
        error: (err) => this.errorHandler.handle(err),
      });
  }

  protected campoInvalido(nombre: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[nombre];
    return control.invalid && (control.dirty || control.touched);
  }
}
