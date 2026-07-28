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
import { ClienteTelegramColumnsService } from '../services/cliente-telegram-columns.service';
import { ClienteTelegramFilterService } from '../services/cliente-telegram-filter.service';
import { ClienteTelegramService } from '../services/cliente-telegram.service';
import { EntidadCrudListadoController } from '../services/entidad-crud-listado.controller';
import { ClienteTelegramResponseDto } from '../models/ajuste.model';
import {
  ClienteTelegramFormDialog,
  ClienteTelegramFormValue,
} from './cliente-telegram-form-dialog/cliente-telegram-form-dialog';

@Component({
  standalone: true,
  selector: 'app-listado-clientes-telegram',
  imports: [AppButton, FilterPanel, AppTable, ClienteTelegramFormDialog],
  providers: [
    TableStateService,
    EntidadCrudListadoController,
    ClienteTelegramColumnsService,
    { provide: FilterConfigProvider, useClass: ClienteTelegramFilterService },
  ],
  templateUrl: './listado-clientes-telegram.html',
  styleUrl: './listado-clientes-telegram.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoClientesTelegram {
  private readonly service = inject(ClienteTelegramService);
  private readonly columnsService = inject(ClienteTelegramColumnsService);

  protected readonly tableState = inject(TableStateService);
  protected readonly crud = inject(
    EntidadCrudListadoController,
  ) as EntidadCrudListadoController<ClienteTelegramResponseDto>;
  protected readonly columns = this.columnsService.columns;

  protected readonly loadDataFn: LoadDataFn<ClienteTelegramResponseDto> = (params) =>
    this.service.getAll(params);

  protected readonly inlineActions = (
    row: ClienteTelegramResponseDto,
  ): InlineAction<ClienteTelegramResponseDto>[] => [
    {
      type: 'button',
      icon: 'pi pi-pencil',
      ariaLabel: () => `Editar usuario ${row.alias}`,
      command: () => this.crud.abrirEdicion(row),
    },
    {
      type: 'toggle',
      ariaLabel: () => (row.activo ? `Desactivar ${row.alias}` : `Activar ${row.alias}`),
      checked: () => row.activo,
      onChange: (cliente, checked) =>
        this.crud.actualizarYRecargar(
          this.service.actualizarHabilitacion(cliente.id, { activo: checked }),
        ),
    },
    {
      type: 'button',
      icon: 'pi pi-trash',
      variant: 'danger',
      ariaLabel: () => `Eliminar usuario ${row.alias}`,
      command: () =>
        this.crud.eliminarConConfirmacion(
          {
            title: 'Eliminar usuario autorizado',
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

  protected onGuardarDialog(value: ClienteTelegramFormValue): void {
    const seleccionado = this.crud.seleccionado();
    // recibeNotificaciones es obligatorio en el PUT del backend, pero las notificaciones por
    // Telegram todavía no están implementadas: se fija en true para todos los clientes.
    const request$ = seleccionado
      ? this.service.update(seleccionado.id, { alias: value.alias, recibeNotificaciones: true })
      : this.service.create(value);

    this.crud.guardar(request$);
  }
}
