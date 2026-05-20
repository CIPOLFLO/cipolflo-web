import { Injectable } from '@angular/core';
import { ColumnConfig } from '../../../shared';
import { EstadoServicio } from '../models/servicio.model';

@Injectable()
export class ServiciosColumnsService {
  readonly columns: ColumnConfig[] = [
    { key: 'procedencia', label: 'Procedencia' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'precioSocio', label: 'Precio Socio', cellType: 'price', unitKey: 'unidad', colorVariant: 'green' },
    { key: 'precioParticular', label: 'Precio Particular', cellType: 'price', unitKey: 'unidad' },
    {
      key: 'estado',
      label: 'Estado',
      cellType: 'tag',
      tagMap: {
        [EstadoServicio.Habilitado]: { styleClass: 'tag--green', label: 'Habilitado' },
        [EstadoServicio.Deshabilitado]: { styleClass: 'tag--gray', label: 'Deshabilitado' },
      },
    },
  ];
}
