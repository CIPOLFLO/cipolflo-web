import { Injectable } from '@angular/core';
import { ColumnConfig } from '../../../shared';
import { EstadoSocio } from '../models/cliente.model';
import { CedulaFormatPipe } from '../pipes/cedula-format.pipe';

@Injectable()
export class ClientesColumnsService {
  private readonly cedulaFormat = new CedulaFormatPipe();

  readonly columns: ColumnConfig[] = [
    { key: 'nombreCompleto', label: 'Nombre', sortable: true },
    { key: 'numeroSocio', label: 'Nro de socio', nullFallback: '—' },
    { key: 'cedula', label: 'Cédula', transform: (v) => this.cedulaFormat.transform(v as string) },
    { key: 'email', label: 'Email', nullFallback: '—' },
    {
      key: 'estado',
      label: 'Estado',
      cellType: 'tag',
      tagMap: {
        [EstadoSocio.Activo]: { styleClass: 'tag--green', label: 'Activo' },
        [EstadoSocio.Inactivo]: { styleClass: 'tag--yellow', label: 'Inactivo' },
        [EstadoSocio.Baja]: { styleClass: 'tag--gray', label: 'De baja' },
        '': { styleClass: '', label: '—' },
      },
    },
  ];
}
