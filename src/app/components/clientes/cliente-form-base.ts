import {
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
  signal,
  Signal,
} from '@angular/core';
import { FormGroup, PristineChangeEvent } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, map } from 'rxjs';
import { type DetailRegistroData, type FormFieldConfig } from '../../shared';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ClientesService } from './services/cliente.service';
import {
  patchClienteForm,
  applySectionChange,
  markFieldAsTouched,
} from './helpers/cliente-form.helper';
import { ClienteDetalleRespuestaDto, TipoCliente } from './models/cliente.model';
import { ClienteValidacionesService } from './services/cliente-validaciones.service';

@Directive()
export abstract class ClienteFormBase {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly clientesService = inject(ClientesService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly validaciones = inject(ClienteValidacionesService);
  protected readonly errorHandler = inject(ErrorHandlerService);

  readonly id = input<string>('');

  protected readonly cliente = signal<ClienteDetalleRespuestaDto | null>(null);
  protected readonly clienteTipo = computed(() => this.cliente()?.tipoCliente);
  protected readonly esSocio = computed(() => this.clienteTipo() === TipoCliente.Socio);

  protected readonly form!: FormGroup;
  protected readonly formEvents!: Signal<unknown>;
  protected readonly confirmDisabled!: Signal<boolean>;

  protected readonly backLink = computed<string>(() => {
    const from = this.route.snapshot.queryParamMap.get('from');
    return from === 'listado' ? '/clientes' : `/clientes/${this.id()}`;
  });

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  private readonly blurCount = signal(0);

  /** Cuando es true, el botón de confirmar se deshabilita siempre que el form sea inválido.
   *  Cuando es false (por defecto), solo se deshabilita si además está dirty (comportamiento de edición). */
  protected readonly confirmSiempreVerificaValido: boolean = false;

  protected abstract readonly ubicacionFields: Signal<FormFieldConfig[]>;
  protected abstract readonly infoFields: Signal<FormFieldConfig[]>;

  protected readonly adicionalFields = computed<FormFieldConfig[]>(() => {
    const c = this.cliente();
    if (!c) return [];
    return [
      {
        key: 'observaciones',
        label: 'Notas / Observaciones',
        type: 'textarea',
        defaultValue: c.observaciones ?? undefined,
      },
    ];
  });

  protected readonly infoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.blurCount();
    return this.validaciones.getClienteErrors(this.form, this.submitted());
  });

  protected readonly ubicacionErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.blurCount();
    return this.validaciones.getUbicacionErrors(this.form, this.submitted());
  });

  protected readonly adicionalErrors = computed<Record<string, string>>(() => ({}));

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const c = this.cliente();
    if (!c) return null;
    return {
      entityId: `CLI-${String(c.id).padStart(3, '0')}`,
      entityIdLabel: 'ID del Cliente',
      fechaRegistro: c.createdAt,
      registradoPor: c.createdBy,
    };
  });

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(form: FormGroup) {
    this.form = form;
    form.get('cedula')?.addValidators(this.validaciones.cedulaValida.bind(this.validaciones));
    form.get('cedula')?.updateValueAndValidity({ emitEvent: false });
    this.formEvents = toSignal(form.events);

    const formDirty = toSignal(
      form.events.pipe(
        filter((e): e is PristineChangeEvent => e instanceof PristineChangeEvent),
        map(() => form.dirty),
      ),
      { initialValue: false },
    );

    const formInvalid = toSignal(form.statusChanges.pipe(map(() => form.invalid)), {
      initialValue: form.invalid,
    });

    this.confirmDisabled = computed(() => {
      const dirty = formDirty();
      const invalid = formInvalid();
      const invalido = this.confirmSiempreVerificaValido ? invalid : dirty && invalid;
      return invalido || this.loading();
    });
    effect(() => {
      const c = this.cliente();
      if (!c) return;
      patchClienteForm(this.form, c);
    });
  }

  protected cargarCliente(): void {
    const id = Number(this.id());

    if (Number.isNaN(id) || id <= 0) {
      this.router.navigate(['/clientes']);
      return;
    }

    this.clientesService
      .getById(id)
      .pipe(
        catchError((err) => {
          this.errorHandler.handle(err);
          this.router.navigate(['/clientes']);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((c) => {
        if (c) this.cliente.set(c);
      });
  }

  protected onInfoChange(values: Record<string, string | null>): void {
    applySectionChange(this.form, values);
  }

  protected onUbicacionChange(values: Record<string, string | null>): void {
    applySectionChange(this.form, values);
  }

  protected onAdicionalChange(values: Record<string, string | null>): void {
    applySectionChange(this.form, values);
  }

  protected onCancelar(): void {
    this.router.navigateByUrl(this.backLink());
  }

  protected onFieldBlur(key: string): void {
    markFieldAsTouched(this.form, key);
    this.blurCount.update((v) => v + 1);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
  }
}
