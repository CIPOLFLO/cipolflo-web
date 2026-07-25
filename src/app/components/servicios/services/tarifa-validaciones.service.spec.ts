import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';
import { TarifaValidacionesService } from './tarifa-validaciones.service';
import { TipoClienteTarifa } from '../models/servicio.model';

describe('TarifaValidacionesService', () => {
  let service: TarifaValidacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TarifaValidacionesService);
  });

  function makeTarifaGroup(overrides: {
    tipoCliente?: TipoClienteTarifa | null;
    antiguedadMinima?: number | null;
    antiguedadMaxima?: number | null;
  }) {
    return new FormGroup({
      tipoCliente: new FormControl<TipoClienteTarifa | null>(overrides.tipoCliente ?? null),
      antiguedadMinima: new FormControl<number | null>(overrides.antiguedadMinima ?? null),
      antiguedadMaxima: new FormControl<number | null>(overrides.antiguedadMaxima ?? null),
    });
  }

  describe('rangoAntiguedadInvalido', () => {
    it('retorna null cuando ambos límites son null', () => {
      const group = makeTarifaGroup({});
      expect(service.rangoAntiguedadInvalido(group)).toBeNull();
    });

    it('retorna null cuando solo la mínima tiene valor', () => {
      const group = makeTarifaGroup({ antiguedadMinima: 5 });
      expect(service.rangoAntiguedadInvalido(group)).toBeNull();
    });

    it('retorna null cuando solo la máxima tiene valor', () => {
      const group = makeTarifaGroup({ antiguedadMaxima: 10 });
      expect(service.rangoAntiguedadInvalido(group)).toBeNull();
    });

    it('retorna null cuando mínima es menor que máxima', () => {
      const group = makeTarifaGroup({ antiguedadMinima: 0, antiguedadMaxima: 5 });
      expect(service.rangoAntiguedadInvalido(group)).toBeNull();
    });

    it('retorna null cuando mínima es igual a máxima', () => {
      const group = makeTarifaGroup({ antiguedadMinima: 5, antiguedadMaxima: 5 });
      expect(service.rangoAntiguedadInvalido(group)).toBeNull();
    });

    it('retorna { rangoAntiguedadInvalido: true } cuando mínima es mayor que máxima', () => {
      const group = makeTarifaGroup({ antiguedadMinima: 10, antiguedadMaxima: 5 });
      expect(service.rangoAntiguedadInvalido(group)).toEqual({ rangoAntiguedadInvalido: true });
    });
  });

  describe('antiguedadNoAplicaAParticular', () => {
    it('retorna null cuando el tipo de cliente no es Particular', () => {
      const group = makeTarifaGroup({
        tipoCliente: TipoClienteTarifa.SocioComun,
        antiguedadMinima: 0,
        antiguedadMaxima: 5,
      });
      expect(service.antiguedadNoAplicaAParticular(group)).toBeNull();
    });

    it('retorna null cuando es Particular sin antigüedad cargada', () => {
      const group = makeTarifaGroup({ tipoCliente: TipoClienteTarifa.Particular });
      expect(service.antiguedadNoAplicaAParticular(group)).toBeNull();
    });

    it('retorna { antiguedadNoAplicaAParticular: true } cuando es Particular con mínima cargada', () => {
      const group = makeTarifaGroup({
        tipoCliente: TipoClienteTarifa.Particular,
        antiguedadMinima: 0,
      });
      expect(service.antiguedadNoAplicaAParticular(group)).toEqual({
        antiguedadNoAplicaAParticular: true,
      });
    });

    it('retorna { antiguedadNoAplicaAParticular: true } cuando es Particular con máxima cargada', () => {
      const group = makeTarifaGroup({
        tipoCliente: TipoClienteTarifa.Particular,
        antiguedadMaxima: 5,
      });
      expect(service.antiguedadNoAplicaAParticular(group)).toEqual({
        antiguedadNoAplicaAParticular: true,
      });
    });
  });

  describe('obligatoriasFaltantes', () => {
    function makeTarifasArray(tipos: (TipoClienteTarifa | null)[]) {
      return new FormArray(
        tipos.map((tipo) => new FormGroup({ tipoCliente: new FormControl(tipo) })),
      );
    }

    it('retorna null cuando hay al menos una fila Particular y una Socio Común', () => {
      const array = makeTarifasArray([TipoClienteTarifa.Particular, TipoClienteTarifa.SocioComun]);
      expect(service.obligatoriasFaltantes(array)).toBeNull();
    });

    it('retorna { tarifasObligatoriasFaltantes: true } cuando falta la fila Particular', () => {
      const array = makeTarifasArray([TipoClienteTarifa.SocioComun]);
      expect(service.obligatoriasFaltantes(array)).toEqual({ tarifasObligatoriasFaltantes: true });
    });

    it('retorna { tarifasObligatoriasFaltantes: true } cuando falta la fila Socio Común', () => {
      const array = makeTarifasArray([TipoClienteTarifa.Particular]);
      expect(service.obligatoriasFaltantes(array)).toEqual({ tarifasObligatoriasFaltantes: true });
    });

    it('retorna { tarifasObligatoriasFaltantes: true } cuando el array está vacío', () => {
      const array = makeTarifasArray([]);
      expect(service.obligatoriasFaltantes(array)).toEqual({ tarifasObligatoriasFaltantes: true });
    });
  });
});
