import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { FormFieldConfig, FormFieldOption } from '../../../shared/models/form-field.model';
import { PROCEDENCIA_OPTIONS } from '../../../shared/models/procedencia.model';
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
      options: [{ label: 'Todos', value: '' }, ...PROCEDENCIA_OPTIONS],
    },
    {
      key: 'servicio',
      label: 'Servicio',
      type: 'select',
      placeholder: 'Seleccionar servicio',
      options: this._servicioOptions(),
      disabled: this._servicioDisabled(),
    },
    {
      key: 'cliente',
      label: 'Cliente (Cédula)',
      type: 'text',
      placeholder: 'Buscar por cédula...',
    },
    {
      key: 'estado',
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
      // TODO: reemplazar cuando el backend esté disponible
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
    return { resetKeys: ['servicio'] };
  }

  override onClear(): void {
    this._procedencia.set(null);
  }
}
