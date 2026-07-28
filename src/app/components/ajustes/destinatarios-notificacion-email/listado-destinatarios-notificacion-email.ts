import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AppButton,
  AppTable,
  FilterConfigProvider,
  FilterPanel,
  InlineAction,
  LoadDataFn,
  TableStateService,
} from '../../../shared';
import { DestinatarioNotificacionEmailColumnsService } from '../services/destinatario-notificacion-email-columns.service';
import { DestinatarioNotificacionEmailFilterService } from '../services/destinatario-notificacion-email-filter.service';
import { DestinatarioNotificacionEmailService } from '../services/destinatario-notificacion-email.service';
import { EntidadCrudListadoController } from '../services/entidad-crud-listado.controller';
import { DestinatarioNotificacionEmailResponseDto } from '../models/ajuste.model';
import {
  DestinatarioNotificacionEmailFormDialog,
  DestinatarioNotificacionEmailFormValue,
} from './destinatario-notificacion-email-form-dialog/destinatario-notificacion-email-form-dialog';

@Component({
  standalone: true,
  selector: 'app-listado-destinatarios-notificacion-email',
  imports: [AppButton, FilterPanel, AppTable, DestinatarioNotificacionEmailFormDialog],
  providers: [
    TableStateService,
    EntidadCrudListadoController,
    DestinatarioNotificacionEmailColumnsService,
    { provide: FilterConfigProvider, useClass: DestinatarioNotificacionEmailFilterService },
  ],
  templateUrl: './listado-destinatarios-notificacion-email.html',
  styleUrl: './listado-destinatarios-notificacion-email.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoDestinatariosNotificacionEmail {
  private readonly service = inject(DestinatarioNotificacionEmailService);
  private readonly columnsService = inject(DestinatarioNotificacionEmailColumnsService);

  protected readonly tableState = inject(TableStateService);
  protected readonly crud = inject(
    EntidadCrudListadoController,
  ) as EntidadCrudListadoController<DestinatarioNotificacionEmailResponseDto>;
  protected readonly columns = this.columnsService.columns;

  protected readonly loadDataFn: LoadDataFn<DestinatarioNotificacionEmailResponseDto> = (params) =>
    this.service.getAll(params);

  protected readonly inlineActions = (
    row: DestinatarioNotificacionEmailResponseDto,
  ): InlineAction<DestinatarioNotificacionEmailResponseDto>[] => [
    {
      type: 'button',
      icon: 'pi pi-pencil',
      ariaLabel: () => `Editar destinatario ${row.alias}`,
      command: () => this.crud.abrirEdicion(row),
    },
    {
      type: 'toggle',
      ariaLabel: () => (row.activo ? `Desactivar ${row.alias}` : `Activar ${row.alias}`),
      checked: () => row.activo,
      onChange: (destinatario, checked) =>
        this.crud.actualizarYRecargar(
          this.service.actualizarHabilitacion(destinatario.id, { activo: checked }),
        ),
    },
    {
      type: 'button',
      icon: 'pi pi-trash',
      variant: 'danger',
      ariaLabel: () => `Eliminar destinatario ${row.alias}`,
      command: () =>
        this.crud.eliminarConConfirmacion(
          {
            title: 'Eliminar destinatario',
            message: `¿Eliminar definitivamente a "${row.alias}"? Esta acción no se puede deshacer.`,
            confirmButtonLabel: 'Eliminar',
            variant: 'danger',
          },
          () => this.service.eliminar(row.id),
        ),
    },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onGuardarDialog(value: DestinatarioNotificacionEmailFormValue): void {
    const seleccionado = this.crud.seleccionado();
    const request$ = seleccionado
      ? this.service.update(seleccionado.id, { alias: value.alias })
      : this.service.create(value);

    this.crud.guardar(request$);
  }
}
