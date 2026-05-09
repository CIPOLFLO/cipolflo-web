import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FilterPanel } from './filter-panel';
import { FilterConfigProvider } from '../../services/filter-config.provider';
import { FormFieldConfig } from '../../models/form-field.model';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPanel],
      providers: [{ provide: FilterConfigProvider, useClass: MockFilterConfigProvider }],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the "Filtros" title', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__title');
    expect(title.textContent).toContain('Filtros');
  });

  it('should be expanded by default', () => {
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).not.toContain('filter-panel__body--collapsed');
  });

  it('should collapse the body when toggle() is called', () => {
    (component as any).toggle();
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).toContain('filter-panel__body--collapsed');
  });

  it('should re-expand when toggle() is called twice', () => {
    (component as any).toggle();
    (component as any).toggle();
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement.querySelector('.filter-panel__body');
    expect(body.classList).not.toContain('filter-panel__body--collapsed');
  });

  it('should reset filterValues when onClear() is called', () => {
    (component as any).updateValue('nombre', 'test');
    (component as any).onClear();
    expect((component as any).filterValues()).toEqual({});
  });

  it('should emit filterValues when onSearch() is called', () => {
    const emitted: Record<string, string>[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    (component as any).updateValue('nombre', 'Juan');
    (component as any).onSearch();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ nombre: 'Juan' });
  });

  it('should emit empty object when onClear() is called', () => {
    const emitted: Record<string, string>[] = [];
    component.filterChange.subscribe((v) => emitted.push(v));
    (component as any).updateValue('nombre', 'Juan');
    (component as any).onClear();
    expect(emitted[0]).toEqual({});
  });
});
