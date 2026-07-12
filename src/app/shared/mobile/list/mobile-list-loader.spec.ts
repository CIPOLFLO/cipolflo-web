import { Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoadDataFn, PageResponse } from '../../components/table/table.models';
import { TableStateService } from '../../components/table/table-state.service';
import { MobileListLoader } from './mobile-list-loader';

interface Row {
  id: number;
}

function pageFor(page: number): PageResponse<Row> {
  const isLast = page >= 1;
  return {
    content: page === 0 ? [{ id: 1 }, { id: 2 }] : [{ id: 3 }],
    page,
    size: 2,
    totalElements: 3,
    totalPages: 2,
    first: page === 0,
    last: isLast,
  };
}

const isMobile = signal(true);
let loadFn: LoadDataFn<Row>;
const errorHandler = { handle: vi.fn() };

@Component({
  selector: 'app-loader-host',
  template: '',
  providers: [TableStateService, MobileListLoader],
})
class LoaderHost {
  readonly tableState = inject(TableStateService);
  readonly loader = inject(MobileListLoader) as MobileListLoader<Row>;

  constructor() {
    this.loader.connect(loadFn, (row) => row);
  }
}

async function createHost(): Promise<ComponentFixture<LoaderHost>> {
  await TestBed.configureTestingModule({
    imports: [LoaderHost],
    providers: [
      { provide: BreakpointService, useValue: { isMobile } },
      { provide: ErrorHandlerService, useValue: errorHandler },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(LoaderHost);
  fixture.detectChanges();
  return fixture;
}

describe('MobileListLoader', () => {
  beforeEach(() => {
    isMobile.set(true);
    loadFn = vi.fn((params) => of(pageFor(params.page)));
    errorHandler.handle.mockClear();
  });

  it('carga la primera página cuando la pantalla es móvil', async () => {
    const { componentInstance } = await createHost();
    expect(componentInstance.loader.rows()).toEqual([{ id: 1 }, { id: 2 }]);
    expect(componentInstance.loader.hasMore()).toBe(true);
    expect(componentInstance.loader.loading()).toBe(false);
  });

  it('no consulta cuando la pantalla no es móvil', async () => {
    isMobile.set(false);
    const { componentInstance } = await createHost();
    expect(loadFn).not.toHaveBeenCalled();
    expect(componentInstance.loader.rows()).toEqual([]);
  });

  it('acumula las filas al pedir la siguiente página', async () => {
    const fixture = await createHost();
    const { loader } = fixture.componentInstance;

    loader.loadMore();
    fixture.detectChanges();

    expect(loader.rows()).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(loader.hasMore()).toBe(false);
  });

  it('loadMore no hace nada si no hay más páginas', async () => {
    const fixture = await createHost();
    const { loader, tableState } = fixture.componentInstance;

    loader.loadMore(); // llega a la última página
    fixture.detectChanges();
    const pageSpy = vi.spyOn(tableState, 'updatePage');

    loader.loadMore(); // ya no hay más

    expect(pageSpy).not.toHaveBeenCalled();
  });

  it('reemplaza la lista al cambiar los filtros (vuelve a página 0)', async () => {
    const fixture = await createHost();
    const { loader, tableState } = fixture.componentInstance;

    loader.loadMore();
    fixture.detectChanges();
    expect(loader.rows().length).toBe(3);

    tableState.updateFilters({ estado: 'ACTIVO' });
    fixture.detectChanges();

    expect(loader.rows()).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('delega el error al ErrorHandlerService y no rompe la lista', async () => {
    loadFn = vi.fn(() => throwError(() => new Error('fallo')));
    const { componentInstance } = await createHost();
    expect(errorHandler.handle).toHaveBeenCalled();
    expect(componentInstance.loader.rows()).toEqual([]);
  });
});
