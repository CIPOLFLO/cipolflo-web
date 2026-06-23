import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@auth0/auth0-angular';
import { EstadoReserva, Procedencia } from '../../../shared';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { TableStateService } from '../../../shared/components/table/table-state.service';
import { UserService } from '../../../core/services/user.service';
import { ReservasService } from '../services/reservas.service';
import { ReservasColumnsService } from '../services/reserva-columns.service';
import { ReservasFilterService } from '../services/reservas-filter.service';
import { type ReservaRow } from '../models/reserva.model';
import { ListadoReservas } from './listado-reservas';

const mockAuthService = {
  user$: of({ name: 'Juan Pérez', email: 'juan@example.com' }),
  logout: vi.fn(),
};
const mockUserService = { userInitials: () => 'JP', userEmail: () => 'juan@example.com' };

const emptyPage = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

function makeRow(estadoReserva: EstadoReserva): ReservaRow {
  return {
    id: 7,
    clienteId: 1,
    nombreCliente: 'Test',
    servicioId: 1,
    servicioNombre: 'Servicio',
    fechaEntrada: '2026-08-01',
    fechaSalida: '2026-08-05',
    estadoReserva,
  };
}

describe('ListadoReservas — rowActions', () => {
  let component: ListadoReservas;
  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigateSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ListadoReservas],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideComponent(ListadoReservas, {
        set: {
          providers: [
            TableStateService,
            ReservasColumnsService,
            { provide: FilterConfigProvider, useClass: ReservasFilterService },
            {
              provide: ReservasService,
              useValue: { getAll: vi.fn().mockReturnValue(of(emptyPage)) },
            },
          ],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(ListadoReservas);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('siempre incluye la acción "Ver detalle"', () => {
    const actions = component['rowActions'](makeRow(EstadoReserva.Pendiente));
    expect(actions.some((a) => a.label === 'Ver detalle')).toBe(true);
  });

  it('incluye Modificar para estado Pendiente', () => {
    const actions = component['rowActions'](makeRow(EstadoReserva.Pendiente));
    expect(actions.some((a) => a.label === 'Modificar')).toBe(true);
  });

  it('incluye Modificar para estado Confirmada', () => {
    const actions = component['rowActions'](makeRow(EstadoReserva.Confirmada));
    expect(actions.some((a) => a.label === 'Modificar')).toBe(true);
  });

  it('no incluye Modificar para estado EnCurso', () => {
    const actions = component['rowActions'](makeRow(EstadoReserva.EnCurso));
    expect(actions.some((a) => a.label === 'Modificar')).toBe(false);
  });

  it('no incluye Modificar para estado Finalizada', () => {
    const actions = component['rowActions'](makeRow(EstadoReserva.Finalizada));
    expect(actions.some((a) => a.label === 'Modificar')).toBe(false);
  });

  it('no incluye Modificar para estado Cancelada', () => {
    const actions = component['rowActions'](makeRow(EstadoReserva.Cancelada));
    expect(actions.some((a) => a.label === 'Modificar')).toBe(false);
  });

  it('la acción Modificar navega a /reservas/:id/editar', () => {
    const row = makeRow(EstadoReserva.Pendiente);
    const actions = component['rowActions'](row);
    const modificar = actions.find((a) => a.label === 'Modificar')!;
    modificar.command!(row);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', 7, 'editar']);
  });

  it('la acción Ver detalle navega a /reservas/:id', () => {
    const row = makeRow(EstadoReserva.Pendiente);
    const actions = component['rowActions'](row);
    const verDetalle = actions.find((a) => a.label === 'Ver detalle')!;
    verDetalle.command!(row);
    expect(navigateSpy).toHaveBeenCalledWith(['/reservas', 7]);
  });
});
