import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, map, switchMap } from 'rxjs';
import {
  AppButton,
  DetailRegistroSection,
  DetailSection,
  FormActions,
  FormLayout,
  PageLayout,
  PROCEDENCIA_LABEL,
  type DetailFieldConfig,
  type DetailRegistroData,
} from '../../../shared';
import { EstadoServicio, MODALIDAD_PRECIO_DETALLE_LABEL } from '../models/servicio.model';
import { ServicioService } from '../services/servicio.service';

@Component({
  standalone: true,
  selector: 'app-detalle-servicio',
  imports: [
    CommonModule,
    PageLayout,
    FormLayout,
    FormActions,
    AppButton,
    DetailSection,
    DetailRegistroSection,
  ],
  templateUrl: './detalle-servicio.html',
  styleUrls: ['./detalle-servicio.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleServicio {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly servicioService = inject(ServicioService);

  protected readonly servicioId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly servicio = toSignal(
    toObservable(this.servicioId).pipe(
      filter((id) => /^\d+$/.test(id)),
      switchMap((id) =>
        this.servicioService.getById(Number(id)).pipe(
          // TODO: Manejar errores HTTP mostrando feedback al usuario (toast/redirect).
          // Actualmente se atrapan y se suprimen aquí, lo que puede dejar la página en blanco.
          catchError(() => EMPTY),
        ),
      ),
    ),
    { initialValue: null },
  );

  protected readonly infoFields = computed<DetailFieldConfig[]>(() => {
    const s = this.servicio();
    if (!s) return [];
    const estadoLabel = s.estado === EstadoServicio.Habilitado ? 'Habilitado' : 'Deshabilitado';
    return [
      {
        key: 'procedencia',
        label: 'Procedencia',
        value: PROCEDENCIA_LABEL[s.procedencia] ?? s.procedencia,
      },
      { key: 'nombre', label: 'Nombre del Servicio', value: s.nombre },
      { key: 'estado', label: 'Estado', value: estadoLabel },
      // Usar != null para cubrir null y undefined
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
  });

  protected readonly preciosFields = computed<DetailFieldConfig[]>(() => {
    const s = this.servicio();
    if (!s) return [];
    return [
      { key: 'precioParticular', label: 'Precio particular', value: `$ ${s.precioParticular}` },
      { key: 'precioSocio', label: 'Precio socio', value: `$ ${s.precioSocio}` },
      {
        key: 'tipoCobro',
        label: 'Tipo de Cobro',
        value: MODALIDAD_PRECIO_DETALLE_LABEL[s.modalidadPrecio] ?? s.modalidadPrecio,
      },
    ];
  });

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const s = this.servicio();
    if (!s) return null;
    return {
      entityId: `SRV-${String(s.id).padStart(3, '0')}`,
      entityIdLabel: 'ID del Servicio',
      fechaRegistro: s.createdAt,
      registradoPor: s.createdBy,
    };
  });

  protected onEditar(): void {
    this.router.navigate(['/servicios', this.servicioId(), 'editar']);
  }
}
