import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, beforeEach } from 'vitest';
import { ServicioCardMobileRow } from '../mappers/servicio-card-mobile.mapper';
import { EstadoServicio } from '../models/servicio.model';
import { MobServicioCard } from './mob-servicio-card';

describe('MobServicioCard', () => {
  let fixture: ComponentFixture<MobServicioCard>;

  const servicio: ServicioCardMobileRow = {
    id: 1,
    nombre: 'Cabaña 1',
    procedencia: 'CAMPING',
    precioParticular: 1200,
    precioSocio: 800,
    modalidadPrecio: 'POR_DIA',
    estado: EstadoServicio.Habilitado,
    capacidad: 4,
    cantidad: 1,
    costoPersonaExtra: null,
    procedenciaLabel: 'Camping',
    unidadLabel: 'p/día',
    estadoTag: {
      label: 'Habilitado',
      colorClass: 'tag--green',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobServicioCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MobServicioCard);
    fixture.componentRef.setInput('servicio', servicio);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería mostrar nombre y procedencia', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Cabaña 1');
    expect(text).toContain('Camping');
  });

  it('debería mostrar el estado con AppTag', () => {
    const tag = fixture.debugElement.query(By.css('app-tag'));
    expect(tag).toBeTruthy();
    expect(tag.nativeElement.textContent).toContain('Habilitado');
  });

  it('debería mostrar el precio de socio con su unidad', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('SOCIO');
    expect(text).toContain('800');
    expect(text).toContain('p/día');
  });

  it('debería mostrar el precio de particular con su unidad', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('PARTICULAR');
    expect(text).toContain('1.200');
  });

  it('no debería mostrar el menú de acciones cuando no se pasan acciones', () => {
    const menuButton = fixture.debugElement.query(By.css('app-mob-list-card .mob-list-card__menu'));
    expect(menuButton).toBeNull();
  });
});
