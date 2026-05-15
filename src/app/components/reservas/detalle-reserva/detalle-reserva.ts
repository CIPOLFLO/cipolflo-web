import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageLayout } from '../../../shared/layout/page-layout/page-layout';
import { FormLayout } from '../../../shared/components/form-layout/form-layout';
import { FormActions } from '../../../shared/components/form-actions/form-actions';
import { AppButton } from '../../../shared/components/button/button';
import { DetailSection } from '../../../shared/components/detail-section/detail-section';
import { DetailRegistroSection } from '../../../shared/components/detail-registro-section/detail-registro-section';
import { DetailFieldConfig, DetailRegistroData } from '../../../shared/models/detail-field.model';

@Component({
  selector: 'app-detalle-reserva',
  imports: [PageLayout, FormLayout, FormActions, AppButton, DetailSection, DetailRegistroSection],
  templateUrl: './detalle-reserva.html',
  styleUrl: './detalle-reserva.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleReserva {
  private readonly router = inject(Router);

  // Datos mock — en producción vendrían de ReservasService.getById(id)
  protected readonly reservaFields: DetailFieldConfig[] = [
    { key: 'numeroReserva', label: 'Número de Reserva', value: 'RSV-2026-001' },
    { key: 'estado', label: 'Estado', value: 'Confirmada' },
    { key: 'procedencia', label: 'Procedencia', value: 'Web' },
    { key: 'concepto', label: 'Concepto', value: 'Hospedaje' },
    { key: 'cantidadPersonas', label: 'Cantidad de Personas', value: '2' },
    { key: 'fechaInicio', label: 'Fecha Inicio', value: '25/03/2026' },
    { key: 'fechaFin', label: 'Fecha Fin', value: '28/03/2026' },
    { key: 'importe', label: 'Importe', value: '$ 3.500' },
  ];

  protected readonly clienteFields: DetailFieldConfig[] = [
    { key: 'tipoCliente', label: 'Tipo de Cliente', value: 'Socio' },
    { key: 'ci', label: 'CI / Nro de Socio', value: '12345678' },
    { key: 'nombre', label: 'Nombre', value: 'Carlos Martínez Gómez' },
    { key: 'celular', label: 'Celular', value: '+598 99 123 456' },
    { key: 'email', label: 'Email', value: 'carlos.martinez@email.com' },
  ];

  protected readonly adicionalFields: DetailFieldConfig[] = [
    {
      key: 'notas',
      label: 'Notas / Observaciones',
      value: 'Las personas llegarán alrededor de las 17hs',
      fullWidth: true,
      multiline: true,
    },
  ];

  protected readonly registroData: DetailRegistroData = {
    entityId: 'RSV-2026-001',
    entityIdLabel: 'ID de la Reserva',
    fechaRegistro: '15 mar 2026, 14:30',
    registradoPor: 'Juan Pérez',
  };

  protected onEditar(): void {
    this.router.navigate(['/reservas', 'RSV-2026-001', 'editar']);
  }

  protected onVolver(): void {
    this.router.navigate(['/reservas']);
  }
}
