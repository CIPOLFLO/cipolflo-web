import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobFab } from './mob-fab';
describe('MobFab', () => {
  let fixture: ComponentFixture<MobFab>;
  let component: MobFab;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobFab],
    }).compileComponents();

    fixture = TestBed.createComponent(MobFab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe renderizar el botón con el ícono pi-plus', () => {
    const button = fixture.nativeElement.querySelector('.mob-fab');
    expect(button).toBeTruthy();

    const icon = fixture.nativeElement.querySelector('.pi-plus');
    expect(icon).toBeTruthy();
  });

  it('debe emitir el output clicked al hacer click', () => {
    const emitSpy = vi.spyOn(component.clicked, 'emit');

    const button = fixture.nativeElement.querySelector('.mob-fab');
    button.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
