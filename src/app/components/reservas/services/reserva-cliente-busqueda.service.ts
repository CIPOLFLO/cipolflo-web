import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { ClientesService } from '../../clientes/services/cliente.service';
import { ClienteBusquedaReservaDto } from '../models/reserva.model';

@Injectable()
export class ReservaClienteBusquedaService {
  private readonly clientesService = inject(ClientesService);

  buscarPorCedula(cedula: string): Observable<ClienteBusquedaReservaDto | null> {
    return this.clientesService.getByCedula(cedula).pipe(
      switchMap((page) => {
        const encontrado = page.content[0];
        return encontrado ? this.buscarPorId(encontrado.id) : of(null);
      }),
    );
  }

  buscarPorId(id: number): Observable<ClienteBusquedaReservaDto> {
    return this.clientesService.getById(id).pipe(
      map((c) => ({
        id: c.id,
        nombre: c.nombre,
        cedula: c.cedula ?? '',
        tipoCliente: c.tipoCliente,
        numeroSocio: c.numeroSocio,
        estado: c.estado,
        telefono: c.telefono,
        email: c.email,
        observaciones: c.observaciones,
      })),
    );
  }
}
