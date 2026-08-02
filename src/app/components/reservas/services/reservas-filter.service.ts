import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { FormFieldConfig, FormFieldOption } from '../../../shared/models/form-field.model';
import { Procedencia, PROCEDENCIA_OPTIONS } from '../../../shared/models/procedencia.model';
import { ESTADO_RESERVA_OPTIONS } from '../../../shared/models/estado-reserva.model';
import { ServicioService } from '../../servicios/services/servicio.service';
import { EstadoServicio } from '../../servicios/models/servicio.model';

@Injectable()
export class ReservasFilterService extends FilterConfigProvider {
  private readonly servicioService = inject(ServicioService);

  private readonly _procedencia = signal<string | null>(null);
  private readonly _servicioOptions = signal<FormFieldOption[]>([{ label: 'Todos', value: '' }]);
  private readonly _servicioDisabled = signal(true);

  readonly filterFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'procedencia',
      label: 'Procedencia',
      type: 'select',
      placeholder: 'Seleccionar procedencia',
      // Una reserva pertenece a una sola sede: "Ambos" no es un valor filtrable y se
      // confundía con "Todos" (mismo criterio que servicios-filter.service.ts).
      options: [
        { label: 'Todos', value: '' },
        ...PROCEDENCIA_OPTIONS.filter((option) => option.value !== Procedencia.Ambos),
      ],
    },
    {
      // La key es el nombre del query param: `GET /api/v1/reservas` espera `servicioId`.
      key: 'servicioId',
      label: 'Servicio',
      type: 'select',
      placeholder: 'Seleccionar servicio',
      options: this._servicioOptions(),
      disabled: this._servicioDisabled(),
    },
    {
      key: 'nombreCliente',
      label: 'Nombre de cliente',
      type: 'text',
      placeholder: 'Buscar por nombre...',
    },
    {
      key: 'estadoReserva',
      label: 'Estado',
      type: 'select',
      placeholder: 'Seleccionar estado',
      options: [{ label: 'Todos', value: '' }, ...ESTADO_RESERVA_OPTIONS],
    },
    {
      key: 'fechaDesde',
      label: 'Fecha Entrada Desde',
      type: 'date',
    },
    {
      key: 'fechaHasta',
      label: 'Fecha Salida Hasta',
      type: 'date',
    },
  ]);

  constructor() {
    super();
    effect((onCleanup) => {
      const procedencia = this._procedencia();
      if (!procedencia) {
        this._servicioOptions.set([{ label: 'Todos', value: '' }]);
        this._servicioDisabled.set(true);
        return;
      }
      const sub = this.servicioService
        .getAll({ page: 0, size: 100, filters: { procedencia, estado: EstadoServicio.Habilitado } })
        .pipe(
          map((page) => [
            { label: 'Todos', value: '' },
            ...page.content.map((s) => ({ label: s.nombre, value: String(s.id) })),
          ]),
        )
        .subscribe((options) => {
          this._servicioOptions.set(options);
          this._servicioDisabled.set(false);
        });
      onCleanup(() => sub.unsubscribe());
    });
  }

  override onValueChange(key: string, value: string | null): { resetKeys?: string[] } | void {
    if (key !== 'procedencia') return;
    this._procedencia.set(value || null);
    return { resetKeys: ['servicioId'] };
  }

  override onClear(): void {
    this._procedencia.set(null);
  }
}
