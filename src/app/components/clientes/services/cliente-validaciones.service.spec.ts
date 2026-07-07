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

  describe('rutValida', () => {
    it('retorna null si no hay valor', () => {
      expect(service.rutValida(new FormControl(null))).toBeNull();
    });

    it('retorna { rutInvalido: true } si tiene longitud inválida', () => {
      expect(service.rutValida(new FormControl('123'))).toEqual({
        rutInvalido: true,
      });
    });

    it('retorna null si el RUT es válido', () => {
      expect(service.rutValida(new FormControl('21.100342.001-7'))).toBeNull();
    });

    it('retorna { rutInvalido: true } si el dígito verificador no coincide', () => {
      expect(service.rutValida(new FormControl('21.100342.001-1'))).toEqual({
        rutInvalido: true,
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
  describe('getEmpresaErrors', () => {
    const buildForm = (rut: string | null, mail: string | null = null) =>
      new FormGroup({
        razonSocial: new FormControl('Antel S.A.', Validators.required),
        rut: new FormControl(rut, [Validators.required, service.rutValida.bind(service)]),
        telefono: new FormControl('099123456', Validators.required),
        mail: new FormControl(mail),
      });

    it('retorna error de razón social faltante cuando submitted es true', () => {
      const form = new FormGroup({
        razonSocial: new FormControl('', Validators.required),
        rut: new FormControl('21.100342.001-7', [
          Validators.required,
          service.rutValida.bind(service),
        ]),
        telefono: new FormControl('099123456', Validators.required),
        mail: new FormControl(null),
      });
      const errors = service.getEmpresaErrors(form, true);
      expect(errors['razonSocial']).toBeTruthy();
    });

    it('no retorna error de RUT cuando es válido', () => {
      const errors = service.getEmpresaErrors(buildForm('21.100342.001-7'), true);
      expect(errors['rut']).toBeUndefined();
    });

    it('retorna error de RUT obligatorio cuando está vacío y submitted es true', () => {
      const errors = service.getEmpresaErrors(buildForm(''), true);
      expect(errors['rut']).toBeTruthy();
    });

    it('retorna error de RUT inválido cuando el dígito verificador no coincide', () => {
      const form = buildForm('21.100342.001-1');
      form.get('rut')?.markAsTouched();
      const errors = service.getEmpresaErrors(form, false);
      expect(errors['rut']).toBeTruthy();
    });

    it('no retorna error de mail cuando no se informa', () => {
      const errors = service.getEmpresaErrors(buildForm('21.100342.001-7', null), true);
      expect(errors['mail']).toBeUndefined();
    });
  });
});
