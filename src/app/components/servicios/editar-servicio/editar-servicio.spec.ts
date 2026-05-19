import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarServicio } from './editar-servicio';

describe('EditarServicios', () => {
  let component: EditarServicio;
  let fixture: ComponentFixture<EditarServicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarServicio],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarServicio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
