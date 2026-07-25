import { Injectable, inject } from '@angular/core';
import { ColumnConfig } from '../../../shared';
import { EstadoSocio, CATEGORIA_SOCIO_LABEL, CategoriaSocio } from '../models/cliente.model';
import { CedulaFormatPipe } from '../pipes/cedula-format.pipe';

@Injectable()
export class ClientesColumnsService {
  private readonly cedulaFormat = inject(CedulaFormatPipe);

  readonly columns: ColumnConfig[] = [
    { key: 'nombreCompleto', label: 'Nombre', sortable: true },
    { key: 'numeroSocio', label: 'Nro de socio', nullFallback: '—' },
    {
      key: 'ultimaCuotaDto',
      label: 'Última cuota paga',
      nullFallback: '—',
      transform: (v) => {
        const ultimaCuota = v as { descripcion?: string } | null;
        return ultimaCuota?.descripcion ?? '—';
      },
    },
    {
      key: 'documento',
      label: 'Documento',
      nullFallback: '—',
      transform: (v) => this.cedulaFormat.transform(v as string),
    },
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
    {
      key: 'categoriaSocio',
      label: 'Categoría',
      cellType: 'tag',
      nullFallback: '—',
      tagMap: {
        [CategoriaSocio.PoliciaActivo]: {
          styleClass: 'tag--blue',
          label: CATEGORIA_SOCIO_LABEL[CategoriaSocio.PoliciaActivo],
        },
        [CategoriaSocio.PoliciaRetirado]: {
          styleClass: 'tag--purple',
          label: CATEGORIA_SOCIO_LABEL[CategoriaSocio.PoliciaRetirado],
        },
        [CategoriaSocio.SocioComun]: {
          styleClass: 'tag--gray',
          label: CATEGORIA_SOCIO_LABEL[CategoriaSocio.SocioComun],
        },
      },
    },
    {
      key: 'antiguedad',
      label: 'Antigüedad',
      nullFallback: '—',
    },
  ];
}
