import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AppButton,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  type FormFieldConfig,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ServicioService } from '../services/servicio.service';
import { ServicioOptionsService } from '../services/servicio-options.service';
import { ServicioValidacionesService } from '../services/servicio-validaciones.service';
import { TarifaValidacionesService } from '../services/tarifa-validaciones.service';
import {
  TarifaServicioRequestDto,
  TIPO_CLIENTE_TARIFA_OPTIONS,
  TipoClienteTarifa,
} from '../models/servicio.model';
import {
  TarifasForm,
  crearTarifaFormGroup,
  type TarifaFormGroup,
} from '../components/tarifas-form/tarifas-form';

@Component({
  standalone: true,
  selector: 'app-nuevo-servicio',
  imports: [
    ReactiveFormsModule,
    PageLayout,
    FormLayout,
    FormSection,
    FormActions,
    AppButton,
    TarifasForm,
  ],
  templateUrl: './nuevo-servicio.html',
  styleUrl: './nuevo-servicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevoServicio {
  private readonly router = inject(Router);
  private readonly servicioService = inject(ServicioService);
  private readonly optionsService = inject(ServicioOptionsService);
  private readonly validaciones = inject(ServicioValidacionesService);
  private readonly tarifaValidaciones = inject(TarifaValidacionesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly procedencias = toSignal(this.optionsService.getProcedencias(), {
    initialValue: [],
  });
  protected readonly modalidades = toSignal(this.optionsService.getModalidades(), {
    initialValue: [],
  });
  protected readonly tiposClienteTarifa = TIPO_CLIENTE_TARIFA_OPTIONS;

  protected readonly tarifas = new FormArray<TarifaFormGroup>(
    [],
    [Validators.required, (a) => this.tarifaValidaciones.obligatoriasFaltantes(a)],
  );

  constructor() {
    // Particular y Socio Común son obligatorios: se precargan fijas de entrada (tipo bloqueado,
    // sin poder eliminarse), sin importar cuántas otras filas se agreguen después.
    const particular = crearTarifaFormGroup(null, true);
    particular.controls.tipoCliente.setValue(TipoClienteTarifa.Particular);
    const socioComun = crearTarifaFormGroup(null, true);
    socioComun.controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);
    this.tarifas.push(particular);
    this.tarifas.push(socioComun);
  }

  protected readonly form = new FormGroup(
    {
      procedencia: new FormControl<string | null>(null, Validators.required),
      nombre: new FormControl<string | null>(null, Validators.required),
      cantidad: new FormControl<number | null>(null),
      capacidad: new FormControl<number | null>(null),
      precioParticular: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      precioSocio: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      modalidadPrecio: new FormControl<string | null>(null, Validators.required),
      costoPersonaExtra: new FormControl<number | null>(null, Validators.min(0)),
      tarifas: this.tarifas,
    },
    {
      validators: [
        (g) => this.validaciones.cantidadOCapacidadExcluyentes(g),
        (g) => this.validaciones.precioSocioMenorQueParticular(g),
      ],
    },
  );

  // Un único stream reactivo para valores, estado y touched — cubre todos los casos
  private readonly formEvents = toSignal(this.form.events);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  private readonly touchCount = signal(0);

  protected agregarTarifa(): void {
    this.tarifas.push(crearTarifaFormGroup());
    this.form.markAsDirty();
  }

  protected quitarTarifa(index: number): void {
    this.tarifas.removeAt(index);
    this.form.markAsDirty();
  }

  private obtenerTarifasDto(): TarifaServicioRequestDto[] {
    return this.tarifas.controls.map((tarifa) => {
      const { tipoCliente, precio, modalidadPrecio, antiguedadMinima, antiguedadMaxima } =
        tarifa.getRawValue();

      return {
        tipoCliente: tipoCliente!,
        precio: precio!,
        modalidadPrecio: modalidadPrecio!,
        antiguedadMinima,
        antiguedadMaxima,
      };
    });
  }
  protected readonly confirmDisabled = computed(() => {
    this.formEvents();
    return this.form.invalid || this.loading();
  });

  // ── Configs de campos ────────────────────────────────────────────────────
  protected readonly infoFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'procedencia',
      label: 'Procedencia',
      type: 'select',
      required: true,
      placeholder: 'Seleccionar procedencia',
      options: this.procedencias(),
    },
    {
      key: 'nombre',
      label: 'Nombre del Servicio',
      type: 'text',
      required: true,
      placeholder: 'Ej: Alquiler de cabaña, Tour guiado...',
    },
    {
      key: 'cantidad',
      label: 'Cantidad',
      type: 'number',
      placeholder: 'Ej: 5',
    },
    {
      key: 'capacidad',
      label: 'Capacidad',
      type: 'number',
      placeholder: 'Ej: 10',
    },
  ]);

  protected readonly preciosFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'precioParticular',
      label: 'Precio para Particulares',
      type: 'currency',
      required: true,
      placeholder: '0.00',
    },
    {
      key: 'precioSocio',
      label: 'Precio para Socios',
      type: 'currency',
      required: true,
      placeholder: '0.00',
    },
    {
      key: 'modalidadPrecio',
      label: 'Tipo de Cobro',
      type: 'select',
      required: true,
      placeholder: 'Seleccionar tipo de cobro',
      options: this.modalidades(),
    },
    {
      key: 'costoPersonaExtra',
      label: 'Costo por persona extra',
      type: 'currency',
      placeholder: '0.00',
    },
  ]);

  protected readonly infoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.touchCount();
    return this.validaciones.getInfoErrors(this.form, this.submitted());
  });

  protected readonly preciosErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.touchCount();
    return this.validaciones.getPreciosErrors(this.form, this.submitted());
  });

  // ── Sincronización de secciones con el FormGroup ─────────────────────────
  protected onInfoChange(values: Record<string, string | null>): void {
    const toOptionalInt = (v: string | null): number | null => {
      if (!v) return null;
      const n = Number.parseInt(v, 10);
      return Number.isNaN(n) ? null : n;
    };
    this.form.patchValue({
      procedencia: values['procedencia'] ?? null,
      nombre: values['nombre'] ?? null,
      cantidad: toOptionalInt(values['cantidad']),
      capacidad: toOptionalInt(values['capacidad']),
    });
    this.form.markAsDirty();
  }

  protected onPreciosChange(values: Record<string, string | null>): void {
    const toNumber = (v: string | null): number | null => {
      if (v === null || v === '') return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };
    this.form.patchValue({
      precioParticular: toNumber(values['precioParticular']),
      precioSocio: toNumber(values['precioSocio']),
      modalidadPrecio: values['modalidadPrecio'] ?? null,
      costoPersonaExtra: toNumber(values['costoPersonaExtra']),
    });
    this.form.markAsDirty();
  }

  protected onFieldBlur(key: string): void {
    this.form.get(key)?.markAsTouched();
    this.touchCount.update((n) => n + 1);
  }

  protected onCancelar(): void {
    this.router.navigate(['/servicios']);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const {
      procedencia,
      nombre,
      cantidad,
      capacidad,
      precioParticular,
      precioSocio,
      modalidadPrecio,
      costoPersonaExtra,
    } = this.form.getRawValue();

    this.loading.set(true);
    this.servicioService
      .create({
        procedencia: procedencia!,
        nombre: nombre!.trim(),
        cantidad,
        capacidad,
        precioParticular: precioParticular!,
        precioSocio: precioSocio!,
        modalidadPrecio: modalidadPrecio!,
        costoPersonaExtra,
        tarifas: this.obtenerTarifasDto(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/servicios']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorHandler.handle(err);
        },
      });
  }
}
