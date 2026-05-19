import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarServicios } from './editar-servicios';

describe('EditarServicios', () => {
  let component: EditarServicios;
  let fixture: ComponentFixture<EditarServicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarServicios],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarServicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});