import { FormControl, FormGroup, Validators } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReservaValidacionesService } from './reserva-validaciones.service';

function buildForm(): FormGroup {
  return new FormGroup({
    procedencia: new FormControl<string | null>(null, Validators.required),
    servicioId: new FormControl<string | null>(null, Validators.required),
    fechaInicio: new FormControl<string | null>(null, Validators.required),
    fechaFin: new FormControl<string | null>(null, Validators.required),
    cantidadTotal: new FormControl<string | null>(null, Validators.min(0)),
    cantidadMenores: new FormControl<string | null>(null, Validators.min(0)),
    cantidad: new FormControl<string | null>(null),
    horaInicio: new FormControl<string | null>(null),
    horaFin: new FormControl<string | null>(null),
    documento: new FormControl<string | null>(null, Validators.required),
    nombre: new FormControl<string | null>(null, Validators.required),
    celular: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>(null),
  });
}

describe('ReservaValidacionesService', () => {
  let service: ReservaValidacionesService;
  let form: FormGroup;

  beforeEach(() => {
    service = new ReservaValidacionesService();
    form = buildForm();
  });

  describe('getReservaErrors', () => {
    it('reporta los obligatorios cuando submitted es true', () => {
      const errors = service.getReservaErrors(form, true);
      expect(errors['procedencia']).toBe('La procedencia es obligatoria.');
      expect(errors['servicioId']).toBe('El servicio es obligatorio.');
      expect(errors['fechaInicio']).toBe('La fecha de inicio es obligatoria.');
      expect(errors['fechaFin']).toBe('La fecha de fin es obligatoria.');
    });

    it('no reporta obligatorios si no se envió el form ni se tocaron los campos', () => {
      const errors = service.getReservaErrors(form, false);
      expect(errors['procedencia']).toBeUndefined();
    });

    it('muestra el error de cantidad negativa de inmediato (sin submit ni blur)', () => {
      form.get('cantidadTotal')?.setValue('-1');
      const errors = service.getReservaErrors(form, false);
      expect(errors['cantidadTotal']).toBe('La cantidad no puede ser negativa.');
    });
  });

  describe('getClienteErrors', () => {
    it('reporta documento, nombre y celular obligatorios', () => {
      const errors = service.getClienteErrors(form, true);
      expect(errors['documento']).toBe('El documento es obligatorio.');
      expect(errors['nombre']).toBe('El nombre es obligatorio.');
      expect(errors['celular']).toBe('El celular es obligatorio.');
    });

    it('traduce el error de cédula inválida', () => {
      form.get('documento')?.setValue('123');
      form.get('documento')?.setErrors({ cedulaInvalida: true });
      const errors = service.getClienteErrors(form, true);
      expect(errors['documento']).toBe('La cédula ingresada no es válida.');
    });

    it('traduce el error de RUT inválido', () => {
      form.get('documento')?.setValue('123');
      form.get('documento')?.setErrors({ rutInvalido: true });
      const errors = service.getClienteErrors(form, true);
      expect(errors['documento']).toBe('El RUT ingresado no es válido.');
    });

    it('traduce el error de RUT no encontrado', () => {
      form.get('documento')?.setValue('211003420017');
      form.get('documento')?.setErrors({ rutNoEncontrado: true });
      const errors = service.getClienteErrors(form, true);
      expect(errors['documento']).toBe('No se encontró ninguna Empresa registrada con ese RUT.');
    });

    it('traduce el error de email inválido', () => {
      form.get('email')?.setErrors({ emailInvalido: true });
      const errors = service.getClienteErrors(form, true);
      expect(errors['email']).toBe('El email no es válido.');
    });

    it('no muestra errores de un campo que no fue tocado cuando no hubo submit', () => {
      form.get('documento')?.setErrors({ rutInvalido: true });
      const errors = service.getClienteErrors(form, false);
      expect(errors['documento']).toBeUndefined();
    });
  });
});
