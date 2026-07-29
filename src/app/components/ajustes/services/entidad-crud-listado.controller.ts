import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmDialogData, ConfirmDialogService, TableStateService } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

/**
 * Centraliza el flujo común de los listados de alta/edición/habilitación/eliminación con
 * diálogo de confirmación (usado por clientes de Telegram y destinatarios de notificación por
 * email). Debe proveerse a nivel de componente, junto a TableStateService, para que cada listado
 * tenga su propia instancia.
 */
@Injectable()
export class EntidadCrudListadoController<T> {
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly tableState = inject(TableStateService);

  readonly dialogVisible = signal(false);
  readonly seleccionado = signal<T | null>(null);

  abrirAlta(): void {
    this.seleccionado.set(null);
    this.dialogVisible.set(true);
  }

  abrirEdicion(entidad: T): void {
    this.seleccionado.set(entidad);
    this.dialogVisible.set(true);
  }

  cerrarDialog(): void {
    this.dialogVisible.set(false);
    this.seleccionado.set(null);
  }

  guardar(request$: Observable<unknown>): void {
    request$.subscribe({
      next: () => {
        this.cerrarDialog();
        this.recargarTabla();
      },
      error: (err) => this.errorHandler.handle(err),
    });
  }

  actualizarYRecargar(request$: Observable<unknown>): void {
    request$.subscribe({
      next: () => this.recargarTabla(),
      error: (err) => this.errorHandler.handle(err),
    });
  }

  eliminarConConfirmacion(
    confirmacion: ConfirmDialogData,
    eliminar: () => Observable<unknown>,
  ): void {
    this.confirmDialogService.open(confirmacion).subscribe((confirmed) => {
      if (!confirmed) return;
      this.actualizarYRecargar(eliminar());
    });
  }

  private recargarTabla(): void {
    // El spread crea una nueva referencia para que el signal detecte el cambio y recargue la tabla
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters });
  }
}
