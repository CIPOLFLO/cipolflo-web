import { FormControl, FormGroup } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { patchClienteForm } from './cliente-form.helper';
import {
  ClienteDetalleRespuestaDto,
  EstadoSocio,
  MetodoCobro,
  TipoCliente,
} from '../models/cliente.model';

const baseCliente: ClienteDetalleRespuestaDto = {
  id: 1,
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 42,
  nombre: 'Lucía',
  cedula: '5.191.926-8',
  telefono: '099000000',
  email: 'lucia@example.com',
  pais: 'Uruguay',
  departamento: 'Flores',
  ciudad: 'Trinidad',
  direccion: 'Calle A',
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
  });
});
