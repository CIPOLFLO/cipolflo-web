import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, filter, map, switchMap } from 'rxjs';
import {
  AppButton,
  DetailRegistroSection,
  DetailSection,
  FormActions,
  FormLayout,
  PageLayout,
  type DetailFieldConfig,
  type DetailRegistroData,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ClientesService } from '../services/cliente.service';
import { METODO_COBRO_LABEL, TipoCliente, CATEGORIA_SOCIO_LABEL } from '../models/cliente.model';

@Component({
  standalone: true,
  selector: 'app-detalle-cliente',
  imports: [
    CommonModule,
    PageLayout,
    FormLayout,
    AppButton,
    FormActions,
    DetailSection,
    DetailRegistroSection,
  ],
  templateUrl: './detalle-cliente.html',
  styleUrl: './detalle-cliente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleCliente {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clientesService = inject(ClientesService);
  protected readonly metodoCobroLabel = METODO_COBRO_LABEL;
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly clienteId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  protected readonly esSocio = computed(() => this.cliente()?.tipoCliente === TipoCliente.Socio);

  protected readonly cliente = toSignal(
    toObservable(this.clienteId).pipe(
      filter((id) => /^\d+$/.test(id)),
      switchMap((id) =>
        this.clientesService.getById(Number(id)).pipe(
          catchError((err) => {
            this.errorHandler.handle(err);
            this.router.navigate(['/clientes']);
            return EMPTY;
          }),
        ),
      ),
    ),
    { initialValue: undefined },
  );

  protected onEditar(): void {
    this.router.navigate(['/clientes', this.clienteId(), 'modificar'], {
      queryParams: { from: 'detalle' },
    });
  }
  protected readonly infoFields = computed<DetailFieldConfig[]>(() => {
    const c = this.cliente();
    if (!c) return [];

    return [
      { key: 'nombre', label: 'Nombre', value: c.nombre },
      { key: 'cedula', label: 'Cédula', value: c.cedula },
      { key: 'fechaNacimiento', label: 'Fecha de nacimiento', value: c.fechaNacimiento },
      { key: 'telefono', label: 'Teléfono', value: c.telefono },
      { key: 'email', label: 'Email', value: c.email },
      {
        key: 'metodoCobro',
        label: 'Método de cobro',
        value: c.metodoCobro ? METODO_COBRO_LABEL[c.metodoCobro] : null,
      },
      { key: 'pais', label: 'País', value: c.pais },
      { key: 'departamento', label: 'Departamento', value: c.departamento },
      { key: 'ciudad', label: 'Ciudad', value: c.ciudad },
      { key: 'direccion', label: 'Dirección', value: c.direccion },
      { key: 'numeroSocio', label: 'Nro de socio', value: c.numeroSocio?.toString() ?? null },
      { key: 'tipoCliente', label: 'Tipo de cliente', value: c.tipoCliente },
      { key: 'estado', label: 'Estado', value: c.estado },
      {
        key: 'categoriaSocio',
        label: 'Categoría',
        value: c.categoriaSocio ? CATEGORIA_SOCIO_LABEL[c.categoriaSocio] : null,
      },
      {
        key: 'fechaIngreso',
        label: 'Fecha de ingreso',
        value: c.fechaIngreso,
      },
      {
        key: 'antiguedad',
        label: 'Antigüedad',
        value: c.antiguedad?.toString() ?? null,
      },
      {
        key: 'observaciones',
        label: 'Notas/Observaciones',
        value: c.observaciones,
        fullWidth: true,
        multiline: true,
      },
    ];
  });
  protected readonly ultimaCuotaPagaFields = computed<DetailFieldConfig[]>(() => {
    const ultimaCuota = this.cliente()?.ultimaCuotaDto;

    return [
      {
        key: 'ultimaCuotaDto',
        label: 'Última cuota paga',
        value: ultimaCuota?.descripcion ?? null,
      },
    ];
  });

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const c = this.cliente();
    if (!c) return null;

    return {
      entityId: `CLI-${String(c.id).padStart(3, '0')}`,
      entityIdLabel: 'ID del Cliente',
      fechaRegistro: c.createdAt,
      registradoPor: c.createdBy,
    };
  });
}
