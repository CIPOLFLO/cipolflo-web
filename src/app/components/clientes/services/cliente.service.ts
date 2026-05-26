import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  ClienteCrearDto,
  ClienteDetalleRespuestaDto,
  ClienteRespuestaDto,
  EstadoCliente,
  MetodoPago,
  TipoCliente,
} from '../models/cliente.model';

const PLACEHOLDER_CLIENTES: ClienteDetalleRespuestaDto[] = [
  {
    id: 1,
    nombre: 'Lucía Rodríguez',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '123',
    cedula: '5.191.926-8',
    email: 'lucia.rodriguez@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '29/06/1999',
    telefono: '099985648',
    metodoPago: MetodoPago.Cobradora,
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Luis Alberto de Herrera 123',
    observaciones: 'Socia nueva',
    createdAt: '2026-03-15T14:30:00Z',
    createdBy: 'Pedro Aguirre',
    updatedAt: '2026-03-18T09:15:00Z',
    updatedBy: 'Mariana Silva',
  },
  {
    id: 2,
    nombre: 'Martín González',
    tipoCliente: TipoCliente.Particular,
    numeroSocio: '-',
    cedula: '2.345.678-9',
    email: 'martin.gonzalez@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '15/04/1985',
    telefono: '099123456',
    metodoPago: MetodoPago.Caja,
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'José Batlle y Ordóñez 456',
    observaciones: 'Cliente frecuente',
    createdAt: '2026-01-10T10:30:00Z',
    createdBy: 'Laura Méndez',
    updatedAt: '2026-02-22T16:30:00Z',
    updatedBy: 'Pedro Aguirre',
  },
  {
    id: 3,
    nombre: 'Sofía Pereira',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '878',
    cedula: '3.456.789-0',
    email: 'sofia.pereira@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '20/08/1990',
    telefono: '098456789',
    metodoPago: MetodoPago.DebitoAutomatico,
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: '25 de Agosto 789',
    observaciones: 'Pago al día',
    createdAt: '2026-04-15T08:30:00Z',
    createdBy: 'Mariana Silva',
    updatedAt: '2026-05-15T14:30:00Z',
    updatedBy: 'Mariana Silva',
  },
  {
    id: 4,
    nombre: 'Diego Fernández',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '456',
    cedula: '4.567.890-1',
    email: 'diego.fernandez@example.com',
    estado: EstadoCliente.Inactivo,
    fechaNacimiento: '03/11/1982',
    telefono: '097654321',
    metodoPago: MetodoPago.Cobradora,
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Manuel Oribe 321',
    observaciones: 'Socio inactivo por falta de pago',
    createdAt: '2025-12-18T17:25:00Z',
    createdBy: 'Pedro Aguirre',
    updatedAt: '2026-03-05T12:30:00Z',
    updatedBy: 'Laura Méndez',
  },
  {
    id: 5,
    nombre: 'Valentina Suárez',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '9754',
    cedula: '5.678.901-2',
    email: 'valentina.suarez@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '12/02/1988',
    telefono: '096789123',
    metodoPago: MetodoPago.Transferencia,
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Sarandí 654',
    observaciones: 'Documentación actualizada',
    createdAt: '2026-01-08T13:45:00Z',
    createdBy: 'Mariana Silva',
    updatedAt: '2026-03-14T18:10:00Z',
    updatedBy: 'Pedro Aguirre',
  },
  {
    id: 6,
    nombre: 'Andrés Martínez',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '777',
    cedula: '6.789.012-3',
    email: 'andres.martinez@example.com',
    estado: EstadoCliente.Baja,
    fechaNacimiento: '09/09/1980',
    telefono: '095321654',
    metodoPago: MetodoPago.Caja,
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Artigas 987',
    observaciones: 'Cliente dado de baja',
    createdAt: '2025-11-20T15:00:00Z',
    createdBy: 'Laura Méndez',
    updatedAt: '2026-03-01T09:50:00Z',
    updatedBy: 'Pedro Aguirre',
  },
  {
    id: 7,
    nombre: 'Camila Núñez',
    tipoCliente: TipoCliente.Particular,
    numeroSocio: '-',
    cedula: '7.890.123-4',
    email: 'camila.nunez@example.com',
    estado: EstadoCliente.Activo,
    fechaNacimiento: '18/07/1992',
    telefono: '094987654',
    metodoPago: MetodoPago.Efectivo,
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Treinta y Tres 147',
    observaciones: 'Consulta frecuentemente disponibilidad',
    createdAt: '2026-02-11T10:35:00Z',
    createdBy: 'Pedro Aguirre',
    updatedAt: '2026-02-11T10:35:00Z',
    updatedBy: 'Pedro Aguirre',
  },
  {
    id: 8,
    nombre: 'Paula Morales',
    tipoCliente: TipoCliente.Socio,
    numeroSocio: '178',
    cedula: '8.901.234-5',
    email: 'paula.morales@example.com',
    estado: EstadoCliente.Inactivo,
    fechaNacimiento: '25/12/1987',
    telefono: '093147258',
    metodoPago: MetodoPago.Cobradora,
    pais: 'Uruguay',
    departamento: 'Flores',
    ciudad: 'Trinidad',
    direccion: 'Rincón 258',
    observaciones: 'Revisar datos de contacto',
    createdAt: '2025-12-30T19:10:00Z',
    createdBy: 'Mariana Silva',
    updatedAt: '2026-03-10T14:00:00Z',
    updatedBy: 'Laura Méndez',
  },
];
@Injectable({ providedIn: 'root' })
export class ClientesService {
  getAll(params: TableQueryParams): Observable<PageResponse<ClienteRespuestaDto>> {
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

    const content: ClienteRespuestaDto[] = clientesFiltrados
      .slice(start, start + params.size)
      .map((cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        tipoCliente: cliente.tipoCliente,
        numeroSocio: cliente.numeroSocio,
        cedula: cliente.cedula,
        email: cliente.email,
        estado: cliente.estado,
      }));

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

  getById(id: number): Observable<ClienteDetalleRespuestaDto | undefined> {
    return of(PLACEHOLDER_CLIENTES.find((cliente) => cliente.id === id));
  }

  create(dto: Partial<ClienteCrearDto>): Observable<ClienteDetalleRespuestaDto> {
    console.log('Crear cliente', dto);

    return of({
      id: PLACEHOLDER_CLIENTES.length + 1,
      nombre: dto.nombre ?? '',
      tipoCliente: TipoCliente.Socio,
      numeroSocio: String(PLACEHOLDER_CLIENTES.length + 1).padStart(3, '0'),
      cedula: dto.cedula ?? '',
      email: dto.email ?? '',
      estado: EstadoCliente.Activo,
      fechaNacimiento: dto.fechaNacimiento ?? '',
      telefono: dto.telefono ?? '',
      metodoPago: dto.metodoPago ?? MetodoPago.Cobradora,
      pais: dto.pais ?? '',
      departamento: dto.departamento ?? '',
      ciudad: dto.ciudad ?? '',
      direccion: dto.direccion ?? '',
      observaciones: dto.observaciones ?? '',
      createdAt: new Date().toISOString(),
      createdBy: 'Juan Pérez',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Juan Pérez',
    });
  }
}


