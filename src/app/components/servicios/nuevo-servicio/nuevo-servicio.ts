import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { ServicioService } from '../services/servicio.service';
import { ServicioOptionsService } from '../services/servicio-options.service';
import { ServicioValidacionesService } from '../services/servicio-validaciones.service';

@Component({
  standalone: true,
  selector: 'app-nuevo-servicio',
  imports: [ReactiveFormsModule, PageLayout, FormLayout, FormSection, FormActions, AppButton],
  templateUrl: './nuevo-servicio.html',
  styleUrl: './nuevo-servicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevoServicio {
  private readonly router = inject(Router);
  private readonly servicioService = inject(ServicioService);
  private readonly optionsService = inject(ServicioOptionsService);
  private readonly validaciones = inject(ServicioValidacionesService);

  protected readonly procedencias = toSignal(this.optionsService.getProcedencias(), {
    initialValue: [],
  });
  protected readonly modalidades = toSignal(this.optionsService.getModalidades(), {
    initialValue: [],
  });

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
  ]);

  protected readonly infoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    return this.validaciones.getInfoErrors(this.form, this.submitted());
  });

  protected readonly preciosErrors = computed<Record<string, string>>(() => {
    this.formEvents();
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
    });
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
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/servicios']);
        },
        error: (err) => {
          this.loading.set(false);
          // TODO: reemplazar con manejo de errores centralizado cuando se implemente en el front
          console.error('Error al crear el servicio', err);
        },
      });
  }
}
