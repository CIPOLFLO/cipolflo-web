import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, beforeEach } from 'vitest';
import { EstadoReserva } from '../../../shared';
import { ReservaCardMobileRow } from '../mappers/reserva-card-mobile.mapper';
import { TipoReserva } from '../models/reserva.model';
import { MobReservaCard } from './mob-reserva-card';

describe('MobReservaCard', () => {
  let fixture: ComponentFixture<MobReservaCard>;

  const reserva: ReservaCardMobileRow = {
    id: 1,
    clienteId: 10,
    nombreCliente: 'Juan Pérez',
    servicioId: 3,
    servicioNombre: 'Hospedaje en camping',
    fechaEntrada: '2026-08-10',
    fechaSalida: '2026-08-15',
    estadoReserva: EstadoReserva.Confirmada,
    requiereDocumentacion: false,
    tieneDocumentacion: false,
    requiereSena: false,
    tipoReserva: TipoReserva.Comun,
    montoImpago: 1500,
    plazoConfirmacion: null,
    fechaLimiteConfirmacion: null,
    fechaInicioAlerta: null,
    pago: false,
    pendienteDocumentacion: false,
    cliente: 'Juan Pérez',
    servicio: 'Hospedaje en camping',
    fechaEntradaFormateada: '10/08/2026',
    fechaSalidaFormateada: '15/08/2026',
    estadoTag: {
      label: 'Confirmada',
      colorClass: 'tag--green',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobReservaCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MobReservaCard);
    fixture.componentRef.setInput('reserva', reserva);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería mostrar cliente, servicio y fechas', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Juan Pérez');
    expect(text).toContain('Hospedaje en camping');
    expect(text).toContain('10/08/2026');
    expect(text).toContain('15/08/2026');
  });

  it('debería mostrar el estado con AppTag', () => {
    const tag = fixture.debugElement.query(By.css('app-tag'));
    expect(tag).toBeTruthy();
    expect(tag.nativeElement.textContent).toContain('Confirmada');
  });

  it('debería mostrar el monto impago', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Saldo pendiente');
    expect(text).toContain('1.500');
  });

  it('no debería mostrar el menú de acciones cuando no se pasan acciones', () => {
    const menuButton = fixture.debugElement.query(By.css('app-mob-list-card .mob-list-card__menu'));
    expect(menuButton).toBeNull();
  });
});