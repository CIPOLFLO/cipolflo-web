import { Injectable, inject } from '@angular/core';
import { ColumnConfig } from '../../../shared';
import { EstadoSocio } from '../models/cliente.model';
import { CedulaFormatPipe } from '../pipes/cedula-format.pipe';

@Injectable()
export class ClientesColumnsService {
  private readonly cedulaFormat = inject(CedulaFormatPipe);

  readonly columns: ColumnConfig[] = [
    { key: 'nombreCompleto', label: 'Nombre', sortable: true },
    { key: 'numeroSocio', label: 'Nro de socio', nullFallback: '—' },
    {
      key: 'ultimaCuota',
      label: 'Última cuota paga',
      nullFallback: '—',
      transform: (v) => {
        const ultimaCuota = v as { descripcion?: string } | null;
        return ultimaCuota?.descripcion ?? '—';
      },
    },
    { key: 'cedula', label: 'Cédula', transform: (v) => this.cedulaFormat.transform(v as string) },
    { key: 'email', label: 'Email', nullFallback: '—' },
    {
      key: 'estado',
      label: 'Estado',
      cellType: 'tag',
      nullFallback: '—',
      tagMap: {
        [EstadoSocio.Activo]: { styleClass: 'tag--green', label: 'Activo' },
        [EstadoSocio.Inactivo]: { styleClass: 'tag--yellow', label: 'Inactivo' },
        [EstadoSocio.Baja]: { styleClass: 'tag--gray', label: 'De baja' },
      },
    },
  ];
}
