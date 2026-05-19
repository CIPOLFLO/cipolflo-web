import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleServicios } from './detalle-servicios';

describe('DetalleServicios', () => {
  let component: DetalleServicios;
  let fixture: ComponentFixture<DetalleServicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleServicios],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleServicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
