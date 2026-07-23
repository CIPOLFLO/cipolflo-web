import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ajustes } from './ajustes';
import { CostoCuotaService } from '../services/costo-cuota.service';
import { AntiguedadReservasService } from '../services/antiguedad-reservas.service';
import { ClienteTelegramService } from '../services/cliente-telegram.service';

describe('Ajustes', () => {
  let fixture: ComponentFixture<Ajustes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ajustes],
      providers: [
        {
          provide: CostoCuotaService,
          useValue: {
            obtener: vi.fn().mockReturnValue(of({ monto: 100, updatedAt: '', updatedBy: '' })),
            actualizar: vi.fn().mockReturnValue(of({ monto: 100, updatedAt: '', updatedBy: '' })),
          },
        },
        {
          provide: AntiguedadReservasService,
          useValue: {
            obtener: vi.fn().mockReturnValue(of({ anios: 5, updatedAt: '', updatedBy: '' })),
            actualizar: vi.fn().mockReturnValue(of({ anios: 5, updatedAt: '', updatedBy: '' })),
          },
        },
        {
          provide: ClienteTelegramService,
          useValue: {
            getAll: vi.fn().mockReturnValue(
              of({
                content: [],
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
                first: true,
                last: true,
              }),
            ),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Ajustes);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe crearse correctamente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe renderizar el título "Ajustes"', () => {
    expect(fixture.nativeElement.textContent).toContain('Ajustes');
  });

  it('debe componer las tres secciones de configuración', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('app-costo-cuota-card')).toBeTruthy();
    expect(html.querySelector('app-antiguedad-reservas-card')).toBeTruthy();
    expect(html.querySelector('app-listado-clientes-telegram')).toBeTruthy();
  });
});
