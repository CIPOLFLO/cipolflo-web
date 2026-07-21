import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';

import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AppButton, CurrencyFormatPipe, toIsoDate } from '../../../shared';
import {
  ClienteRespuestaDto,
  MetodoCobro,
  METODO_COBRO_OPTIONS,
  UltimaCuotaDto,
} from '../models/cliente.model';
import { PagoCuotaResponseDto } from '../models/pago-cuota.model';
import { ClientesService } from '../services/cliente.service';

/** Límites de cuotas que se pueden pagar de una vez (única fuente de verdad). */
const MIN_CUOTAS = 1;
const MAX_CUOTAS = 12;

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

  private readonly clientesService = inject(ClientesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly metodosCobro = METODO_COBRO_OPTIONS;
  protected readonly costoCuota = this.clientesService.getCostoCuota();
  protected readonly pagoConfirmado = signal<PagoCuotaResponseDto[] | null>(null);
  protected readonly hoy = new Date();

  protected readonly form = new FormGroup({
    cantidadCuotas: new FormControl<number>(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(MIN_CUOTAS), Validators.max(MAX_CUOTAS)],
    }),
    metodoCobro: new FormControl<MetodoCobro>(MetodoCobro.Efectivo, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaPago: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    observaciones: new FormControl<string | null>(null),
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  protected readonly cantidadCuotas = toSignal(this.form.controls.cantidadCuotas.valueChanges, {
    initialValue: this.form.controls.cantidadCuotas.value,
  });

  protected readonly fechaPago = toSignal(this.form.controls.fechaPago.valueChanges, {
    initialValue: this.form.controls.fechaPago.value,
  });

  protected readonly confirmDisabled = computed(
    () => this.formStatus() === 'INVALID' || this.fechaEsFutura(),
  );

  protected readonly cantidadInvalida = computed(
    () => this.cantidadCuotas() < MIN_CUOTAS || this.cantidadCuotas() > MAX_CUOTAS,
  );

  protected readonly ultimaCuotaDescripcion = computed(() => {
    return this.cliente()?.ultimaCuotaDto?.descripcion ?? 'Sin cuotas registradas';
  });

  protected readonly periodosCubiertos = computed(() => {
    const cliente = this.cliente();
    const cantidad = this.cantidadCuotas();

    if (!cliente || cantidad < 1) return [];

    const inicio = this.obtenerSiguientePeriodo(cliente.ultimaCuotaDto);

    return Array.from({ length: cantidad }, (_, index) =>
      this.descripcionPeriodo(this.sumarMeses(inicio, index)),
    );
  });

  protected onCancelar(): void {
    this.cerrar();
  }

  protected onConfirmar(): void {
    this.form.markAllAsTouched();

    const cliente = this.cliente();

    if (!cliente || this.form.invalid || this.fechaEsFutura()) return;

    const request = {
      cantidadCuotas: this.form.controls.cantidadCuotas.value,
      importeTotal: this.total(),
      metodoCobro: this.form.controls.metodoCobro.value,
      fechaPago: toIsoDate(this.form.controls.fechaPago.value)!,
      observaciones: this.form.controls.observaciones.value,
    };

    this.clientesService.registrarPagoCuota(cliente.id, request).subscribe({
      next: (response) => {
        this.pagoConfirmado.set(response);
      },
      error: (err) => {
        this.errorHandler.handle(err);
      },
    });
  }

  protected readonly total = computed(() => this.cantidadCuotas() * this.costoCuota);

  protected readonly fechaEsFutura = computed(() => {
    const fechaPago = new Date(this.fechaPago());
    const hoy = new Date();

    fechaPago.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    return fechaPago > hoy;
  });

  protected onAceptar(): void {
    this.cerrar();
  }

  /**
   * Descarga el comprobante desde la misma pantalla "Pago registrado", usando los ids que
   * ya vinieron en la respuesta de registrarPagoCuota (sin consulta adicional al backend).
   * Fire-and-forget: la descarga no bloquea el cierre del diálogo ni se ata al ciclo de
   * vida del componente, que se destruye al cerrar.
   */
  protected onDescargarComprobante(): void {
    const cliente = this.cliente();
    const pagos = this.pagoConfirmado();

    if (cliente && pagos) {
      this.clientesService
        .descargarComprobantePago(
          cliente.id,
          pagos.map((p) => p.id),
        )
        .pipe(
          catchError((err: unknown) => {
            this.errorHandler.handle(err);
            return EMPTY;
          }),
        )
        .subscribe();
    }

    this.cerrar();
  }

  private cerrar(): void {
    this.pagoConfirmado.set(null);
    this.form.reset({
      cantidadCuotas: 1,
      metodoCobro: MetodoCobro.Efectivo,
      fechaPago: new Date(),
      observaciones: null,
    });
    this.cerrado.emit();
  }

  private obtenerSiguientePeriodo(ultimaCuota: UltimaCuotaDto | null): Date {
    if (!ultimaCuota) {
      const hoy = new Date();
      return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }
    return this.sumarMeses(new Date(ultimaCuota.anio, ultimaCuota.mes - 1, 1), 1);
  }

  private sumarMeses(fecha: Date, meses: number): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth() + meses, 1);
  }

  private descripcionPeriodo(fecha: Date): string {
    const nombreMes = fecha.toLocaleDateString('es-UY', { month: 'long' });
    const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

    return `${mesCapitalizado} ${fecha.getFullYear()}`;
  }

  protected readonly descripcionPeriodos = computed(() => {
    const periodos = this.periodosCubiertos();

    if (periodos.length === 0) return '-';

    if (periodos.length <= 2) {
      return periodos.join(', ');
    }

    return `${periodos[0]} - ${periodos[periodos.length - 1]}`;
  });
}
