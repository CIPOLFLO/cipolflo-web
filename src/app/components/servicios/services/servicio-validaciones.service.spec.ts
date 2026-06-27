import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';
import { ServicioValidacionesService } from './servicio-validaciones.service';

describe('ServicioValidacionesService', () => {
  let service: ServicioValidacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioValidacionesService);
  });

  describe('cantidadOCapacidadExcluyentes', () => {
    it('retorna null cuando cantidad y capacidad son ambos null', () => {
      const group = new FormGroup({
        cantidad: new FormControl(null),
        capacidad: new FormControl(null),
      });
      expect(service.cantidadOCapacidadExcluyentes(group)).toBeNull();
    });

    it('retorna null cuando solo cantidad tiene valor', () => {
      const group = new FormGroup({
        cantidad: new FormControl(5),
        capacidad: new FormControl(null),
      });
      expect(service.cantidadOCapacidadExcluyentes(group)).toBeNull();
    });

    it('retorna null cuando solo capacidad tiene valor', () => {
      const group = new FormGroup({
        cantidad: new FormControl(null),
        capacidad: new FormControl(10),
      });
      expect(service.cantidadOCapacidadExcluyentes(group)).toBeNull();
    });

    it('retorna { cantidadYCapacidad: true } cuando ambos tienen valor', () => {
      const group = new FormGroup({
        cantidad: new FormControl(5),
        capacidad: new FormControl(10),
      });
      expect(service.cantidadOCapacidadExcluyentes(group)).toEqual({ cantidadYCapacidad: true });
    });
  });

  describe('getInfoErrors', () => {
    function makeInfoForm(withEstado = false) {
      return new FormGroup(
        {
          procedencia: new FormControl<string | null>(null, Validators.required),
          nombre: new FormControl<string | null>(null, Validators.required),
          ...(withEstado
            ? { estado: new FormControl<string | null>(null, Validators.required) }
            : {}),
          cantidad: new FormControl<number | null>(null),
          capacidad: new FormControl<number | null>(null),
        },
        { validators: [(g) => service.cantidadOCapacidadExcluyentes(g)] },
      );
    }

    it('no muestra errores cuando el form es pristine y no se hizo submit', () => {
      const form = makeInfoForm();
      expect(service.getInfoErrors(form, false)).toEqual({});
    });

    it('muestra error de procedencia cuando está touched y vacío', () => {
      const form = makeInfoForm();
      form.get('procedencia')!.markAsTouched();
      const errs = service.getInfoErrors(form, false);
      expect(errs['procedencia']).toBeDefined();
    });

    it('muestra error de nombre cuando está touched y vacío', () => {
      const form = makeInfoForm();
      form.get('nombre')!.markAsTouched();
      const errs = service.getInfoErrors(form, false);
      expect(errs['nombre']).toBeDefined();
    });

    it('muestra error de estado cuando existe en el form, está touched y vacío', () => {
      const form = makeInfoForm(true);
      form.get('estado')!.markAsTouched();
      const errs = service.getInfoErrors(form, false);
      expect(errs['estado']).toBeDefined();
    });

    it('no muestra error de estado cuando el campo no existe en el form', () => {
      const form = makeInfoForm(false);
      const errs = service.getInfoErrors(form, false);
      expect(errs['estado']).toBeUndefined();
    });

    it('no muestra error de cantidadYCapacidad cuando ningún campo fue tocado y no hay submit', () => {
      const form = makeInfoForm();
      form.get('cantidad')!.setValue(5);
      form.get('capacidad')!.setValue(10);
      const errs = service.getInfoErrors(form, false);
      expect(errs['capacidad']).toBeUndefined();
    });

    it('muestra error de cantidadYCapacidad cuando el campo cantidad fue tocado', () => {
      const form = makeInfoForm();
      form.get('cantidad')!.setValue(5);
      form.get('cantidad')!.markAsTouched();
      form.get('capacidad')!.setValue(10);
      const errs = service.getInfoErrors(form, false);
      expect(errs['capacidad']).toBeDefined();
    });

    it('muestra error de cantidadYCapacidad cuando el campo capacidad fue tocado', () => {
      const form = makeInfoForm();
      form.get('cantidad')!.setValue(5);
      form.get('capacidad')!.setValue(10);
      form.get('capacidad')!.markAsTouched();
      const errs = service.getInfoErrors(form, false);
      expect(errs['capacidad']).toBeDefined();
    });

    it('muestra error de cantidadYCapacidad tras submit aunque los campos no estén tocados', () => {
      const form = makeInfoForm();
      form.get('cantidad')!.setValue(5);
      form.get('capacidad')!.setValue(10);
      const errs = service.getInfoErrors(form, true);
      expect(errs['capacidad']).toBeDefined();
    });

    it('muestra todos los errores cuando se hace submit con form vacío', () => {
      const form = makeInfoForm(true);
      const errs = service.getInfoErrors(form, true);
      expect(errs['procedencia']).toBeDefined();
      expect(errs['nombre']).toBeDefined();
      expect(errs['estado']).toBeDefined();
    });
  });

  describe('getPreciosErrors', () => {
    function makePreciosForm() {
      return new FormGroup(
        {
          precioParticular: new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(1),
          ]),
          precioSocio: new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(1),
          ]),
          modalidadPrecio: new FormControl<string | null>(null, Validators.required),
          costoPersonaExtra: new FormControl<number | null>(null, Validators.min(0)),
        },
        { validators: [(g) => service.precioSocioMenorQueParticular(g)] },
      );
    }

    it('no muestra errores cuando el form es pristine y no se hizo submit', () => {
      expect(service.getPreciosErrors(makePreciosForm(), false)).toEqual({});
    });

    it('muestra error required de precioParticular cuando está touched y vacío', () => {
      const form = makePreciosForm();
      form.get('precioParticular')!.markAsTouched();
      expect(service.getPreciosErrors(form, false)['precioParticular']).toBeDefined();
    });

    it('muestra error min de precioParticular cuando el valor es 0', () => {
      const form = makePreciosForm();
      form.get('precioParticular')!.setValue(0);
      form.get('precioParticular')!.markAsTouched();
      expect(service.getPreciosErrors(form, false)['precioParticular']).toMatch(/mayor que 0/);
    });

    it('muestra error de precioSocio mayor cuando socio >= particular y el campo fue tocado', () => {
      const form = makePreciosForm();
      form.get('precioParticular')!.setValue(100);
      form.get('precioSocio')!.setValue(100);
      form.get('precioSocio')!.markAsTouched();
      expect(service.getPreciosErrors(form, false)['precioSocio']).toMatch(/menor/);
    });

    it('no muestra error de precioSocioMayor antes de tocar el campo o hacer submit', () => {
      const form = makePreciosForm();
      form.get('precioParticular')!.setValue(100);
      form.get('precioSocio')!.setValue(100);
      expect(service.getPreciosErrors(form, false)['precioSocio']).toBeUndefined();
    });

    it('muestra error min de precioSocio cuando el valor es 0', () => {
      const form = makePreciosForm();
      form.get('precioSocio')!.setValue(0);
      form.get('precioSocio')!.markAsTouched();
      expect(service.getPreciosErrors(form, false)['precioSocio']).toMatch(/mayor que 0/);
    });

    it('muestra todos los errores de precios al hacer submit con form vacío', () => {
      const form = makePreciosForm();
      const errs = service.getPreciosErrors(form, true);
      expect(errs['precioParticular']).toBeDefined();
      expect(errs['precioSocio']).toBeDefined();
      expect(errs['modalidadPrecio']).toBeDefined();
    });

    it('no muestra error de costoPersonaExtra cuando el valor es null', () => {
      const form = makePreciosForm();
      form.get('costoPersonaExtra')!.markAsTouched();
      expect(service.getPreciosErrors(form, false)['costoPersonaExtra']).toBeUndefined();
    });

    it('muestra error min de costoPersonaExtra cuando el valor es negativo', () => {
      const form = makePreciosForm();
      form.get('costoPersonaExtra')!.setValue(-1);
      form.get('costoPersonaExtra')!.markAsTouched();
      expect(service.getPreciosErrors(form, false)['costoPersonaExtra']).toMatch(/negativo/);
    });

    it('no muestra error de costoPersonaExtra cuando el valor es 0', () => {
      const form = makePreciosForm();
      form.get('costoPersonaExtra')!.setValue(0);
      form.get('costoPersonaExtra')!.markAsTouched();
      expect(service.getPreciosErrors(form, false)['costoPersonaExtra']).toBeUndefined();
    });
  });

  describe('precioSocioMenorQueParticular', () => {
    it('retorna null cuando precioParticular es null', () => {
      const group = new FormGroup({
        precioParticular: new FormControl(null),
        precioSocio: new FormControl(50),
      });
      expect(service.precioSocioMenorQueParticular(group)).toBeNull();
    });

    it('retorna null cuando precioSocio es null', () => {
      const group = new FormGroup({
        precioParticular: new FormControl(100),
        precioSocio: new FormControl(null),
      });
      expect(service.precioSocioMenorQueParticular(group)).toBeNull();
    });

    it('retorna null cuando precioParticular es 0', () => {
      const group = new FormGroup({
        precioParticular: new FormControl(0),
        precioSocio: new FormControl(0),
      });
      expect(service.precioSocioMenorQueParticular(group)).toBeNull();
    });

    it('retorna null cuando precioSocio es 0', () => {
      const group = new FormGroup({
        precioParticular: new FormControl(100),
        precioSocio: new FormControl(0),
      });
      expect(service.precioSocioMenorQueParticular(group)).toBeNull();
    });

    it('retorna null cuando socio es menor que particular', () => {
      const group = new FormGroup({
        precioParticular: new FormControl(100),
        precioSocio: new FormControl(80),
      });
      expect(service.precioSocioMenorQueParticular(group)).toBeNull();
    });

    it('retorna { precioSocioMayor: true } cuando socio es igual a particular', () => {
      const group = new FormGroup({
        precioParticular: new FormControl(100),
        precioSocio: new FormControl(100),
      });
      expect(service.precioSocioMenorQueParticular(group)).toEqual({ precioSocioMayor: true });
    });

    it('retorna { precioSocioMayor: true } cuando socio es mayor que particular', () => {
      const group = new FormGroup({
        precioParticular: new FormControl(100),
        precioSocio: new FormControl(150),
      });
      expect(service.precioSocioMenorQueParticular(group)).toEqual({ precioSocioMayor: true });
    });
  });
});
