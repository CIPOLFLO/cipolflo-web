import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DetalleCliente } from './detalle-cliente';

describe('DetalleCliente', () => {
  let component: DetalleCliente;
  let fixture: ComponentFixture<DetalleCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCliente],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => '1',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
