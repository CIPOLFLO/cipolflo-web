import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MobFilterPanel } from './mob-filter-panel';
import { FilterConfigProvider } from '../../../services/filter-config.provider';
import { FormFieldConfig } from '../../../models/form-field.model';

interface MobFilterPanelTestApi {
  toggle(): void;
  updateFilterValue(key: string, value: string | null): void;
  onApply(): void;
  onClear(): void;
  filterValues: Signal<Record<string, string | null>>;
}

class FakeFilterConfigProvider extends FilterConfigProvider {
  readonly filterFields: Signal<FormFieldConfig[]> = signal([
    { key: 'estado', label: 'Estado', type: 'select', options: [] },
  ]);
}

describe('MobFilterPanel', () => {
  let fixture: ComponentFixture<MobFilterPanel>;
  let component: MobFilterPanel;
  let api: MobFilterPanelTestApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobFilterPanel],
      providers: [{ provide: FilterConfigProvider, useClass: FakeFilterConfigProvider }],
    }).compileComponents();

    fixture = TestBed.createComponent(MobFilterPanel);
    component = fixture.componentInstance;
    api = component as unknown as MobFilterPanelTestApi;
    fixture.detectChanges();
  });

  it('el botón de toggle está siempre en el DOM', () => {
    const btn = fixture.debugElement.query(By.css('.mob-filter-panel__toggle'));
    expect(btn).not.toBeNull();
  });

  it('el body de filtros no está visible cuando el panel está colapsado', () => {
    const body = fixture.nativeElement.querySelector('.mob-filter-panel__body');
    expect(body.classList).toContain('mob-filter-panel__body--hidden');
  });

  it('click en toggle expande el panel', () => {
    api.toggle();
    fixture.detectChanges();
    const body = fixture.nativeElement.querySelector('.mob-filter-panel__body');
    expect(body.classList).not.toContain('mob-filter-panel__body--hidden');
  });

  it('segundo click en toggle colapsa el panel', () => {
    api.toggle();
    fixture.detectChanges();
    api.toggle();
    fixture.detectChanges();
    const body = fixture.nativeElement.querySelector('.mob-filter-panel__body');
    expect(body.classList).toContain('mob-filter-panel__body--hidden');
  });

  it('cambiar un campo de filtro no emite filtersApply automáticamente', () => {
    const emitted: Record<string, string>[] = [];
    component.filtersApply.subscribe((v: Record<string, string>) => emitted.push(v));

    api.updateFilterValue('estado', 'activo');

    expect(emitted.length).toBe(0);
  });

  it('click en "Aplicar Filtros" emite filtersApply con los valores de filtro', () => {
    api.updateFilterValue('estado', 'activo');

    const emitted: Record<string, string>[] = [];
    component.filtersApply.subscribe((v: Record<string, string>) => emitted.push(v));

    api.onApply();
    fixture.detectChanges();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ estado: 'activo' });
  });

  it('aplicar filtros colapsa el panel', () => {
    api.toggle();
    fixture.detectChanges();

    api.onApply();
    fixture.detectChanges();

    const body = fixture.nativeElement.querySelector('.mob-filter-panel__body');
    expect(body.classList).toContain('mob-filter-panel__body--hidden');
  });

  it('click en "Limpiar" emite filtersClear y resetea los valores internos', () => {
    api.updateFilterValue('estado', 'activo');
    fixture.detectChanges();

    let clearEmitCount = 0;
    component.filtersClear.subscribe(() => {
      clearEmitCount++;
    });

    api.onClear();

    expect(clearEmitCount).toBe(1);
    expect(api.filterValues()).toEqual({});
  });
});
