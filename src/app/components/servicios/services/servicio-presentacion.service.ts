import { Injectable } from '@angular/core';
import {
  type DetailFieldConfig,
  type DetailRegistroData,
  type FormFieldConfig,
  type FormFieldOption,
  PROCEDENCIA_LABEL,
} from '../../../shared';
import {
  ESTADO_SERVICIO_OPTIONS,
  EstadoServicio,
  MODALIDAD_PRECIO_DETALLE_LABEL,
  TIPO_CLIENTE_TARIFA_LABEL,
  type ServicioDetalleRespuestaDto,
  type TarifaServicioResponseDto,
  type TarifaServicioRow,
} from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioPresentacionService {
  getRegistroData(s: ServicioDetalleRespuestaDto): DetailRegistroData {
    return {
      entityId: `SRV-${String(s.id).padStart(3, '0')}`,
      entityIdLabel: 'ID del Servicio',
      fechaRegistro: s.createdAt,
      registradoPor: s.createdBy,
    };
  }

  getInfoFieldsDetalle(s: ServicioDetalleRespuestaDto): DetailFieldConfig[] {
    const estadoLabel = s.estado === EstadoServicio.Habilitado ? 'Habilitado' : 'Deshabilitado';
    return [
      {
        key: 'procedencia',
        label: 'Procedencia',
        value: PROCEDENCIA_LABEL[s.procedencia] ?? s.procedencia,
      },
      { key: 'nombre', label: 'Nombre del Servicio', value: s.nombre },
      { key: 'estado', label: 'Estado', value: estadoLabel },
      {
        key: 'capacidad',
        label: 'Capacidad',
        value: s.capacidad != null ? String(s.capacidad) : '---',
      },
      {
        key: 'cantidad',
        label: 'Cantidad',
        value: s.cantidad != null ? String(s.cantidad) : '---',
      },
    ];
  }

  getPreciosFieldsDetalle(s: ServicioDetalleRespuestaDto): DetailFieldConfig[] {
    if (s.costoPersonaExtra == null) return [];
    return [
      {
        key: 'costoPersonaExtra',
        label: 'Costo por persona extra',
        value: `$ ${s.costoPersonaExtra}`,
      },
    ];
  }

  getTarifasFieldsDetalle(tarifas: TarifaServicioResponseDto[]): TarifaServicioRow[] {
    return tarifas.map((t) => ({
      id: t.id,
      tipoCliente: TIPO_CLIENTE_TARIFA_LABEL[t.tipoCliente] ?? t.tipoCliente,
      precio: t.precio,
      modalidad: MODALIDAD_PRECIO_DETALLE_LABEL[t.modalidadPrecio] ?? t.modalidadPrecio,
      antiguedad:
        t.antiguedadMinima != null || t.antiguedadMaxima != null
          ? `${t.antiguedadMinima ?? 0} - ${t.antiguedadMaxima ?? '∞'} años`
          : '---',
    }));
  }

  getInfoFieldsEditar(
    s: ServicioDetalleRespuestaDto | null,
    procedencias: FormFieldOption[],
  ): FormFieldConfig[] {
    return [
      {
        key: 'procedencia',
        label: 'Procedencia',
        type: 'select',
        required: true,
        placeholder: 'Seleccionar procedencia',
        options: procedencias,
        defaultValue: s?.procedencia,
      },
      {
        key: 'nombre',
        label: 'Nombre del Servicio',
        type: 'text',
        required: true,
        placeholder: 'Ej: Alquiler de cabaña, Tour guiado...',
        defaultValue: s?.nombre,
      },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        required: true,
        options: ESTADO_SERVICIO_OPTIONS,
        defaultValue: s?.estado,
        disabled: true,
        locked: true,
      },
      {
        key: 'cantidad',
        label: 'Cantidad',
        type: 'number',
        placeholder: 'Ej: 5',
        defaultValue: s?.cantidad != null ? String(s.cantidad) : undefined,
      },
      {
        key: 'capacidad',
        label: 'Capacidad',
        type: 'number',
        placeholder: 'Ej: 10',
        defaultValue: s?.capacidad != null ? String(s.capacidad) : undefined,
      },
    ];
  }

  getPreciosFieldsEditar(s: ServicioDetalleRespuestaDto | null): FormFieldConfig[] {
    return [
      {
        key: 'costoPersonaExtra',
        label: 'Costo por persona extra',
        type: 'currency',
        placeholder: '0.00',
        defaultValue: s?.costoPersonaExtra != null ? String(s.costoPersonaExtra) : undefined,
      },
    ];
  }
}
