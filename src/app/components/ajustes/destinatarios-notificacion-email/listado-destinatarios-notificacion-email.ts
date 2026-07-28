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
import { DestinatarioNotificacionEmailColumnsService } from '../services/destinatario-notificacion-email-columns.service';
import { DestinatarioNotificacionEmailFilterService } from '../services/destinatario-notificacion-email-filter.service';
import { DestinatarioNotificacionEmailService } from '../services/destinatario-notificacion-email.service';
import { DestinatarioNotificacionEmailResponseDto } from '../models/ajuste.model';
import {
  DestinatarioNotificacionEmailFormDialog,
  DestinatarioNotificacionEmailFormValue,
} from './destinatario-notificacion-email-form-dialog/destinatario-notificacion-email-form-dialog';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  standalone: true,
  selector: 'app-listado-destinatarios-notificacion-email',
  imports: [AppButton, FilterPanel, AppTable, DestinatarioNotificacionEmailFormDialog],
  providers: [
    TableStateService,
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
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly tableState = inject(TableStateService);
  protected readonly columns = this.columnsService.columns;

  protected readonly dialogVisible = signal(false);
  protected readonly destinatarioSeleccionado =
    signal<DestinatarioNotificacionEmailResponseDto | null>(null);

  protected readonly loadDataFn: LoadDataFn<DestinatarioNotificacionEmailResponseDto> = (params) =>
    this.service.getAll(params);

  protected readonly inlineActions = (
    row: DestinatarioNotificacionEmailResponseDto,
  ): InlineAction<DestinatarioNotificacionEmailResponseDto>[] => [
    {
      type: 'button',
      icon: 'pi pi-pencil',
      ariaLabel: () => `Editar destinatario ${row.alias}`,
      command: () => this.onEditar(row),
    },
    {
      type: 'toggle',
      ariaLabel: () => (row.activo ? `Desactivar ${row.alias}` : `Activar ${row.alias}`),
      checked: () => row.activo,
      onChange: (destinatario, checked) => this.onToggleActivo(destinatario, checked),
    },
    {
      type: 'button',
      icon: 'pi pi-trash',
      variant: 'danger',
      ariaLabel: () => `Eliminar destinatario ${row.alias}`,
      command: () => this.onEliminar(row),
    },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onNuevoDestinatario(): void {
    this.destinatarioSeleccionado.set(null);
    this.dialogVisible.set(true);
  }

  protected onEditar(row: DestinatarioNotificacionEmailResponseDto): void {
    this.destinatarioSeleccionado.set(row);
    this.dialogVisible.set(true);
  }

  protected onCancelarDialog(): void {
    this.dialogVisible.set(false);
    this.destinatarioSeleccionado.set(null);
  }

  protected onGuardarDialog(value: DestinatarioNotificacionEmailFormValue): void {
    const seleccionado = this.destinatarioSeleccionado();
    const request$ = seleccionado
      ? this.service.update(seleccionado.id, { alias: value.alias })
      : this.service.create(value);

    request$.subscribe({
      next: () => {
        this.dialogVisible.set(false);
        this.destinatarioSeleccionado.set(null);
        this.recargarTabla();
      },
      error: (err) => this.errorHandler.handle(err),
    });
  }

  private onToggleActivo(row: DestinatarioNotificacionEmailResponseDto, checked: boolean): void {
    this.service.actualizarHabilitacion(row.id, { activo: checked }).subscribe({
      next: () => this.recargarTabla(),
      error: (err) => this.errorHandler.handle(err),
    });
  }

  private onEliminar(row: DestinatarioNotificacionEmailResponseDto): void {
    this.confirmDialogService
      .open({
        title: 'Eliminar destinatario',
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
