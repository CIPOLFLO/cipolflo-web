import { Injectable } from '@angular/core';
import { ColumnConfig } from '../../../shared';
import { EstadoCliente } from '../models/cliente.model';

@Injectable()
export class ClientesColumnsService {
  readonly columns: ColumnConfig[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'numeroSocio', label: 'Nro de socio' },
    { key: 'cedula', label: 'Cédula' },
    { key: 'email', label: 'Email' },
    {
      key: 'estado',
      label: 'Estado',
      cellType: 'tag',
      tagMap: {
        [EstadoCliente.Activo]: { styleClass: 'tag--green', label: 'Activo' },
        [EstadoCliente.Inactivo]: { styleClass: 'tag--yellow', label: 'Inactivo' },
        [EstadoCliente.Baja]: { styleClass: 'tag--gray', label: 'De baja' },
      },
    },
  ];
}
