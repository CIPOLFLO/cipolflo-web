import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RowAction } from '../../../components/table/table.models';
import { MobListCard } from './mob-list-card';

@Component({
  selector: 'app-mob-test-host',
  imports: [MobListCard],
  template: `
    <app-mob-list-card [actions]="actions" [row]="row">
      <span class="projected-content">Contenido proyectado</span>
    </app-mob-list-card>
  `,
})
class TestHostComponent {
  actions: RowAction<unknown>[] = [{ label: 'Editar', icon: 'pi pi-pencil' }];
  row: unknown = { id: 1 };
}

@Component({
  selector: 'app-mob-test-host-empty',
  imports: [MobListCard],
  template: `
    <app-mob-list-card [actions]="actions" [row]="row">
      <span class="projected-content">Contenido proyectado</span>
    </app-mob-list-card>
  `,
})
class TestHostEmptyActionsComponent {
  actions: RowAction<unknown>[] = [];
  row: unknown = { id: 1 };
}

describe('MobListCard', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TestHostEmptyActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('debe renderizar el contenido proyectado', () => {
    const projected = fixture.nativeElement.querySelector('.projected-content');
    expect(projected).toBeTruthy();
    expect(projected.textContent.trim()).toBe('Contenido proyectado');
  });

  it('debe incluir app-row-actions en el DOM', () => {
    const rowActions = fixture.debugElement.query(By.css('app-row-actions'));
    expect(rowActions).toBeTruthy();
  });

  it('debe incluir app-row-actions aunque actions esté vacío', () => {
    const emptyFixture = TestBed.createComponent(TestHostEmptyActionsComponent);
    emptyFixture.detectChanges();
    const rowActions = emptyFixture.debugElement.query(By.css('app-row-actions'));
    expect(rowActions).toBeTruthy();
  });
});
