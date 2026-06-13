import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobStepFooter } from './mob-step-footer';

describe('MobStepFooter', () => {
  let component: MobStepFooter;
  let fixture: ComponentFixture<MobStepFooter>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobStepFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(MobStepFooter);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  function buttonByLabel(label: string): HTMLButtonElement | undefined {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.trim().includes(label),
    );
  }

  it('no debería renderizar el botón Anterior cuando showPrevious es false', () => {
    expect(buttonByLabel('Anterior')).toBeUndefined();
    expect(buttonByLabel('Siguiente')).toBeDefined();
  });

  it('debería renderizar ambos botones cuando showPrevious es true', () => {
    fixture.componentRef.setInput('showPrevious', true);
    fixture.detectChanges();

    expect(buttonByLabel('Anterior')).toBeDefined();
    expect(buttonByLabel('Siguiente')).toBeDefined();
  });

  it('debería deshabilitar el botón de acción cuando nextDisabled es true', () => {
    fixture.componentRef.setInput('nextDisabled', true);
    fixture.detectChanges();

    expect(buttonByLabel('Siguiente')?.disabled).toBe(true);
  });

  it('debería mostrar Confirmar con icono pi-save en el último paso', () => {
    fixture.componentRef.setInput('isLastStep', true);
    fixture.detectChanges();

    const confirmar = buttonByLabel('Confirmar');
    expect(confirmar).toBeDefined();
    expect(buttonByLabel('Siguiente')).toBeUndefined();
    expect(confirmar?.querySelector('.pi-save')).not.toBeNull();
  });

  it('debería emitir next al hacer click en Siguiente', () => {
    let emitted = 0;
    component.next.subscribe(() => (emitted += 1));

    buttonByLabel('Siguiente')?.click();

    expect(emitted).toBe(1);
  });

  it('debería emitir confirm al hacer click en Confirmar', () => {
    fixture.componentRef.setInput('isLastStep', true);
    fixture.detectChanges();

    let emitted = 0;
    component.confirm.subscribe(() => (emitted += 1));

    buttonByLabel('Confirmar')?.click();

    expect(emitted).toBe(1);
  });

  it('debería emitir previous al hacer click en Anterior', () => {
    fixture.componentRef.setInput('showPrevious', true);
    fixture.detectChanges();

    let emitted = 0;
    component.previous.subscribe(() => (emitted += 1));

    buttonByLabel('Anterior')?.click();

    expect(emitted).toBe(1);
  });
});
