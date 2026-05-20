import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PageResponse, TableQueryParams } from '../../../shared/components/table/table.models';
import { ClienteRow } from '../models/cliente.model';

const PLACEHOLDER_CLIENTES: ClienteRow[] = [
  {
    id: 1,
    nombre: 'Juan Perez',
    tipoCliente: 'SOCIO',
    numeroSocio: '123',
    cedula: '1.234.567-8',
    email: 'juan@example.com',
    estado: 'ACTIVO',
  },
  {
    id: 2,
    nombre: 'Maria Anandez',
    tipoCliente: 'PARTICULAR',
    numeroSocio: '-',
    cedula: '2.345.678-9',
    email: 'maria@example.com',
    estado: 'ACTIVO',
  },
  {
    id: 3,
    nombre: 'Jo Wilson',
    tipoCliente: 'SOCIO',
    numeroSocio: '878',
    cedula: '3.456.789-0',
    email: 'jo@example.com',
    estado: 'ACTIVO',
  },
  {
    id: 4,
    nombre: 'Alex Karev',
    tipoCliente: 'SOCIO',
    numeroSocio: '456',
    cedula: '4.567.890-1',
    email: 'alex@example.com',
    estado: 'INACTIVO',
  },
  {
    id: 5,
    nombre: 'Meredith Grey',
    tipoCliente: 'SOCIO',
    numeroSocio: '9754',
    cedula: '5.678.901-2',
    email: 'meredith@example.com',
    estado: 'ACTIVO',
  },
  {
    id: 6,
    nombre: "George O'Malley",
    tipoCliente: 'SOCIO',
    numeroSocio: '777',
    cedula: '6.789.012-3',
    email: 'george@example.com',
    estado: 'BAJA',
  },
  {
    id: 7,
    nombre: 'Christina Yang',
    tipoCliente: 'PARTICULAR',
    numeroSocio: '-',
    cedula: '7.890.123-4',
    email: 'christina@example.com',
    estado: 'ACTIVO',
  },
  {
    id: 8,
    nombre: 'Izzie Stevens',
    tipoCliente: 'SOCIO',
    numeroSocio: '178',
    cedula: '8.901.234-5',
    email: 'izzie@example.com',
    estado: 'INACTIVO',
  },
];
@Injectable()
export class ClientesService {
  getDatos(params: TableQueryParams): Observable<PageResponse<ClienteRow>> {
    const filters = params.filters ?? {};

    const clientesFiltrados = PLACEHOLDER_CLIENTES.filter((cliente) => {
      const nombre = String(filters['nombre'] ?? '').toLowerCase();
      const cedula = String(filters['cedula'] ?? '').toLowerCase();
      const tipoCliente = String(filters['tipoCliente'] ?? '');
      const estado = String(filters['estado'] ?? '');

      const coincideNombre = !nombre || cliente.nombre.toLowerCase().includes(nombre);

      const coincideCedula =
        !cedula ||
        cliente.cedula.toLowerCase().includes(cedula) ||
        cliente.numeroSocio.toLowerCase().includes(cedula);

      const coincideTipo = !tipoCliente || cliente.tipoCliente === tipoCliente;

      const coincideEstado = !estado || cliente.estado === estado;

      return coincideNombre && coincideCedula && coincideTipo && coincideEstado;
    });

    const start = params.page * params.size;
    const content = clientesFiltrados.slice(start, start + params.size);

    return of({
      content,
      page: params.page,
      size: params.size,
      totalElements: clientesFiltrados.length,
      totalPages: Math.ceil(clientesFiltrados.length / params.size),
      first: params.page === 0,
      last: start + params.size >= clientesFiltrados.length,
    });
  }
}
