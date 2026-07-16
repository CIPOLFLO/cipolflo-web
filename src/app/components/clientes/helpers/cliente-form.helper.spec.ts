import { FormControl, FormGroup } from '@angular/forms';
import { DestroyRef, signal } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import {
  patchClienteForm,
  buildUbicacionFields,
  submitRegistroCliente,
} from './cliente-form.helper';
import {
  ClienteDetalleRespuestaDto,
  EstadoSocio,
  MetodoCobro,
  TipoCliente,
  CategoriaSocio,
} from '../models/cliente.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

const baseCliente: ClienteDetalleRespuestaDto = {
  id: 1,
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 42,
  nombre: 'Lucía',
  cedula: '5.191.926-8',
  rut: null,
  telefono: '099000000',
  email: 'lucia@example.com',
  pais: 'Uruguay',
  departamento: 'Flores',
  ciudad: 'Trinidad',
  direccion: 'Calle A',
  categoriaSocio: CategoriaSocio.SocioComun,
  fechaIngreso: '2020-01-01',
  observaciones: 'Nota',
  fechaNacimiento: '1999-06-29',
  estado: EstadoSocio.Activo,
  metodoCobro: MetodoCobro.Cobradora,
  createdAt: '2026-01-01',
  createdBy: 'admin',
  updatedAt: '',
  updatedBy: '',
  ultimaCuotaDto: null,
};

function buildForm(): FormGroup {
  return new FormGroup({
    numeroSocio: new FormControl<string | null>(null),
    cedula: new FormControl<string | null>(null),
    nombre: new FormControl<string | null>(null),
    telefono: new FormControl<string | null>(null),
    email: new FormControl<string | null>(null),
    pais: new FormControl<string | null>(null),
    departamento: new FormControl<string | null>(null),
    ciudad: new FormControl<string | null>(null),
    direccion: new FormControl<string | null>(null),
    observaciones: new FormControl<string | null>(null),
    fechaNacimiento: new FormControl<string | null>(null),
    estado: new FormControl<string | null>(null),
    metodoCobro: new FormControl<string | null>(null),
    categoriaSocio: new FormControl<CategoriaSocio | null>(null),
    fechaIngreso: new FormControl<string | null>(null),
  });
}

describe('patchClienteForm', () => {
  it('parchea todos los campos con valores presentes', () => {
    const form = buildForm();
    patchClienteForm(form, baseCliente);

    expect(form.get('nombre')?.value).toBe('Lucía');
    expect(form.get('cedula')?.value).toBe('5.191.926-8');
    expect(form.get('telefono')?.value).toBe('099000000');
    expect(form.get('email')?.value).toBe('lucia@example.com');
    expect(form.get('pais')?.value).toBe('Uruguay');
    expect(form.get('departamento')?.value).toBe('Flores');
    expect(form.get('ciudad')?.value).toBe('Trinidad');
    expect(form.get('direccion')?.value).toBe('Calle A');
    expect(form.get('observaciones')?.value).toBe('Nota');
    expect(form.get('fechaNacimiento')?.value).toBe('1999-06-29');
    expect(form.get('estado')?.value).toBe(EstadoSocio.Activo);
    expect(form.get('metodoCobro')?.value).toBe(MetodoCobro.Cobradora);
    expect(form.get('numeroSocio')?.value).toBe('42');
    expect(form.get('categoriaSocio')?.value).toBe(CategoriaSocio.SocioComun);
    expect(form.get('fechaIngreso')?.value).toBe('2020-01-01');
  });

  it('parchea campos nulos con null (cubre branch ?? null)', () => {
    const form = buildForm();
    const clienteNulo: ClienteDetalleRespuestaDto = {
      ...baseCliente,
      numeroSocio: null,
      email: null,
      pais: null,
      departamento: null,
      ciudad: null,
      direccion: null,
      observaciones: null,
      fechaNacimiento: null,
      estado: null,
      metodoCobro: null,
      categoriaSocio: null,
      fechaIngreso: null,
    };

    patchClienteForm(form, clienteNulo);

    expect(form.get('numeroSocio')?.value).toBeNull();
    expect(form.get('email')?.value).toBeNull();
    expect(form.get('pais')?.value).toBeNull();
    expect(form.get('departamento')?.value).toBeNull();
    expect(form.get('ciudad')?.value).toBeNull();
    expect(form.get('direccion')?.value).toBeNull();
    expect(form.get('observaciones')?.value).toBeNull();
    expect(form.get('fechaNacimiento')?.value).toBeNull();
    expect(form.get('estado')?.value).toBeNull();
    expect(form.get('metodoCobro')?.value).toBeNull();
    expect(form.get('categoriaSocio')?.value).toBeNull();
    expect(form.get('fechaIngreso')?.value).toBeNull();
  });
});

describe('buildUbicacionFields', () => {
  it('retorna los 4 campos de ubicación con pais por defecto Uruguay', () => {
    const fields = buildUbicacionFields();

    expect(fields).toHaveLength(4);
    expect(fields.map((f) => f.key)).toEqual(['pais', 'departamento', 'ciudad', 'direccion']);

    const pais = fields.find((f) => f.key === 'pais');
    expect(pais?.required).toBe(true);
    expect(pais?.defaultValue).toBe('Uruguay');

    const direccion = fields.find((f) => f.key === 'direccion');
    expect(direccion?.required).toBeUndefined();
  });

  it('marca dirección como requerida cuando direccionRequerida es true', () => {
    const direccion = buildUbicacionFields(true).find((f) => f.key === 'direccion');
    expect(direccion?.required).toBe(true);
  });
});

function fakeDestroyRef(): DestroyRef {
  return { onDestroy: () => () => undefined } as unknown as DestroyRef;
}

function fakeErrorHandler(): ErrorHandlerService {
  return { handle: vi.fn() } as unknown as ErrorHandlerService;
}

describe('submitRegistroCliente', () => {
  it('setea loading en true al iniciar y en false al finalizar (éxito)', () => {
    const loading = signal(false);
    const onSuccess = vi.fn();
    const errorHandler = fakeErrorHandler();

    submitRegistroCliente(of({ id: 1 }), {
      loading,
      destroyRef: fakeDestroyRef(),
      errorHandler,
      onSuccess,
    });

    expect(loading()).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    expect(errorHandler.handle).not.toHaveBeenCalled();
  });

  it('llama a errorHandler.handle y apaga loading cuando el observable falla', () => {
    const loading = signal(false);
    const onSuccess = vi.fn();
    const errorHandler = fakeErrorHandler();
    const error = new Error('falló');

    submitRegistroCliente(
      throwError(() => error),
      {
        loading,
        destroyRef: fakeDestroyRef(),
        errorHandler,
        onSuccess,
      },
    );

    expect(loading()).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(errorHandler.handle).toHaveBeenCalledWith(error);
  });
});
