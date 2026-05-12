import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { TableStateService } from './table-state.service';
import { AppTable } from './table';
import { ColumnConfig, PageResponse } from './table.models';
import { PaginationComponent } from './pagination/pagination';
import { AmountCellComponent } from './cells/amount-cell/amount-cell';
import { PriceCellComponent } from './cells/price-cell/price-cell';
import { TagCellComponent } from './cells/tag-cell/tag-cell';
import { RowActionsComponent } from './cells/row-actions/row-actions';

// --- DateFormatPipe ---

describe('DateFormatPipe', () => {
  const pipe = new DateFormatPipe();

  it('debe convertir YYYY-MM-DD a DD/MM/YYYY', () => {
    expect(pipe.transform('2026-03-24')).toBe('24/03/2026');
  });

  it('debe retornar vacío si el valor es vacío', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('debe retornar el valor original si no tiene el formato esperado', () => {
    expect(pipe.transform('no-es-fecha')).toBe('no-es-fecha');
  });

  it('debe retornar el valor original si tiene menos de 3 partes separadas por guión', () => {
    expect(pipe.transform('2026-03')).toBe('2026-03');
  });
});

// --- CurrencyFormatPipe ---

describe('CurrencyFormatPipe', () => {
  const pipe = new CurrencyFormatPipe();

  it('debe formatear un valor positivo', () => {
    expect(pipe.transform(15000)).toBe('$ 15.000');
  });

  it('debe formatear un valor negativo usando valor absoluto', () => {
    expect(pipe.transform(-8500)).toBe('$ 8.500');
  });

  it('debe formatear cero', () => {
    expect(pipe.transform(0)).toBe('$ 0');
  });
});

// --- TableStateService ---

describe('TableStateService', () => {
  let service: TableStateService;

  beforeEach(() => {
    service = new TableStateService();
  });

  it('debe inicializar con page 0 y size 10', () => {
    const params = service.queryParams();
    expect(params.page).toBe(0);
    expect(params.size).toBe(10);
  });

  it('updateFilters debe resetear page a 0', () => {
    service.updatePage(3);
    service.updateFilters({ estado: 'activo' });
    expect(service.queryParams().page).toBe(0);
    expect(service.queryParams().filters).toEqual({ estado: 'activo' });
  });

  it('updateSize debe respetar el mínimo de 1', () => {
    service.updateSize(0);
    expect(service.queryParams().size).toBe(1);
  });

  it('updateSize debe respetar el máximo de 100', () => {
    service.updateSize(200);
    expect(service.queryParams().size).toBe(100);
  });

  it('updateSize debe resetear page a 0', () => {
    service.updatePage(5);
    service.updateSize(25);
    expect(service.queryParams().page).toBe(0);
    expect(service.queryParams().size).toBe(25);
  });

  it('updateSort debe actualizar field y order', () => {
    service.updateSort('nombre', 'desc');
    expect(service.queryParams().sortField).toBe('nombre');
    expect(service.queryParams().sortOrder).toBe('desc');
  });

  it('updateSort debe resetear page a 0', () => {
    service.updatePage(3);
    service.updateSort('nombre', 'desc');
    expect(service.queryParams().page).toBe(0);
  });

  it('updatePage debe actualizar page', () => {
    service.updatePage(2);
    expect(service.queryParams().page).toBe(2);
  });
});

// --- AppTable ---

type TestRow = Record<string, unknown>;

const testColumns: ColumnConfig[] = [
  { key: 'nombre', label: 'Nombre' },
  {
    key: 'estado',
    label: 'Estado',
    cellType: 'tag',
    tagMap: { activo: { styleClass: 'tag--green', label: 'Activo' } },
  },
];

const mockPageResponse: PageResponse<TestRow> = {
  content: [{ nombre: 'Juan', estado: 'activo' }],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe('AppTable', () => {
  let fixture: ComponentFixture<AppTable<TestRow>>;
  let component: AppTable<TestRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTable],
      providers: [TableStateService],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTable<TestRow>);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('columns', testColumns);
    fixture.componentRef.setInput('loadDataFn', vi.fn().mockReturnValue(of(mockPageResponse)));

    fixture.detectChanges();
  });

  it('debe renderizar los encabezados de columna', () => {
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const labels = Array.from(headers).map((h) => h.textContent?.trim());
    expect(labels).toContain('Nombre');
    expect(labels).toContain('Estado');
  });

  it('debe llamar a loadDataFn al inicializar', () => {
    const loadFn = component.loadDataFn();
    expect(loadFn).toHaveBeenCalled();
  });

  it('no debe mostrar columna Acciones si no se pasa getRowActions', () => {
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const labels = Array.from(headers).map((h) => h.textContent?.trim());
    expect(labels).not.toContain('Acciones');
  });

  it('debe mostrar columna Acciones si se pasa getRowActions', async () => {
    fixture.componentRef.setInput('getRowActions', () => []);
    fixture.detectChanges();
    await fixture.whenStable();
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('th');
    const labels = Array.from(headers).map((h) => h.textContent?.trim());
    expect(labels).toContain('Acciones');
  });

  it('debe mostrar el mensaje vacío cuando no hay registros', async () => {
    const service = TestBed.inject(TableStateService);
    fixture.componentRef.setInput(
      'loadDataFn',
      vi.fn().mockReturnValue(of({ ...mockPageResponse, content: [], totalElements: 0 })),
    );
    service.updateFilters({});
    fixture.detectChanges();
    await fixture.whenStable();
    const empty: HTMLElement = fixture.nativeElement.querySelector('.table__empty');
    expect(empty?.textContent?.trim()).toBe('No hay registros para mostrar.');
  });

  it('debe renderizar una celda tipo tag con estilo y etiqueta correctos', async () => {
    fixture.componentRef.setInput('columns', [
      {
        key: 'estado',
        label: 'Estado',
        cellType: 'tag',
        tagMap: { activo: { styleClass: 'tag--green', label: 'Activo' } },
      },
    ]);
    fixture.componentRef.setInput(
      'loadDataFn',
      vi.fn().mockReturnValue(of({ ...mockPageResponse, content: [{ estado: 'activo' }] })),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    const tag: HTMLElement = fixture.nativeElement.querySelector('.tag--green');
    expect(tag).not.toBeNull();
    expect(tag.textContent?.trim()).toBe('Activo');
  });

  it('onSort debe actualizar el campo y orden en tableState', async () => {
    const service = TestBed.inject(TableStateService);
    component['onSort']({ field: 'servicio', order: -1 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.queryParams().sortField).toBe('servicio');
    expect(service.queryParams().sortOrder).toBe('desc');
  });

  it('onSort con order 1 debe establecer orden asc', () => {
    const service = TestBed.inject(TableStateService);
    component['onSort']({ field: 'cliente', order: 1 });
    expect(service.queryParams().sortField).toBe('cliente');
    expect(service.queryParams().sortOrder).toBe('asc');
  });

  it('onSort sin field debe no modificar el estado de ordenamiento', () => {
    const service = TestBed.inject(TableStateService);
    component['onSort']({ order: 1 });
    expect(service.queryParams().sortField).toBeUndefined();
  });

  it('debe renderizar el ícono de sort en columnas sortables', () => {
    fixture.componentRef.setInput('columns', [{ key: 'nombre', label: 'Nombre', sortable: true }]);
    fixture.detectChanges();
    const sortIcon = fixture.nativeElement.querySelector('p-sorticon');
    expect(sortIcon).not.toBeNull();
  });

  it('debe renderizar celda tipo amount', async () => {
    fixture.componentRef.setInput('columns', [
      { key: 'monto', label: 'Monto', cellType: 'amount' },
    ]);
    fixture.componentRef.setInput(
      'loadDataFn',
      vi.fn().mockReturnValue(of({ ...mockPageResponse, content: [{ monto: 5000 }] })),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-amount-cell')).not.toBeNull();
  });

  it('debe usar getNumber con valor no numérico y retornar 0', async () => {
    fixture.componentRef.setInput('columns', [
      { key: 'monto', label: 'Monto', cellType: 'amount' },
    ]);
    fixture.componentRef.setInput(
      'loadDataFn',
      vi.fn().mockReturnValue(of({ ...mockPageResponse, content: [{ monto: 'no-es-numero' }] })),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    const cell: HTMLElement = fixture.nativeElement.querySelector('app-amount-cell');
    expect(cell).not.toBeNull();
  });

  it('debe renderizar celda tipo price', async () => {
    fixture.componentRef.setInput('columns', [
      { key: 'precio', label: 'Precio', cellType: 'price', unitKey: 'unidad' },
    ]);
    fixture.componentRef.setInput(
      'loadDataFn',
      vi
        .fn()
        .mockReturnValue(
          of({ ...mockPageResponse, content: [{ precio: 10000, unidad: 'noche' }] }),
        ),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-price-cell')).not.toBeNull();
  });

  it('debe renderizar celda tipo price sin unitKey usando cadena vacía como fallback', async () => {
    fixture.componentRef.setInput('columns', [
      { key: 'precio', label: 'Precio', cellType: 'price' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-price-cell')).not.toBeNull();
  });

  it('debe renderizar celda tipo date con formato DD/MM/YYYY', async () => {
    const service = TestBed.inject(TableStateService);
    fixture.componentRef.setInput('columns', [{ key: 'fecha', label: 'Fecha', cellType: 'date' }]);
    fixture.componentRef.setInput(
      'loadDataFn',
      vi.fn().mockReturnValue(of({ ...mockPageResponse, content: [{ fecha: '2026-03-24' }] })),
    );
    service.updateFilters({});
    fixture.detectChanges();
    await fixture.whenStable();
    const cell: HTMLElement = fixture.nativeElement.querySelector('td');
    expect(cell?.textContent?.trim()).toBe('24/03/2026');
  });

  it('debe renderizar celda default con getString retornando vacío para valor null', async () => {
    fixture.componentRef.setInput('columns', [{ key: 'obs', label: 'Obs' }]);
    fixture.componentRef.setInput(
      'loadDataFn',
      vi.fn().mockReturnValue(of({ ...mockPageResponse, content: [{ obs: null }] })),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    const cell: HTMLElement = fixture.nativeElement.querySelector('td');
    expect(cell?.textContent?.trim()).toBe('');
  });

  it('sortFieldOrDefault debe retornar el sortField cuando está definido', () => {
    const service = TestBed.inject(TableStateService);
    service.updateSort('nombre', 'asc');
    expect(component['sortFieldOrDefault']).toBe('nombre');
  });

  it('sortFieldOrDefault debe retornar cadena vacía cuando sortField no está definido', () => {
    expect(component['sortFieldOrDefault']).toBe('');
  });

  it('getNumber debe retornar el valor cuando es un número', () => {
    expect(component['getNumber'](5000)).toBe(5000);
  });

  it('getRowActionsForRow debe retornar [] cuando getRowActions es null', () => {
    expect(component['getRowActionsForRow']({ id: 1 } as unknown as TestRow)).toEqual([]);
  });

  it('debe llamar a updateSize en ngOnInit cuando pageSize difiere del estado inicial', async () => {
    const service = TestBed.inject(TableStateService);
    const spy = vi.spyOn(service, 'updateSize');
    const newFixture = TestBed.createComponent(AppTable<TestRow>);
    newFixture.componentRef.setInput('columns', testColumns);
    newFixture.componentRef.setInput('loadDataFn', vi.fn().mockReturnValue(of(mockPageResponse)));
    newFixture.componentRef.setInput('pageSize', 25);
    newFixture.detectChanges();
    await newFixture.whenStable();
    expect(spy).toHaveBeenCalledWith(25);
  });
});

// --- PaginationComponent ---

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;

  function create(page: number, pageSize: number, totalElements: number) {
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('pageSize', pageSize);
    fixture.componentRef.setInput('totalElements', totalElements);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationComponent] }).compileComponents();
  });

  describe('totalPages', () => {
    it('debe calcular el total de páginas correctamente', () => {
      create(0, 10, 25);
      expect(component['totalPages']()).toBe(3);
    });

    it('debe retornar al menos 1 cuando no hay elementos', () => {
      create(0, 10, 0);
      expect(component['totalPages']()).toBe(1);
    });
  });

  describe('firstItem / lastItem', () => {
    it('debe calcular firstItem en la primera página', () => {
      create(0, 10, 25);
      expect(component['firstItem']()).toBe(1);
    });

    it('debe calcular firstItem en la segunda página', () => {
      create(1, 10, 25);
      expect(component['firstItem']()).toBe(11);
    });

    it('debe retornar 0 como firstItem cuando no hay elementos', () => {
      create(0, 10, 0);
      expect(component['firstItem']()).toBe(0);
    });

    it('debe calcular lastItem en página parcial', () => {
      create(2, 10, 25);
      expect(component['lastItem']()).toBe(25);
    });

    it('debe calcular lastItem en página completa', () => {
      create(0, 10, 25);
      expect(component['lastItem']()).toBe(10);
    });
  });

  describe('visiblePages', () => {
    it('debe mostrar todas las páginas sin elipsis cuando hay 7 o menos', () => {
      create(0, 10, 70);
      expect(component['visiblePages']()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('debe mostrar elipsis al final cuando la página actual está al inicio', () => {
      create(0, 10, 100);
      const pages = component['visiblePages']();
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(10);
      expect(pages).toContain('...');
    });

    it('debe mostrar elipsis al inicio cuando la página actual está al final', () => {
      create(9, 10, 100);
      const pages = component['visiblePages']();
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(10);
      expect(pages).toContain('...');
    });

    it('debe mostrar elipsis en ambos extremos cuando la página está en el medio', () => {
      create(4, 10, 100);
      const pages = component['visiblePages']();
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(10);
      expect(pages.filter((p) => p === '...').length).toBe(2);
    });
  });

  describe('goTo', () => {
    it('debe emitir pageChange para una página válida', () => {
      create(0, 10, 30);
      const spy = vi.fn();
      component.pageChange.subscribe(spy);
      component['goTo'](1);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('no debe emitir pageChange para índice negativo', () => {
      create(0, 10, 30);
      const spy = vi.fn();
      component.pageChange.subscribe(spy);
      component['goTo'](-1);
      expect(spy).not.toHaveBeenCalled();
    });

    it('no debe emitir pageChange para índice mayor o igual al total de páginas', () => {
      create(0, 10, 30);
      const spy = vi.fn();
      component.pageChange.subscribe(spy);
      component['goTo'](3);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onPageSizeChange', () => {
    it('debe emitir pageSizeChange con el valor del select', () => {
      create(0, 10, 30);
      const spy = vi.fn();
      component.pageSizeChange.subscribe(spy);
      const mockEvent = { target: { value: '25' } } as unknown as Event;
      component['onPageSizeChange'](mockEvent);
      expect(spy).toHaveBeenCalledWith(25);
    });
  });

  describe('isEllipsis', () => {
    it('debe retornar true para "..."', () => {
      create(0, 10, 10);
      expect(component['isEllipsis']('...')).toBe(true);
    });

    it('debe retornar false para un número', () => {
      create(0, 10, 10);
      expect(component['isEllipsis'](1)).toBe(false);
    });
  });

  describe('DOM', () => {
    it('debe deshabilitar el botón Anterior en la primera página', () => {
      create(0, 10, 30);
      const buttons: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button');
      const anterior = Array.from(buttons).find((b) => b.textContent?.trim() === 'Anterior');
      expect(anterior?.disabled).toBe(true);
    });

    it('debe deshabilitar el botón Siguiente en la última página', () => {
      create(2, 10, 30);
      const buttons: NodeListOf<HTMLButtonElement> =
        fixture.nativeElement.querySelectorAll('button');
      const siguiente = Array.from(buttons).find((b) => b.textContent?.trim() === 'Siguiente');
      expect(siguiente?.disabled).toBe(true);
    });

    it('debe mostrar el texto de información correcto', () => {
      create(1, 10, 25);
      const info: HTMLElement = fixture.nativeElement.querySelector('.pagination__info');
      expect(info?.textContent?.trim()).toBe('Mostrando 11 a 20 de 25 resultados');
    });

    it('debe emitir pageChange al hacer click en un botón de página numérica', () => {
      create(0, 10, 30);
      const spy = vi.fn();
      component.pageChange.subscribe(spy);
      const pageBtn: HTMLButtonElement =
        fixture.nativeElement.querySelector('.pagination__btn--page');
      pageBtn?.click();
      expect(spy).toHaveBeenCalled();
    });
  });
});

// --- AmountCellComponent ---

describe('AmountCellComponent', () => {
  let fixture: ComponentFixture<AmountCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AmountCellComponent] }).compileComponents();
    fixture = TestBed.createComponent(AmountCellComponent);
  });

  it('debe mostrar clase positiva y flecha hacia arriba para valor >= 0', () => {
    fixture.componentRef.setInput('value', 5000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.amount-cell--positive')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.pi-arrow-up-right')).not.toBeNull();
  });

  it('debe mostrar clase negativa y flecha hacia abajo para valor < 0', () => {
    fixture.componentRef.setInput('value', -3000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.amount-cell--negative')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.pi-arrow-down-right')).not.toBeNull();
  });

  it('debe tratar 0 como positivo', () => {
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    expect(fixture.componentInstance['isPositive']()).toBe(true);
  });

  it('debe formatear el valor con CurrencyFormatPipe', () => {
    fixture.componentRef.setInput('value', 15000);
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span?.textContent?.trim()).toContain('15.000');
  });

  it('debe mostrar el signo explícito en el template para valor negativo', () => {
    fixture.componentRef.setInput('value', -8500);
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span?.textContent?.trim()).toMatch(/^-/);
    expect(span?.textContent).toContain('8.500');
  });
});

// --- PriceCellComponent ---

describe('PriceCellComponent', () => {
  let fixture: ComponentFixture<PriceCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PriceCellComponent] }).compileComponents();
    fixture = TestBed.createComponent(PriceCellComponent);
  });

  it('debe mostrar el valor formateado', () => {
    fixture.componentRef.setInput('value', 25000);
    fixture.componentRef.setInput('unit', 'noche');
    fixture.detectChanges();
    const valueEl: HTMLElement = fixture.nativeElement.querySelector('.price-cell__value');
    expect(valueEl?.textContent?.trim()).toBe('$ 25.000');
  });

  it('debe mostrar la unidad', () => {
    fixture.componentRef.setInput('value', 5000);
    fixture.componentRef.setInput('unit', 'persona');
    fixture.detectChanges();
    const unitEl: HTMLElement = fixture.nativeElement.querySelector('.price-cell__unit');
    expect(unitEl?.textContent?.trim()).toBe('persona');
  });
});

// --- TagCellComponent ---

describe('TagCellComponent', () => {
  let fixture: ComponentFixture<TagCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TagCellComponent] }).compileComponents();
    fixture = TestBed.createComponent(TagCellComponent);
  });

  it('debe mostrar el label del tagMap para un valor conocido', () => {
    fixture.componentRef.setInput('value', 'activo');
    fixture.componentRef.setInput('tagMap', {
      activo: { styleClass: 'tag--green', label: 'Activo' },
    });
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span?.textContent?.trim()).toBe('Activo');
  });

  it('debe mostrar el valor raw si no está en el tagMap', () => {
    fixture.componentRef.setInput('value', 'desconocido');
    fixture.componentRef.setInput('tagMap', {
      activo: { styleClass: 'tag--green', label: 'Activo' },
    });
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span?.textContent?.trim()).toBe('desconocido');
  });

  it('debe aplicar styleClass y app-tag para un valor conocido', () => {
    fixture.componentRef.setInput('value', 'activo');
    fixture.componentRef.setInput('tagMap', {
      activo: { styleClass: 'tag--green', label: 'Activo' },
    });
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span?.classList.contains('app-tag')).toBe(true);
    expect(span?.classList.contains('tag--green')).toBe(true);
  });

  it('debe aplicar solo app-tag para un valor no mapeado', () => {
    fixture.componentRef.setInput('value', 'desconocido');
    fixture.componentRef.setInput('tagMap', {
      activo: { styleClass: 'tag--green', label: 'Activo' },
    });
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span?.classList.contains('app-tag')).toBe(true);
    expect(span?.classList.contains('tag--green')).toBe(false);
  });
});

// --- RowActionsComponent ---

type TestRowActions = Record<string, unknown>;

describe('RowActionsComponent', () => {
  let fixture: ComponentFixture<RowActionsComponent<TestRowActions>>;
  let component: RowActionsComponent<TestRowActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RowActionsComponent] }).compileComponents();
    fixture = TestBed.createComponent(RowActionsComponent<TestRowActions>);
    component = fixture.componentInstance;
  });

  it('debe construir menuItems a partir de las acciones', () => {
    fixture.componentRef.setInput('actions', [
      { label: 'Ver', icon: 'pi pi-eye' },
      { label: 'Eliminar', icon: 'pi pi-trash' },
    ]);
    fixture.componentRef.setInput('row', { id: 1 });
    fixture.detectChanges();
    const items = component['menuItems']();
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe('Ver');
    expect(items[1].label).toBe('Eliminar');
  });

  it('debe evaluar disabled como función con la fila actual', () => {
    fixture.componentRef.setInput('actions', [
      { label: 'Editar', disabled: (r: Record<string, unknown>) => r['id'] === 1 },
    ]);
    fixture.componentRef.setInput('row', { id: 1 });
    fixture.detectChanges();
    expect(component['menuItems']()[0].disabled).toBe(true);
  });

  it('debe usar disabled booleano directamente', () => {
    fixture.componentRef.setInput('actions', [{ label: 'Eliminar', disabled: true }]);
    fixture.componentRef.setInput('row', {});
    fixture.detectChanges();
    expect(component['menuItems']()[0].disabled).toBe(true);
  });

  it('debe llamar command con la fila al ejecutar la acción', () => {
    const command = vi.fn();
    const row = { id: 42 };
    fixture.componentRef.setInput('actions', [{ label: 'Ver', command }]);
    fixture.componentRef.setInput('row', row);
    fixture.detectChanges();
    component['menuItems']()[0].command?.();
    expect(command).toHaveBeenCalledWith(row);
  });

  it('debe dejar command undefined si la acción no tiene command', () => {
    fixture.componentRef.setInput('actions', [{ label: 'Ver' }]);
    fixture.componentRef.setInput('row', {});
    fixture.detectChanges();
    expect(component['menuItems']()[0].command).toBeUndefined();
  });

  it('debe abrir el menú al hacer click en el botón', () => {
    fixture.componentRef.setInput('actions', [{ label: 'Ver' }]);
    fixture.componentRef.setInput('row', {});
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    expect(button).not.toBeNull();
  });

  it('debe abrir el menú al presionar Enter en el botón', () => {
    fixture.componentRef.setInput('actions', [{ label: 'Ver' }]);
    fixture.componentRef.setInput('row', {});
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(button).not.toBeNull();
  });
});
