import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { ClientesService } from '../../clientes/services/cliente.service';
import { ClienteBusquedaReservaDto, TipoDocumento } from '../models/reserva.model';
import { TipoCliente } from '../../clientes/models/cliente.model';

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

  buscarPorRut(rut: string): Observable<ClienteBusquedaReservaDto | null> {
    return this.clientesService.getByRut(rut).pipe(
      map((dto) =>
        dto
          ? {
              id: dto.id,
              nombre: dto.nombre,
              documento: dto.rut,
              tipoDocumento: TipoDocumento.Rut,
              tipoCliente: dto.tipoCliente,
              numeroSocio: null,
              estado: null,
              telefono: dto.telefono,
              email: dto.mail,
              observaciones: dto.observaciones,
            }
          : null,
      ),
    );
  }

  buscarPorId(id: number): Observable<ClienteBusquedaReservaDto> {
  return this.clientesService.getById(id).pipe(
    map((c) => {
      const esEmpresa = c.tipoCliente === TipoCliente.Empresa;
      return {
        id: c.id,
        nombre: c.nombre,
        documento: (esEmpresa ? c.rut : c.cedula) ?? '',
        tipoDocumento: esEmpresa ? TipoDocumento.Rut : TipoDocumento.Cedula,
        tipoCliente: c.tipoCliente,
        numeroSocio: c.numeroSocio,
        estado: c.estado,
        telefono: c.telefono,
        email: c.email,
        observaciones: c.observaciones,
      };
    }),
  );
}
}