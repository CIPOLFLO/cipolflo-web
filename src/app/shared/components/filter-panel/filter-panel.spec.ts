import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, signal } from '@angular/core';
import { FilterPanel } from './filter-panel';
import { FilterConfigProvider } from '../../services/filter-config.provider';
import { FormFieldConfig } from '../../models/form-field.model';

interface FilterPanelTestApi {
  updateValue(key: string, value: string | null): void;
  onSearch(): void;
  onClear(): void;
  filterValues: Signal<Record<string, string | null>>;
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

  it('debe limpiar los valores al llamar a onClear()', () => {
    api.updateValue('nombre', 'test');
    api.onClear();
    expect(api.filterValues()).toEqual({});
  });

  it('debe emitir solo los valores no vacíos ni nulos al llamar a onSearch()', () => {
    const emitted: Record<string, string>[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    api.updateValue('nombre', 'Juan');
    api.updateValue('estado', null);
    api.updateValue('concepto', '');
    api.onSearch();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ nombre: 'Juan' });
  });

  it('debe emitir un objeto vacío al llamar a onClear()', () => {
    const emitted: Record<string, string>[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    api.updateValue('nombre', 'Juan');
    api.onClear();
    expect(emitted[0]).toEqual({});
  });
});
