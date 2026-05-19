import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoServicios } from './listado-servicios';

describe('ListadoServicios', () => {
  let component: ListadoServicios;
  let fixture: ComponentFixture<ListadoServicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoServicios],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoServicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});