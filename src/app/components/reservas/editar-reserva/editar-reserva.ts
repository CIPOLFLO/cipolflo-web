import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageLayout } from '../../../shared/layout/page-layout/page-layout';
import { FormLayout } from '../../../shared/components/form-layout/form-layout';
import { FormSection } from '../../../shared/components/form-section/form-section';
import { FormActions } from '../../../shared/components/form-actions/form-actions';
import { AppButton } from '../../../shared/components/button/button';
import { DetailSection } from '../../../shared/components/detail-section/detail-section';
import { DetailRegistroSection } from '../../../shared/components/detail-registro-section/detail-registro-section';
import { FormFieldConfig } from '../../../shared/models/form-field.model';
import { DetailFieldConfig, DetailRegistroData } from '../../../shared/models/detail-field.model';

@Component({
  selector: 'app-editar-reserva',
  imports: [
    PageLayout,
    FormLayout,
    FormSection,
    FormActions,
    AppButton,
    DetailSection,
    DetailRegistroSection,
  ],
  templateUrl: './editar-reserva.html',
  styleUrl: './editar-reserva.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarReserva {
  private readonly router = inject(Router);

  // Campos con locked:true quedan deshabilitados + muestran ícono de candado
  protected readonly reservaFields: FormFieldConfig[] = [
    {
      key: 'numeroReserva',
      label: 'Número de Reserva',
      type: 'text',
      defaultValue: 'RSV-2026-001',
      locked: true,
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'text',
      defaultValue: 'Confirmada',
      locked: true,
    },
    {
      key: 'procedencia',
      label: 'Procedencia',
      type: 'select',
      options: [
        { label: 'Web', value: 'web' },
        { label: 'Presencial', value: 'presencial' },
        { label: 'Telefónica', value: 'telefonica' },
      ],
      defaultValue: 'web',
    },
    {
      key: 'concepto',
      label: 'Concepto',
      type: 'select',
      options: [
        { label: 'Hospedaje', value: 'hospedaje' },
        { label: 'Eventos', value: 'eventos' },
        { label: 'Camping', value: 'camping' },
        { label: 'Servicios', value: 'servicios' },
      ],
      defaultValue: 'hospedaje',
    },
    {
      key: 'cantidadPersonas',
      label: 'Cantidad de Personas',
      type: 'text',
      defaultValue: '2',
    },
    {
      key: 'fechaInicio',
      label: 'Fecha Inicio',
      type: 'date',
      defaultValue: '2026-03-25',
    },
    {
      key: 'fechaFin',
      label: 'Fecha Fin',
      type: 'date',
      defaultValue: '2026-03-28',
    },
    {
      key: 'importe',
      label: 'Importe',
      type: 'text',
      defaultValue: '$ 3.500',
      locked: true,
    },
  ];

  // Sección de cliente: solo lectura en edición
  protected readonly clienteFields: DetailFieldConfig[] = [
    { key: 'tipoCliente', label: 'Tipo de Cliente', value: 'Socio' },
    { key: 'ci', label: 'CI / Nro de Socio', value: '12345678' },
    { key: 'nombre', label: 'Nombre', value: 'Carlos Martínez Gómez' },
    { key: 'celular', label: 'Celular', value: '+598 99 123 456' },
    { key: 'email', label: 'Email', value: 'carlos.martinez@email.com' },
  ];

  protected readonly adicionalFields: FormFieldConfig[] = [
    {
      key: 'notas',
      label: 'Notas / Observaciones',
      type: 'textarea',
      defaultValue: 'Las personas llegarán alrededor de las 17hs',
      fullWidth: true,
    },
  ];

  protected readonly registroData: DetailRegistroData = {
    entityId: 'RSV-2026-001',
    entityIdLabel: 'ID de la Reserva',
    fechaRegistro: '15 mar 2026, 14:30',
    registradoPor: 'Juan Pérez',
  };

  protected onCancelar(): void {
    this.router.navigate(['/reservas', 'RSV-2026-001']);
  }

  protected onConfirmar(): void {
    // En producción: llamar a ReservasService.update(id, formData)
    this.router.navigate(['/reservas', 'RSV-2026-001']);
  }
}
