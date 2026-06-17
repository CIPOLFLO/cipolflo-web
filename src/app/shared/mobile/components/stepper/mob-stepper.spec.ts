import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobStepper } from './mob-stepper';
import { StepConfig } from './stepper.models';

describe('MobStepper', () => {
  let fixture: ComponentFixture<MobStepper>;
  let el: HTMLElement;

  const steps: StepConfig[] = [
    { label: 'Información de la Reserva' },
    { label: 'Información del Cliente' },
    { label: 'Confirmación' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobStepper],
    }).compileComponents();

    fixture = TestBed.createComponent(MobStepper);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('steps', steps);
    fixture.componentRef.setInput('currentStep', 0);
    fixture.detectChanges();
  });

  it('debería renderizar exactamente un indicador por step', () => {
    const indicators = el.querySelectorAll('.stepper__step');
    expect(indicators.length).toBe(3);
  });

  it('debería marcar como activo el step en la posición currentStep', () => {
    fixture.componentRef.setInput('currentStep', 1);
    fixture.detectChanges();

    const indicators = el.querySelectorAll('.stepper__step');
    expect(indicators[1].classList.contains('stepper__step--active')).toBe(true);
    expect(indicators[1].classList.contains('stepper__step--completed')).toBe(false);
    expect(indicators[1].classList.contains('stepper__step--future')).toBe(false);
  });

  it('debería marcar como completados los steps anteriores, con pi-check y sin número', () => {
    fixture.componentRef.setInput('currentStep', 2);
    fixture.detectChanges();

    const indicators = el.querySelectorAll('.stepper__step');
    expect(indicators[0].classList.contains('stepper__step--completed')).toBe(true);
    expect(indicators[1].classList.contains('stepper__step--completed')).toBe(true);

    expect(indicators[0].querySelector('.pi-check')).not.toBeNull();
    expect(indicators[0].textContent?.trim()).toBe('');
  });

  it('debería marcar como futuros los steps posteriores, mostrando su número', () => {
    fixture.componentRef.setInput('currentStep', 0);
    fixture.detectChanges();

    const indicators = el.querySelectorAll('.stepper__step');
    expect(indicators[1].classList.contains('stepper__step--future')).toBe(true);
    expect(indicators[2].classList.contains('stepper__step--future')).toBe(true);

    expect(indicators[1].querySelector('.pi-check')).toBeNull();
    expect(indicators[1].textContent?.trim()).toBe('2');
  });

  it('debería recalcular las clases al cambiar currentStep', () => {
    let indicators = el.querySelectorAll('.stepper__step');
    expect(indicators[0].classList.contains('stepper__step--active')).toBe(true);

    fixture.componentRef.setInput('currentStep', 2);
    fixture.detectChanges();

    indicators = el.querySelectorAll('.stepper__step');
    expect(indicators[0].classList.contains('stepper__step--completed')).toBe(true);
    expect(indicators[2].classList.contains('stepper__step--active')).toBe(true);
  });

  it('debería exponer semántica de lista accesible (role list/listitem)', () => {
    expect(el.querySelector('.stepper')?.getAttribute('role')).toBe('list');
    const items = el.querySelectorAll('.stepper__step');
    items.forEach((item) => expect(item.getAttribute('role')).toBe('listitem'));
  });

  it('debería incluir el estado del paso en el aria-label y marcar aria-current en el activo', () => {
    fixture.componentRef.setInput('currentStep', 1);
    fixture.detectChanges();

    const indicators = el.querySelectorAll('.stepper__step');
    expect(indicators[0].getAttribute('aria-label')).toBe('Información de la Reserva (completado)');
    expect(indicators[1].getAttribute('aria-label')).toBe('Información del Cliente (paso actual)');
    expect(indicators[2].getAttribute('aria-label')).toBe('Confirmación (pendiente)');

    expect(indicators[1].getAttribute('aria-current')).toBe('step');
    expect(indicators[0].getAttribute('aria-current')).toBeNull();
  });

  it('debería renderizar una línea debajo de cada step y pintar en verde solo las de los completados', () => {
    fixture.componentRef.setInput('currentStep', 1);
    fixture.detectChanges();

    const lines = el.querySelectorAll('.stepper__line');
    expect(lines.length).toBe(3);
    expect(lines[0].classList.contains('stepper__line--filled')).toBe(true);
    expect(lines[1].classList.contains('stepper__line--filled')).toBe(false);
    expect(lines[2].classList.contains('stepper__line--filled')).toBe(false);
  });
});
