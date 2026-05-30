import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NuevoCliente } from './nuevo-cliente';
import { MetodoCobro, TipoCliente } from '../models/cliente.model';
import { of, throwError } from 'rxjs';
import { ClientesService } from '../services/cliente.service';

describe('NuevoCliente', () => {
  let fixture: ComponentFixture<NuevoCliente>;
  let component: NuevoCliente;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let createSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigateSpy = vi.fn();
    createSpy = vi.fn().mockReturnValue(of({}));

    TestBed.overrideProvider(ClientesService, {
      useValue: {
        create: createSpy,
      },
    });
    await TestBed.configureTestingModule({
      imports: [NuevoCliente],
      providers: [{ provide: Router, useValue: { navigate: navigateSpy } }],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevoCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar error si la cédula es inválida', () => {
    component['submitted'].set(true);

    component['form'].get('cedula')?.setErrors({
      cedulaInvalida: true,
    });

    expect(component['clienteErrors']()['cedula']).toContain('no es válida');
  });

  it('debería mostrar error si es menor de edad', () => {
    component['submitted'].set(true);

    component['form'].get('fechaNacimiento')?.setErrors({
      menorDeEdad: true,
    });

    expect(component['clienteErrors']()['fechaNacimiento']).toContain('mayor de 18 años');
  });

  it('debería mostrar error si el email es inválido', () => {
    component['submitted'].set(true);

    component['form'].get('email')?.setErrors({
      emailInvalido: true,
    });

    expect(component['clienteErrors']()['email']).toContain('email no es válido');
  });

  it('confirmDisabled debería ser true con el formulario vacío', () => {
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('clienteErrors debería estar vacío cuando submitted es false', () => {
    expect(component['clienteErrors']()).toEqual({});
  });

  it('ubicacionErrors debería estar vacío cuando submitted es false', () => {
    expect(component['ubicacionErrors']()).toEqual({});
  });

  it('clienteErrors[nombre] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();

    expect(component['clienteErrors']()['nombre']).toBeTruthy();
  });

  it('clienteErrors[cedula] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();

    expect(component['clienteErrors']()['cedula']).toBeTruthy();
  });

  it('clienteErrors[fechaNacimiento] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();

    expect(component['clienteErrors']()['fechaNacimiento']).toBeTruthy();
  });

  it('clienteErrors[telefono] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();

    expect(component['clienteErrors']()['telefono']).toBeTruthy();
  });

  it('clienteErrors[email] debería mostrar error cuando el email es inválido', () => {
    component['form'].patchValue({
      nombre: 'Lucía Rodríguez',
      cedula: '5.191.926-8',
      fechaNacimiento: '1999-06-29',
      telefono: '099985648',
      email: 'email-invalido',
      metodoCobro: MetodoCobro.Cobradora,
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
    });

    component['submitted'].set(true);
    fixture.detectChanges();

    expect(component['clienteErrors']()['email']).toBeTruthy();
  });

  it('ubicacionErrors[pais] debería mostrar error cuando submitted y campo vacío', () => {
    component['form'].patchValue({ pais: null });
    component['submitted'].set(true);
    fixture.detectChanges();

    expect(component['ubicacionErrors']()['pais']).toBeTruthy();
  });

  it('ubicacionErrors[departamento] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();

    expect(component['ubicacionErrors']()['departamento']).toBeTruthy();
  });

  it('ubicacionErrors[ciudad] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();

    expect(component['ubicacionErrors']()['ciudad']).toBeTruthy();
  });

  it('onClienteChange debería patchear los datos del cliente en el form', () => {
    component['onClienteChange']({
      nombre: 'Martín González',
      cedula: '2.345.678-9',
      fechaNacimiento: '1985-04-15',
      telefono: '099123456',
      email: 'martin.gonzalez@example.com',
      metodoCobro: MetodoCobro.EnSede,
    });

    expect(component['form'].get('nombre')?.value).toBe('Martín González');
    expect(component['form'].get('cedula')?.value).toBe('2.345.678-9');
    expect(component['form'].get('fechaNacimiento')?.value).toBe('1985-04-15');
    expect(component['form'].get('telefono')?.value).toBe('099123456');
    expect(component['form'].get('email')?.value).toBe('martin.gonzalez@example.com');
    expect(component['form'].get('metodoCobro')?.value).toBe('EN_SEDE');
  });

  it('onUbicacionChange debería patchear los datos de ubicación en el form', () => {
    component['onUbicacionChange']({
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      direccion: 'Calle A 123',
    });

    expect(component['form'].get('pais')?.value).toBe('Uruguay');
    expect(component['form'].get('departamento')?.value).toBe('Flores');
    expect(component['form'].get('ciudad')?.value).toBe('Trinidad');
    expect(component['form'].get('direccion')?.value).toBe('Calle A 123');
  });

  it('onAdicionalChange debería patchear observaciones en el form', () => {
    component['onAdicionalChange']({
      observaciones: 'Socia nueva',
    });

    expect(component['form'].get('observaciones')?.value).toBe('Socia nueva');
  });

  it('onConfirmar con form válido navega a /clientes al completar', () => {
    component['form'].patchValue({
      nombre: 'Lucía Rodríguez',
      cedula: '5.191.926-8',
      fechaNacimiento: '1999-06-29',
      telefono: '099985648',
      metodoCobro: MetodoCobro.Cobradora,
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
    });

    component['onConfirmar']();

    expect(navigateSpy).toHaveBeenCalledWith(['/clientes']);
  });

  it('onConfirmar desactiva loading ante un error del servidor', () => {
    createSpy.mockReturnValue(throwError(() => new Error('server error')));
    component['form'].patchValue({
      nombre: 'Lucía Rodríguez',
      cedula: '5.191.926-8',
      fechaNacimiento: '1999-06-29',
      telefono: '099985648',
      metodoCobro: MetodoCobro.Cobradora,
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
    });

    component['onConfirmar']();

    expect(component['loading']()).toBe(false);
  });

  it('onCancelar debería navegar a /clientes', () => {
    component['onCancelar']();

    expect(navigateSpy).toHaveBeenCalledWith(['/clientes']);
  });

  it('onConfirmar con form inválido debería marcar submitted', () => {
    component['onConfirmar']();

    expect(component['submitted']()).toBe(true);
  });

  it('onConfirmar con form inválido no debería llamar a create', () => {
    component['onConfirmar']();

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('onConfirmar con form válido debería llamar a create con los datos del formulario', () => {
    component['form'].patchValue({
      tipoCliente: TipoCliente.Socio,
      nombre: 'Lucía Rodríguez',
      cedula: '5.191.926-8',
      fechaNacimiento: '1999-06-29',
      telefono: '099985648',
      email: 'lucia.rodriguez@example.com',
      metodoCobro: MetodoCobro.Cobradora,
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      direccion: 'Luis Alberto de Herrera 123',
      observaciones: 'Socia nueva',
    });

    component['onConfirmar']();

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Lucía Rodríguez',
        cedula: '5.191.926-8',
        metodoCobro: MetodoCobro.Cobradora,
      }),
    );
  });

  it('debería habilitar confirmar cuando el formulario es válido', () => {
    component['form'].patchValue({
      nombre: 'Lucía Rodríguez',
      cedula: '1.111.111-1',
      fechaNacimiento: '1990-01-01',
      telefono: '099123456',
      email: 'lucia@test.com',
      metodoCobro: MetodoCobro.Cobradora,
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      direccion: 'Calle 123',
      observaciones: 'Observación',
    });

    expect(component['confirmDisabled']()).toBe(false);
  });

  it('debería limpiar errores reactivos luego de corregir un campo', () => {
    component['submitted'].set(true);

    component['form'].patchValue({
      nombre: '',
    });

    expect(component['clienteErrors']()['nombre']).toContain('El nombre es obligatorio.');

    component['form'].patchValue({
      nombre: 'Lucía Rodríguez',
    });

    expect(component['clienteErrors']()['nombre']).toBeUndefined();
  });
});
