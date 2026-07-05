import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { TableStateService } from './table-state.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable()
export class TableExportService {
  private readonly tableState = inject(TableStateService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _exportando = signal(false);

  // 👇 IMPORTANT: esto ahora SÍ es signal usable como exportando()
  readonly exportando = this._exportando;

  readonly puedeExportar = computed(() => {
    return this.tableState.hasResults() && !this.tableState.loading() && !this._exportando();
  });

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
