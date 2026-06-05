import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { describe, expect, it, beforeEach } from 'vitest';
import { ClienteValidacionesService } from './cliente-validaciones.service';

describe('ClienteValidacionesService', () => {
  let service: ClienteValidacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClienteValidacionesService);
  });

  describe('mayorDeEdad', () => {
    it('retorna null si no hay valor', () => {
      expect(service.mayorDeEdad(new FormControl(null))).toBeNull();
    });

    it('retorna null si tiene 18 años o más', () => {
      expect(service.mayorDeEdad(new FormControl('1999-06-29'))).toBeNull();
    });

    it('retorna { menorDeEdad: true } si es menor de 18 años', () => {
      const nextYear = new Date().getFullYear() + 1;
      expect(service.mayorDeEdad(new FormControl(`${nextYear}-01-01`))).toEqual({
        menorDeEdad: true,
      });
    });
  });

  describe('emailValido', () => {
    it('retorna null si no hay valor', () => {
      expect(service.emailValido(new FormControl(null))).toBeNull();
    });

    it('retorna null con email válido', () => {
      expect(service.emailValido(new FormControl('cliente@example.com'))).toBeNull();
    });

    it('retorna { emailInvalido: true } con email inválido', () => {
      expect(service.emailValido(new FormControl('email-invalido'))).toEqual({
        emailInvalido: true,
      });
    });
  });

  describe('cedulaValida', () => {
    it('retorna null si no hay valor', () => {
      expect(service.cedulaValida(new FormControl(null))).toBeNull();
    });

    it('retorna { cedulaInvalida: true } si tiene longitud inválida', () => {
      expect(service.cedulaValida(new FormControl('123'))).toEqual({
        cedulaInvalida: true,
      });
    });

    it('retorna null si la cédula es válida', () => {
      expect(service.cedulaValida(new FormControl('1.111.111-1'))).toBeNull();
    });

    it('retorna { cedulaInvalida: true } si el dígito verificador no coincide', () => {
      expect(service.cedulaValida(new FormControl('1.111.111-2'))).toEqual({
        cedulaInvalida: true,
      });
    });
  });

  describe('getUbicacionErrors', () => {
    const buildForm = (direccion: string | null, required = true) =>
      new FormGroup({
        pais: new FormControl('Uruguay', Validators.required),
        departamento: new FormControl('Flores', Validators.required),
        ciudad: new FormControl('Trinidad', Validators.required),
        direccion: new FormControl(direccion, required ? Validators.required : null),
      });

    it('no retorna error de dirección cuando tiene valor', () => {
      const errors = service.getUbicacionErrors(buildForm('Calle A 123'), false);
      expect(errors['direccion']).toBeUndefined();
    });

    it('retorna error de dirección cuando el campo está tocado y vacío', () => {
      const form = buildForm('');
      form.get('direccion')?.markAsTouched();
      const errors = service.getUbicacionErrors(form, false);
      expect(errors['direccion']).toBeTruthy();
    });

    it('retorna error de dirección cuando submitted es true y el campo está vacío', () => {
      const errors = service.getUbicacionErrors(buildForm(''), true);
      expect(errors['direccion']).toBeTruthy();
    });

    it('no retorna error de dirección si el control no tiene validador required', () => {
      const errors = service.getUbicacionErrors(buildForm(null, false), true);
      expect(errors['direccion']).toBeUndefined();
    });
  });
});
