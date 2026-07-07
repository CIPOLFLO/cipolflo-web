import { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { FormFieldConfig } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
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

/** Campos de ubicación (país/departamento/ciudad/dirección), compartidos entre altas de cliente. */
export function buildUbicacionFields(): FormFieldConfig[] {
  return [
    { key: 'pais', label: 'País', type: 'text', required: true, defaultValue: 'Uruguay' },
    { key: 'departamento', label: 'Departamento', type: 'text', required: true },
    { key: 'ciudad', label: 'Ciudad', type: 'text', required: true },
    { key: 'direccion', label: 'Dirección', type: 'text' },
  ];
}

/** Boilerplate de submit (loading + subscribe + error handling), compartido entre altas de cliente. */
export function submitRegistroCliente<T>(
  source$: Observable<T>,
  opts: {
    loading: WritableSignal<boolean>;
    destroyRef: DestroyRef;
    errorHandler: ErrorHandlerService;
    onSuccess: (result: T) => void;
  },
): void {
  opts.loading.set(true);
  source$
    .pipe(
      takeUntilDestroyed(opts.destroyRef),
      finalize(() => opts.loading.set(false)),
    )
    .subscribe({
      next: opts.onSuccess,
      error: (err: unknown) => opts.errorHandler.handle(err),
    });
}
