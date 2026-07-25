import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AppButton,
  AppTable,
  ConfirmDialogService,
  FilterConfigProvider,
  FilterPanel,
  InlineAction,
  LoadDataFn,
  TableStateService,
} from '../../../shared';
import { ClienteTelegramColumnsService } from '../services/cliente-telegram-columns.service';
import { ClienteTelegramFilterService } from '../services/cliente-telegram-filter.service';
import { ClienteTelegramService } from '../services/cliente-telegram.service';
import { ClienteTelegramResponseDto } from '../models/ajuste.model';
import {
  ClienteTelegramFormDialog,
  ClienteTelegramFormValue,
} from './cliente-telegram-form-dialog/cliente-telegram-form-dialog';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  standalone: true,
  selector: 'app-listado-clientes-telegram',
  imports: [AppButton, FilterPanel, AppTable, ClienteTelegramFormDialog],
  providers: [
    TableStateService,
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
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly tableState = inject(TableStateService);
  protected readonly columns = this.columnsService.columns;

  protected readonly dialogVisible = signal(false);
  protected readonly clienteSeleccionado = signal<ClienteTelegramResponseDto | null>(null);

  protected readonly loadDataFn: LoadDataFn<ClienteTelegramResponseDto> = (params) =>
    this.service.getAll(params);

  protected readonly inlineActions = (
    row: ClienteTelegramResponseDto,
  ): InlineAction<ClienteTelegramResponseDto>[] => [
    {
      type: 'button',
      icon: 'pi pi-pencil',
      ariaLabel: () => `Editar cliente ${row.alias}`,
      command: () => this.onEditar(row),
    },
    {
      type: 'toggle',
      ariaLabel: () => (row.activo ? `Desactivar ${row.alias}` : `Activar ${row.alias}`),
      checked: () => row.activo,
      onChange: (cliente, checked) => this.onToggleActivo(cliente, checked),
    },
    {
      type: 'button',
      icon: 'pi pi-trash',
      variant: 'danger',
      ariaLabel: () => `Eliminar cliente ${row.alias}`,
      command: () => this.onEliminar(row),
    },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onNuevoCliente(): void {
    this.clienteSeleccionado.set(null);
    this.dialogVisible.set(true);
  }

  protected onEditar(row: ClienteTelegramResponseDto): void {
    this.clienteSeleccionado.set(row);
    this.dialogVisible.set(true);
  }

  protected onCancelarDialog(): void {
    this.dialogVisible.set(false);
    this.clienteSeleccionado.set(null);
  }

  protected onGuardarDialog(value: ClienteTelegramFormValue): void {
    const seleccionado = this.clienteSeleccionado();
    const request$ = seleccionado
      ? this.service.update(seleccionado.id, {
          alias: value.alias,
          recibeNotificaciones: value.recibeNotificaciones,
        })
      : this.service.create(value);

    request$.subscribe({
      next: () => {
        this.dialogVisible.set(false);
        this.clienteSeleccionado.set(null);
        this.recargarTabla();
      },
      error: (err) => this.errorHandler.handle(err),
    });
  }

  private onToggleActivo(row: ClienteTelegramResponseDto, checked: boolean): void {
    this.service.actualizarHabilitacion(row.id, { activo: checked }).subscribe({
      next: () => this.recargarTabla(),
      error: (err) => this.errorHandler.handle(err),
    });
  }

  private onEliminar(row: ClienteTelegramResponseDto): void {
    this.confirmDialogService
      .open({
        title: 'Eliminar cliente autorizado',
        message: `¿Eliminar definitivamente a "${row.alias}"? Esta acción no se puede deshacer.`,
        confirmButtonLabel: 'Eliminar',
        variant: 'danger',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.service.eliminar(row.id).subscribe({
          next: () => this.recargarTabla(),
          error: (err) => this.errorHandler.handle(err),
        });
      });
  }

  private recargarTabla(): void {
    // El spread crea una nueva referencia para que el signal detecte el cambio y recargue la tabla
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters });
  }
}
