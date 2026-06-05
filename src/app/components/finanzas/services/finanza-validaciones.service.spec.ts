import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Procedencia } from '../../../shared';
import { Concepto, FormaPago, TipoMovimiento } from '../models/finanza.model';
import { FinanzaValidacionesService } from './finanza-validaciones.service';

describe('FinanzaValidacionesService', () => {
  let service: FinanzaValidacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FinanzaValidacionesService] });
    service = TestBed.inject(FinanzaValidacionesService);
  });

  describe('fechaNoFutura', () => {
    it('retorna null si el valor es null', () => {
      expect(service.fechaNoFutura(new FormControl(null))).toBeNull();
    });

    it('retorna null si el valor es string vacío', () => {
      expect(service.fechaNoFutura(new FormControl(''))).toBeNull();
    });

    it('retorna null para una fecha pasada', () => {
      expect(service.fechaNoFutura(new FormControl('2020-01-15'))).toBeNull();
    });

    it('retorna null para la fecha de hoy', () => {
      const hoy = new Date();
      const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
      expect(service.fechaNoFutura(new FormControl(hoyStr))).toBeNull();
    });

    it('retorna { fechaFutura: true } para una fecha futura', () => {
      expect(service.fechaNoFutura(new FormControl('2099-12-31'))).toEqual({ fechaFutura: true });
    });

    it('retorna { fechaInvalida: true } para un string no parseable', () => {
      expect(service.fechaNoFutura(new FormControl('not-a-date'))).toEqual({ fechaInvalida: true });
    });

    it('retorna { fechaInvalida: true } cuando el mes es 0', () => {
      expect(service.fechaNoFutura(new FormControl('2026-00-15'))).toEqual({ fechaInvalida: true });
    });
  });

  describe('getMovimientoErrors', () => {
    let form: FormGroup;

    beforeEach(() => {
      form = new FormGroup({
        tipoMovimiento: new FormControl(null, Validators.required),
      });
    });

    it('retorna vacío cuando el campo tiene valor', () => {
      form.get('tipoMovimiento')!.setValue(TipoMovimiento.Ingreso);
      expect(service.getMovimientoErrors(form, false)).toEqual({});
    });

    it('no retorna error si no está touched ni submitted', () => {
      expect(service.getMovimientoErrors(form, false)).toEqual({});
    });

    it('retorna error cuando submitted es true y el campo está vacío', () => {
      expect(service.getMovimientoErrors(form, true)).toEqual({
        tipoMovimiento: 'El tipo de movimiento es obligatorio.',
      });
    });

    it('retorna error cuando el control está touched', () => {
      form.get('tipoMovimiento')!.markAsTouched();
      expect(service.getMovimientoErrors(form, false)).toEqual({
        tipoMovimiento: 'El tipo de movimiento es obligatorio.',
      });
    });
  });

  describe('getInfoErrors', () => {
    let form: FormGroup;

    beforeEach(() => {
      form = new FormGroup({
        procedencia: new FormControl(null, Validators.required),
        concepto: new FormControl(null, Validators.required),
        fecha: new FormControl(null, Validators.required),
        importe: new FormControl(null, [Validators.required, Validators.min(1)]),
        formaPago: new FormControl(null, Validators.required),
      });
    });

    it('retorna vacío cuando el formulario es válido', () => {
      form.patchValue({
        procedencia: Procedencia.Sede,
        concepto: Concepto.PagoReserva,
        fecha: '2026-01-01',
        importe: 1000,
        formaPago: FormaPago.Efectivo,
      });
      expect(service.getInfoErrors(form, false)).toEqual({});
    });

    it('retorna error de procedencia cuando está vacía y submitted', () => {
      form.patchValue({
        concepto: Concepto.Ute,
        fecha: '2026-01-01',
        importe: 100,
        formaPago: FormaPago.Efectivo,
      });
      expect(service.getInfoErrors(form, true)).toMatchObject({
        procedencia: 'La procedencia es obligatoria.',
      });
    });

    it('retorna error de concepto cuando está vacío y submitted', () => {
      form.patchValue({
        procedencia: Procedencia.Sede,
        fecha: '2026-01-01',
        importe: 100,
        formaPago: FormaPago.Efectivo,
      });
      expect(service.getInfoErrors(form, true)).toMatchObject({
        concepto: 'El concepto es obligatorio.',
      });
    });

    it('retorna error de fecha requerida cuando está vacía y submitted', () => {
      form.patchValue({
        procedencia: Procedencia.Sede,
        concepto: Concepto.Ute,
        importe: 100,
        formaPago: FormaPago.Efectivo,
      });
      expect(service.getInfoErrors(form, true)).toMatchObject({
        fecha: 'La fecha es obligatoria.',
      });
    });

    it('retorna error fechaFutura cuando la fecha es posterior a hoy', () => {
      form.get('fecha')!.addValidators(service.fechaNoFutura.bind(service));
      form.patchValue({
        procedencia: Procedencia.Sede,
        concepto: Concepto.Ute,
        fecha: '2099-12-31',
        importe: 100,
        formaPago: FormaPago.Efectivo,
      });
      form.get('fecha')!.markAsTouched();
      expect(service.getInfoErrors(form, false)).toMatchObject({
        fecha: 'La fecha no puede ser posterior a hoy.',
      });
    });

    it('retorna error fechaInvalida cuando la fecha no se puede parsear', () => {
      form.get('fecha')!.addValidators(service.fechaNoFutura.bind(service));
      form.patchValue({
        procedencia: Procedencia.Sede,
        concepto: Concepto.Ute,
        fecha: '2026-00-15',
        importe: 100,
        formaPago: FormaPago.Efectivo,
      });
      form.get('fecha')!.markAsTouched();
      expect(service.getInfoErrors(form, false)).toMatchObject({
        fecha: 'La fecha ingresada no es válida.',
      });
    });

    it('retorna error de importe requerido cuando está vacío y submitted', () => {
      form.patchValue({
        procedencia: Procedencia.Sede,
        concepto: Concepto.Ute,
        fecha: '2026-01-01',
        formaPago: FormaPago.Efectivo,
      });
      expect(service.getInfoErrors(form, true)).toMatchObject({
        importe: 'El importe es obligatorio.',
      });
    });

    it('retorna error min cuando el importe es 0', () => {
      form.patchValue({
        procedencia: Procedencia.Sede,
        concepto: Concepto.Ute,
        fecha: '2026-01-01',
        importe: 0,
        formaPago: FormaPago.Efectivo,
      });
      form.get('importe')!.markAsTouched();
      expect(service.getInfoErrors(form, false)).toMatchObject({
        importe: 'El importe debe ser mayor que 0.',
      });
    });

    it('retorna error de formaPago cuando está vacía y submitted', () => {
      form.patchValue({
        procedencia: Procedencia.Sede,
        concepto: Concepto.Ute,
        fecha: '2026-01-01',
        importe: 100,
      });
      expect(service.getInfoErrors(form, true)).toMatchObject({
        formaPago: 'La forma de pago es obligatoria.',
      });
    });
  });
});
