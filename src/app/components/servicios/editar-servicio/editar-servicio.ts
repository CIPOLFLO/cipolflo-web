import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import {
  AppButton,
  DetailRegistroSection,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  ErrorHandlerService,
  type DetailRegistroData,
  type FormFieldConfig,
} from '../../../shared';
import { EstadoServicio, type ServicioDetalleRespuestaDto } from '../models/servicio.model';
import { ServicioService } from '../services/servicio.service';
import { ServicioOptionsService } from '../services/servicio-options.service';
import { ServicioValidacionesService } from '../services/servicio-validaciones.service';
import { ServicioPresentacionService } from '../services/servicio-presentacion.service';

@Component({
  standalone: true,
  selector: 'app-editar-servicio',
  imports: [
    ReactiveFormsModule,
    PageLayout,
    FormLayout,
    FormSection,
    FormActions,
    AppButton,
    DetailRegistroSection,
  ],
  templateUrl: './editar-servicio.html',
  styleUrl: './editar-servicio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarServicio implements OnInit {
  private readonly router = inject(Router);
  private readonly servicioService = inject(ServicioService);
  private readonly optionsService = inject(ServicioOptionsService);
  private readonly validaciones = inject(ServicioValidacionesService);
  private readonly presentacion = inject(ServicioPresentacionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly id = input<string>('');
  readonly from = input<string>('');

  protected readonly procedencias = toSignal(this.optionsService.getProcedencias(), {
    initialValue: [],
  });
  protected readonly modalidades = toSignal(this.optionsService.getModalidades(), {
    initialValue: [],
  });

  protected readonly servicio = signal<ServicioDetalleRespuestaDto | null>(null);

  protected readonly form = new FormGroup(
    {
      procedencia: new FormControl<string | null>(null, Validators.required),
      nombre: new FormControl<string | null>(null, Validators.required),
      estado: new FormControl<string | null>(null, Validators.required),
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

  private readonly formEvents = toSignal(this.form.events);

  protected readonly backLink = computed<string>(() =>
    this.from() === 'listado' ? '/servicios' : `/servicios/${this.id()}`,
  );

  protected readonly pageDescription = computed<string>(() => {
    const nombre = this.servicio()?.nombre;
    return nombre
      ? `Modifique los datos del servicio ${nombre}`
      : 'Modifique los datos del servicio';
  });

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly confirmDisabled = signal(false);

  constructor() {
    effect(() => {
      const s = this.servicio();
      if (!s) return;
      this.form.patchValue({
        procedencia: s.procedencia,
        nombre: s.nombre,
        estado: s.estado,
        cantidad: s.cantidad,
        capacidad: s.capacidad,
        precioParticular: s.precioParticular,
        precioSocio: s.precioSocio,
        modalidadPrecio: s.modalidadPrecio,
      });
    });

    effect(() => {
      this.formEvents();
      this.confirmDisabled.set((this.form.dirty && this.form.invalid) || this.loading());
    });
  }

  // Los signal inputs ya tienen el valor de la ruta cuando ngOnInit corre, y el
  // componente se recrea en cada navegación, así que el id siempre es válido aquí.
  ngOnInit(): void {
    this.servicioService
      .getById(Number(this.id()))
      .pipe(
        catchError((err) => {
          this.errorHandler.handle(err);
          this.router.navigate(['/servicios']);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((s) => this.servicio.set(s));
  }

  protected readonly infoFields = computed<FormFieldConfig[]>(() =>
    this.presentacion.getInfoFieldsEditar(this.servicio(), this.procedencias()),
  );

  protected readonly preciosFields = computed<FormFieldConfig[]>(() =>
    this.presentacion.getPreciosFieldsEditar(this.servicio(), this.modalidades()),
  );

  protected readonly infoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    return this.validaciones.getInfoErrors(this.form, this.submitted());
  });

  protected readonly preciosErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    return this.validaciones.getPreciosErrors(this.form, this.submitted());
  });

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const s = this.servicio();
    if (!s) return null;
    return this.presentacion.getRegistroData(s);
  });

  protected onInfoChange(values: Record<string, string | null>): void {
    const toOptionalInt = (v: string | null): number | null => {
      if (!v) return null;
      const n = Number.parseInt(v, 10);
      return Number.isNaN(n) ? null : n;
    };
    const patch: Partial<{
      procedencia: string | null;
      nombre: string | null;
      estado: string | null;
      cantidad: number | null;
      capacidad: number | null;
    }> = {};
    if ('procedencia' in values) patch.procedencia = values['procedencia'] ?? null;
    if ('nombre' in values) patch.nombre = values['nombre'] ?? null;
    if ('estado' in values) patch.estado = values['estado'] ?? null;
    if ('cantidad' in values) patch.cantidad = toOptionalInt(values['cantidad']);
    if ('capacidad' in values) patch.capacidad = toOptionalInt(values['capacidad']);
    this.form.patchValue(patch);
    this.form.markAsDirty();
    for (const key of Object.keys(values)) {
      this.form.get(key)?.markAsTouched();
    }
  }

  protected onPreciosChange(values: Record<string, string | null>): void {
    const toNumber = (v: string | null): number | null => {
      if (v === null || v === '') return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };
    const patch: Partial<{
      precioParticular: number | null;
      precioSocio: number | null;
      modalidadPrecio: string | null;
    }> = {};
    if ('precioParticular' in values) patch.precioParticular = toNumber(values['precioParticular']);
    if ('precioSocio' in values) patch.precioSocio = toNumber(values['precioSocio']);
    if ('modalidadPrecio' in values) patch.modalidadPrecio = values['modalidadPrecio'] ?? null;
    this.form.patchValue(patch);
    this.form.markAsDirty();
    for (const key of Object.keys(values)) {
      this.form.get(key)?.markAsTouched();
    }
  }

  protected onCancelar(): void {
    this.router.navigateByUrl(this.backLink());
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const {
      procedencia,
      nombre,
      estado,
      cantidad,
      capacidad,
      precioParticular,
      precioSocio,
      modalidadPrecio,
    } = this.form.getRawValue();

    this.loading.set(true);
    this.servicioService
      .update(Number(this.id()), {
        procedencia: procedencia!,
        nombre: nombre!.trim(),
        estado: estado as EstadoServicio,
        cantidad,
        capacidad,
        precioParticular: precioParticular!,
        precioSocio: precioSocio!,
        modalidadPrecio: modalidadPrecio!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/servicios', this.id()]);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorHandler.handle(err);
        },
      });
  }
}
