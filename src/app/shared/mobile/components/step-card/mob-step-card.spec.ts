import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobStepCard } from './mob-step-card';

@Component({
  standalone: true,
  imports: [MobStepCard],
  template: `
    <app-mob-step-card [stepNumber]="1" title="Información de la Reserva">
      <p class="contenido-proyectado">Campos del paso</p>
    </app-mob-step-card>
  `,
})
class HostComponent {}

describe('MobStepCard', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debería renderizar el stepNumber en el badge', () => {
    const badge = el.querySelector('.step-card__badge');
    expect(badge?.textContent?.trim()).toBe('1');
  });

  it('debería renderizar el title en la cabecera', () => {
    const title = el.querySelector('.step-card__title');
    expect(title?.textContent?.trim()).toBe('Información de la Reserva');
  });

  it('debería proyectar el contenido recibido', () => {
    const proyectado = el.querySelector('.contenido-proyectado');
    expect(proyectado).not.toBeNull();
    expect(proyectado?.textContent?.trim()).toBe('Campos del paso');
  });
});
