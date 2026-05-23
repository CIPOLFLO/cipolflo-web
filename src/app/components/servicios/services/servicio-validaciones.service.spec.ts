import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
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
