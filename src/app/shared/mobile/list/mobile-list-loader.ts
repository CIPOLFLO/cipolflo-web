import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, filter, map, of, switchMap, tap } from 'rxjs';

import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoadDataFn } from '../../components/table/table.models';
import { TableStateService } from '../../components/table/table-state.service';

/**
 * Estado de un listado móvil con scroll infinito. Es el análogo móvil de `AppTable`:
 * reutiliza el mismo `TableStateService` (idénticos filtros/paginación que el
 * escritorio) pero, en vez de reemplazar la página, acumula las filas a medida que
 * se solicitan páginas siguientes.
 *
 * Se provee a nivel de componente, junto al `TableStateService`. El componente lo
 * conecta con `connect(loadFn, mapRow)` y expone `rows/hasMore/loading`; la directiva
 * `MobInfiniteScroll` (o cualquier disparador) llama a `loadMore()`.
 */
@Injectable()
export class MobileListLoader<T> {
  private readonly tableState = inject(TableStateService);
  private readonly breakpoint = inject(BreakpointService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _rows = signal<T[]>([]);
  private readonly _hasMore = signal(false);
  private readonly _loading = signal(false);

  readonly rows = this._rows.asReadonly();
  readonly hasMore = this._hasMore.asReadonly();
  readonly loading = this._loading.asReadonly();

  /**
   * Conecta el listado con su origen de datos. Solo consulta cuando la pantalla es
   * móvil; reemplaza la lista al cambiar filtros (página 0) y la acumula al pedir
   * páginas siguientes.
   */
  connect<DTO>(loadFn: LoadDataFn<DTO>, mapRow: (dto: DTO) => T): void {
    combineLatest([
      toObservable(this.breakpoint.isMobile),
      toObservable(this.tableState.queryParams),
    ])
      .pipe(
        filter(([isMobile]) => isMobile),
        tap(() => this._loading.set(true)),
        switchMap(([, params]) =>
          loadFn(params).pipe(
            map((page) => ({ page, esPrimeraPagina: params.page === 0 })),
            catchError((error) => {
              this.errorHandler.handle(error);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        this._loading.set(false);
        if (!resultado) {
          return;
        }

        const filas = resultado.page.content.map(mapRow);
        this._rows.update((prev) => (resultado.esPrimeraPagina ? filas : [...prev, ...filas]));
        this._hasMore.set(!resultado.page.last);
      });
  }

  /** Solicita la siguiente página. Ignora la petición si ya está cargando o no hay más. */
  loadMore(): void {
    if (this._loading() || !this._hasMore()) {
      return;
    }

    this.tableState.updatePage(this.tableState.queryParams().page + 1);
  }
}
