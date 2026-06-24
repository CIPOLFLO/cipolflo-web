import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppButton } from './button';

describe('AppButton - comportamiento base', () => {
  let component: AppButton;
  let fixture: ComponentFixture<AppButton>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppButton],
    }).compileComponents();

    fixture = TestBed.createComponent(AppButton);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería aplicar la clase primary por defecto', () => {
    const button = el.querySelector<HTMLButtonElement>('button');
    expect(button?.classList.contains('button--primary')).toBe(true);
  });

  it('debería aplicar la clase secondary cuando el intent es secondary', () => {
    fixture.componentRef.setInput('intent', 'secondary');
    fixture.detectChanges();

    const button = el.querySelector<HTMLButtonElement>('button');
    expect(button?.classList.contains('button--secondary')).toBe(true);
  });

  it('debería aplicar la clase danger cuando el intent es danger', () => {
    fixture.componentRef.setInput('intent', 'danger');
    fixture.detectChanges();

    const button = el.querySelector<HTMLButtonElement>('button');
    expect(button?.classList.contains('button--danger')).toBe(true);
  });

  it('debería emitir el evento clicked cuando está habilitado', () => {
    let emitted = 0;
    component.clicked.subscribe(() => {
      emitted += 1;
    });

    const button = el.querySelector<HTMLButtonElement>('button');
    button?.click(); // ✅ click desde el DOM

    expect(emitted).toBe(1);
  });

  it('no debería emitir el evento clicked cuando está deshabilitado', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let emitted = 0;
    component.clicked.subscribe(() => {
      emitted += 1;
    });

    const button = el.querySelector<HTMLButtonElement>('button');
    button?.click();

    expect(button?.disabled).toBe(true);
    expect(emitted).toBe(0);
  });
  it('no emite clicked cuando loading es true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    let emitted = false;
    component.clicked.subscribe(() => (emitted = true));

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emitted).toBe(false);
  });

  it('muestra spinner cuando loading es true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.pi-spinner');

    expect(spinner).toBeTruthy();
  });
});
