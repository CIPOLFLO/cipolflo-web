
import { ActivatedRoute, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModificarCliente } from './nuevo-cliente';
import { MetodoCobro, TipoCliente } from '../models/cliente.model';
import { of } from 'rxjs';
import { ClientesService } from '../services/cliente.service';
import { ClienteValidacionesService } from '../services/cliente-validaciones.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

const clienteMock = {
  id: 1,
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 42,
  cedula: '5.191.926-8',
  nombre: 'Lucía Rodríguez',
  telefono: '099985648',
  email: 'lucia@example.com',
  pais: 'Uruguay',
  departamento: 'Flores',
  ciudad: 'Trinidad',
  direccion: 'Calle A 123',
  observaciones: null,
  fechaNacimiento: '1999-06-29',
  estado: 'Activo',
  metodoCobro: MetodoCobro.Cobradora,
  createdAt: '2024-01-01',
  createdBy: 'admin',
};

describe('ModificarCliente', () => {
  let fixture: ComponentFixture<ModificarCliente>;
  let component: ModificarCliente;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let navigateByUrlSpy: ReturnType<typeof vi.fn>;
  let getByIdSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigateSpy = vi.fn();
    navigateByUrlSpy = vi.fn();
    getByIdSpy = vi.fn().mockReturnValue(of(clienteMock));

    await TestBed.configureTestingModule({
      imports: [ModificarCliente],
      providers: [
        { provide: Router, useValue: { navigate: navigateSpy, navigateByUrl: navigateByUrlSpy } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
        {
          provide: ClientesService,
          useValue: { getById: getByIdSpy },
        },
        ClienteValidacionesService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarCliente);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los datos del cliente al inicializar', () => {
    expect(component['form'].get('nombre')?.value).toBe('Lucía Rodríguez');
    expect(component['form'].get('email')?.value).toBe('lucia@example.com');
  });

  it('debería patchear el form con los datos del cliente', () => {
    expect(component['form'].get('cedula')?.value).toBe('5.191.926-8');
    expect(component['form'].get('telefono')?.value).toBe('099985648');
    expect(component['form'].get('pais')?.value).toBe('Uruguay');
  });

  it('confirmDisabled debería ser true cuando el form es inválido y sucio', () => {
    component['form'].get('nombre')?.setValue('');
    component['form'].markAsDirty();
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('confirmDisabled debería ser false cuando el form es válido', () => {
    component['form'].markAsDirty();
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(false);
  });

  it('infoErrors debería estar vacío cuando submitted es false', () => {
    expect(component['infoErrors']()).toEqual({});
  });

  it('ubicacionErrors debería estar vacío cuando submitted es false', () => {
    expect(component['ubicacionErrors']()).toEqual({});
  });

  it('infoErrors[nombre] debería mostrar error cuando submitted y nombre vacío', () => {
    component['form'].get('nombre')?.setValue(null);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['nombre']).toBeTruthy();
  });

  it('infoErrors[email] debería mostrar error con email inválido', () => {
    component['form'].get('email')?.setValue('email-invalido');
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['email']).toBeTruthy();
  });

  it('infoErrors[telefono] debería mostrar error cuando submitted y campo vacío', () => {
    component['form'].get('telefono')?.setValue(null);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['telefono']).toBeTruthy();
  });

  it('ubicacionErrors[pais] debería mostrar error cuando submitted y campo vacío', () => {
    component['form'].get('pais')?.setValue(null);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['ubicacionErrors']()['pais']).toBeTruthy();
  });

  it('onInfoChange debería patchear los datos del cliente en el form', () => {
    component['onInfoChange']({
      nombre: 'Martín González',
      cedula: '2.345.678-9',
      telefono: '099123456',
      email: 'martin@example.com',
    });
    expect(component['form'].get('nombre')?.value).toBe('Martín González');
    expect(component['form'].get('email')?.value).toBe('martin@example.com');
  });

  it('onUbicacionChange debería patchear los datos de ubicación en el form', () => {
    component['onUbicacionChange']({
      pais: 'Argentina',
      departamento: 'Buenos Aires',
      ciudad: 'CABA',
      direccion: 'Av. Corrientes 123',
    });
    expect(component['form'].get('pais')?.value).toBe('Argentina');
    expect(component['form'].get('ciudad')?.value).toBe('CABA');
  });

  it('onAdicionalChange debería patchear observaciones en el form', () => {
    component['onAdicionalChange']({ observaciones: 'Nota de prueba' });
    expect(component['form'].get('observaciones')?.value).toBe('Nota de prueba');
  });

  it('onFieldBlur debería marcar el campo como touched', () => {
    component['onFieldBlur']('nombre');
    expect(component['form'].get('nombre')?.touched).toBe(true);
  });

  it('onCancelar debería navegar usando backLink', () => {
    component['onCancelar']();
    expect(navigateByUrlSpy).toHaveBeenCalled();
  });

  it('onConfirmar con form inválido debería marcar submitted como true', () => {
    component['form'].get('nombre')?.setValue(null);
    component['onConfirmar']();
    expect(component['submitted']()).toBe(true);
  });

  it('onConfirmar con form válido no debería navegar (update pendiente)', () => {
    // El update aún no está implementado, solo loguea
    component['onConfirmar']();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});