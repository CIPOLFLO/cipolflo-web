import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PageResponse, TableQueryParams } from '../../../shared/components/table/table.models';
import { ClienteRow, EstadoCliente, TipoCliente } from '../models/cliente.model';

const PLACEHOLDER_CLIENTES: ClienteRow[] = [
  {
    id: 1,
    nombre: 'Camila Ayuto',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '123',
    cedula: '5.191.926-8',
    email: 'email@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '29/06/1999',
    telefono: '099985648',
    metodoPago: 'Cobradora',
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Calle A 123',
    observaciones: 'Socia Nueva',
  },
  {
    id: 2,
    nombre: 'Maria Fernandez',
    tipoCliente: TipoCliente.Particular,
    numeroSocio: '-',
    cedula: '2.345.678-9',
    email: 'maria@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '15/04/1985',
    telefono: '099123456',
    metodoPago: 'Caja',
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Calle B 456',
    observaciones: 'Cliente particular',
  },
  {
    id: 3,
    nombre: 'Jo Wilson',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '878',
    cedula: '3.456.789-0',
    email: 'jo@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '20/08/1990',
    telefono: '098456789',
    metodoPago: 'Débito automático',
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Calle C 789',
    observaciones: 'Sin observaciones',
  },
  {
    id: 4,
    nombre: 'Alex Karev',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '456',
    cedula: '4.567.890-1',
    email: 'alex@example.com',
    estado: EstadoCliente.Inactivo,
    fechaNacimiento: '03/11/1982',
    telefono: '097654321',
    metodoPago: 'Cobradora',
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Calle D 321',
    observaciones: 'Socio inactivo',
  },
  {
    id: 5,
    nombre: 'Meredith Grey',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '9754',
    cedula: '5.678.901-2',
    email: 'meredith@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '12/02/1988',
    telefono: '096789123',
    metodoPago: 'Transferencia',
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Calle E 654',
    observaciones: 'Pago al día',
  },
  {
    id: 6,
    nombre: "George O'Malley",
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '777',
    cedula: '6.789.012-3',
    email: 'george@example.com',
    estado: EstadoCliente.Baja,
    fechaNacimiento: '09/09/1980',
    telefono: '095321654',
    metodoPago: 'Caja',
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Calle F 987',
    observaciones: 'Cliente dado de baja',
  },
  {
    id: 7,
    nombre: 'Christina Yang',
    tipoCliente: TipoCliente.Particular,
    numeroSocio: '-',
    cedula: '7.890.123-4',
    email: 'christina@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '18/07/1992',
    telefono: '094987654',
    metodoPago: 'Efectivo',
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Calle G 147',
    observaciones: 'Cliente frecuente',
  },
  {
    id: 8,
    nombre: 'Izzie Stevens',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '178',
    cedula: '8.901.234-5',
    email: 'izzie@example.com',
    estado: EstadoCliente.Inactivo,
    fechaNacimiento: '25/12/1987',
    telefono: '093147258',
    metodoPago: 'Cobradora',
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Calle H 258',
    observaciones: 'Revisar datos de contacto',
  },
];
@Injectable({ providedIn: 'root' })
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

  getById(id: number): Observable<ClienteRow | undefined> {
    return of(PLACEHOLDER_CLIENTES.find((cliente) => cliente.id === id));
  }
}
