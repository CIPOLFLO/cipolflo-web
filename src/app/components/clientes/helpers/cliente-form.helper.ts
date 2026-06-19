import { FormGroup } from '@angular/forms';
import { ClienteDetalleRespuestaDto } from '../models/cliente.model';

export function patchClienteForm(form: FormGroup, cliente: ClienteDetalleRespuestaDto): void {
  form.patchValue({
    numeroSocio: cliente.numeroSocio === null ? null : String(cliente.numeroSocio),

    cedula: cliente.cedula ?? null,
    nombre: cliente.nombre ?? null,
    telefono: cliente.telefono ?? null,
    email: cliente.email ?? null,

    pais: cliente.pais ?? null,
    departamento: cliente.departamento ?? null,
    ciudad: cliente.ciudad ?? null,
    direccion: cliente.direccion ?? null,

    observaciones: cliente.observaciones ?? null,

    fechaNacimiento: cliente.fechaNacimiento ?? null,
    estado: cliente.estado ?? null,
    metodoCobro: cliente.metodoCobro ?? null,
  });
}
