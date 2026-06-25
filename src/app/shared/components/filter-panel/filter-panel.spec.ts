import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { FilterPanel } from './filter-panel';
import { FilterConfigProvider } from '../../services/filter-config.provider';
import { FormFieldConfig } from '../../models/form-field.model';

interface FilterPanelTestApi {
  updateValue(key: string, value: string | null): void;
  emitFilters(): void;
  onClear(): void;
  filterValues: WritableSignal<Record<string, string | null>>;
}

const mockFields: FormFieldConfig[] = [
  { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Buscar...' },
  { key: 'estado', label: 'Estado', type: 'select', options: [] },
];

class MockFilterConfigProvider extends FilterConfigProvider {
  readonly filterFields = signal(mockFields);
}

describe('FilterPanel', () => {
  let fixture: ComponentFixture<FilterPanel>;
  let component: FilterPanel;
  let api: FilterPanelTestApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPanel],
      providers: [{ provide: FilterConfigProvider, useClass: MockFilterConfigProvider }],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanel);
    component = fixture.componentInstance;
    api = component as unknown as FilterPanelTestApi;
    fixture.detectChanges();
  });

  it('debe renderizar el título "Filtros"', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__title');
    expect(title.textContent).toContain('Filtros');
  });

  it('debe estar expandido por defecto', () => {
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).not.toContain('filter-panel__body--collapsed');
  });

  it('debe colapsar el panel al hacer click en el encabezado', () => {
    fixture.nativeElement.querySelector('.filter-panel__header').click();
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).toContain('filter-panel__body--collapsed');
  });

  it('debe expandirse nuevamente al hacer click dos veces en el encabezado', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__header');
    header.click();
    header.click();
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).not.toContain('filter-panel__body--collapsed');
  });

  it('debe colapsar el panel al presionar Enter en el encabezado', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__header');
    header.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).toContain('filter-panel__body--collapsed');
  });

  it('debe colapsar el panel al presionar Espacio en el encabezado', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__header');
    header.dispatchEvent(new KeyboardEvent('keypress', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).toContain('filter-panel__body--collapsed');
  });

  it('no debe colapsar el panel al presionar otra tecla en el encabezado', () => {
    const header: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__header');
    header.dispatchEvent(new KeyboardEvent('keypress', { key: 'Tab', bubbles: true }));
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).not.toContain('filter-panel__body--collapsed');
  });

  it('debe limpiar los valores al llamar a onClear()', () => {
    api.updateValue('nombre', 'test');
    api.onClear();
    expect(api.filterValues()).toEqual({});
  });

  it('debe emitir solo los valores no vacíos ni nulos al llamar a emitFilters()', () => {
    const emitted: Record<string, string>[] = [];
    // Set state directly to avoid reactive emissions from updateValue
    api.filterValues.set({ nombre: 'Juan', estado: null, servicio: '' });
    component.filterChange.subscribe((v) => emitted.push(v));
    api.emitFilters();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ nombre: 'Juan' });
  });

  it('debe emitir filterChange inmediatamente al cambiar un campo select', () => {
    const emitted: Record<string, string>[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    api.updateValue('estado', 'ACTIVO');
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ estado: 'ACTIVO' });
  });

  it('debe emitir un objeto vacío al llamar a onClear()', () => {
    const emitted: Record<string, string>[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    api.updateValue('nombre', 'Juan');
    api.onClear();
    expect(emitted[0]).toEqual({});
  });

  it('debe actualizar filterValues cuando un campo emite valueChange', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'Juan';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(api.filterValues()['nombre']).toBe('Juan');
  });

  it('debe llamar a onClear al hacer click en el botón Limpiar Filtros', () => {
    api.updateValue('nombre', 'Juan');
    fixture.nativeElement.querySelector('.filter-panel__actions .button--secondary').click();
    expect(api.filterValues()).toEqual({});
  });
});

describe('FilterPanel con hooks onValueChange y onClear en el provider', () => {
  const fields: FormFieldConfig[] = [
    { key: 'procedencia', label: 'Procedencia', type: 'select', options: [] },
    { key: 'servicio', label: 'Servicio', type: 'select', options: [] },
  ];

  class MockProviderWithHooks extends FilterConfigProvider {
    readonly filterFields = signal(fields);
    readonly onValueChangeSpy = vi.fn().mockReturnValue({ resetKeys: ['servicio'] });
    readonly onClearSpy = vi.fn();

    override onValueChange(key: string, value: string | null) {
      return this.onValueChangeSpy(key, value);
    }

    override onClear() {
      this.onClearSpy();
    }
  }

  let fixture: ComponentFixture<FilterPanel>;
  let api: FilterPanelTestApi;
  let mockProvider: MockProviderWithHooks;

  beforeEach(async () => {
    mockProvider = new MockProviderWithHooks();

    await TestBed.configureTestingModule({
      imports: [FilterPanel],
      providers: [{ provide: FilterConfigProvider, useValue: mockProvider }],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanel);
    api = fixture.componentInstance as unknown as FilterPanelTestApi;
    fixture.detectChanges();
  });

  it('debe llamar a onValueChange del provider al actualizar un valor', () => {
    api.updateValue('procedencia', 'SEDE');
    expect(mockProvider.onValueChangeSpy).toHaveBeenCalledWith('procedencia', 'SEDE');
  });

  it('debe resetear en filterValues los keys indicados por onValueChange', () => {
    api.updateValue('servicio', 'servicio-1');
    api.updateValue('procedencia', 'SEDE');
    expect(api.filterValues()['servicio']).toBeNull();
  });

  it('debe llamar a onClear del provider al limpiar filtros', () => {
    api.onClear();
    expect(mockProvider.onClearSpy).toHaveBeenCalled();
  });
});

describe('FilterPanel con campos que tienen defaultValue', () => {
  const fieldsWithDefault: FormFieldConfig[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'select', options: [], defaultValue: 'HABILITADO' },
  ];

  class MockFilterWithDefaults extends FilterConfigProvider {
    readonly filterFields = signal(fieldsWithDefault);
  }

  let fixture: ComponentFixture<FilterPanel>;
  let api: FilterPanelTestApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPanel],
      providers: [{ provide: FilterConfigProvider, useClass: MockFilterWithDefaults }],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanel);
    api = fixture.componentInstance as unknown as FilterPanelTestApi;
    fixture.detectChanges();
  });

  it('debe inicializar filterValues con los defaultValue de los campos', () => {
    expect(api.filterValues()).toEqual({ estado: 'HABILITADO' });
  });

  it('emitFilters debe incluir el defaultValue en la emisión inicial', () => {
    const emitted: Record<string, string>[] = [];
    fixture.componentInstance.filterChange.subscribe((v) => emitted.push(v));
    api.emitFilters();
    expect(emitted[0]).toEqual({ estado: 'HABILITADO' });
  });
});
