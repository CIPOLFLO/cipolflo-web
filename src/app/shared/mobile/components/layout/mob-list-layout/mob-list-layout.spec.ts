import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MobListLayout } from './mob-list-layout';

@Component({
  selector: 'mob-test-host',
  imports: [MobListLayout],
  template: `
    <mob-list-layout>
      <div header data-testid="slot-header">Header</div>
      <div filters data-testid="slot-filters">Filters</div>
      <div data-testid="slot-default">Card</div>
    </mob-list-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {}

describe('MobListLayout', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('proyecta el slot [header]', () => {
    const el = fixture.nativeElement.querySelector('[data-testid="slot-header"]');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain('Header');
  });

  it('proyecta el slot [filters]', () => {
    const el = fixture.nativeElement.querySelector('[data-testid="slot-filters"]');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain('Filters');
  });

  it('proyecta el slot por defecto', () => {
    const el = fixture.nativeElement.querySelector('[data-testid="slot-default"]');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain('Card');
  });
});
