import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ListadoFinanzas } from './listado-finanzas';

describe('ListadoFinanzas', () => {
  let component: ListadoFinanzas;
  let fixture: ComponentFixture<ListadoFinanzas>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoFinanzas],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoFinanzas);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onNuevoMovimiento navega a /finanzas/nuevo', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component['onNuevoMovimiento']();
    expect(navigateSpy).toHaveBeenCalledWith(['/finanzas', 'nuevo']);
  });
});
