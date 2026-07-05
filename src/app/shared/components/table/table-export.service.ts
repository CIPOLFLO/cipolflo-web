import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { TableStateService } from './table-state.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

/**
 * Centraliza el estado de exportación de un listado (exportando/puedeExportar) y el
 * manejo de éxito/error de la descarga. Debe proveerse a nivel de componente (no root),
 * igual que TableStateService, para que cada listado tenga su propia instancia.
 */
@Injectable()
export class TableExportService {
  private readonly tableState = inject(TableStateService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _exportando = signal(false);
  readonly exportando = this._exportando.asReadonly();
  readonly puedeExportar = computed(
    () => this.tableState.hasResults() && !this.tableState.loading() && !this._exportando(),
  );

  exportar(source: () => Observable<void>): void {
    if (!this.puedeExportar()) return;
    this._exportando.set(true);
    source()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this._exportando.set(false),
        error: (err) => {
          this._exportando.set(false);
          this.errorHandler.handle(err);
        },
      });
  }
}
