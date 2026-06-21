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
});

describe('AppButton - contenido e icono', () => {
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

  it('debería renderizar el label recibido por input', () => {
    fixture.componentRef.setInput('label', 'Nuevo');
    fixture.detectChanges();

    const button = el.querySelector<HTMLButtonElement>('button');
    expect(button?.textContent?.trim()).toBe('Nuevo');
  });

  it('no debería renderizar el icono cuando el input icon está vacío', () => {
    const icon = el.querySelector('.button__icon');
    expect(icon).toBeNull();
  });

  it('debería renderizar el icono a la izquierda del label cuando se provee', () => {
    fixture.componentRef.setInput('label', 'Nuevo');
    fixture.componentRef.setInput('icon', 'pi-plus');
    fixture.detectChanges();

    const button = el.querySelector<HTMLButtonElement>('button');
    const icon = el.querySelector<HTMLElement>('.button__icon');

    expect(icon).not.toBeNull();
    expect(icon?.classList.contains('pi-plus')).toBe(true);
    expect(button?.firstElementChild).toBe(icon);
  });

  it('debería aplicar la clase de host full cuando fullWidth es true', () => {
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();

    expect(el.classList.contains('button-host--full')).toBe(true);
  });

  it('debería renderizar el icono a la derecha del label cuando iconPosition es right', () => {
    fixture.componentRef.setInput('label', 'Siguiente');
    fixture.componentRef.setInput('icon', 'pi-chevron-right');
    fixture.componentRef.setInput('iconPosition', 'right');
    fixture.detectChanges();

    const button = el.querySelector<HTMLButtonElement>('button');
    const icon = el.querySelector<HTMLElement>('.button__icon');

    expect(icon).not.toBeNull();
    expect(icon?.classList.contains('pi-chevron-right')).toBe(true);
    expect(button?.lastElementChild).toBe(icon);
  });

  it('no debería emitir clicked cuando loading es true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    let emitted = false;
    component.clicked.subscribe(() => (emitted = true));
    const button = el.querySelector<HTMLButtonElement>('button');
    button?.click();
    expect(emitted).toBe(false);
  });

  it('debería renderizar el spinner cuando loading es true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinner = el.querySelector('.pi-spinner');
    expect(spinner).not.toBeNull();
  });

  it('no debería renderizar el ícono cuando loading es true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('icon', 'pi-download');
    fixture.detectChanges();
    const icon = el.querySelector('.pi-download');
    expect(icon).toBeNull();
  });

  it('debería deshabilitar el botón nativo cuando loading es true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const button = el.querySelector<HTMLButtonElement>('button');
    expect(button?.disabled).toBe(true);
  });
});
