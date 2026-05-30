import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import {
  AppButton,
  AppTable,
  ConfirmDialogService,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  PageLayout,
  PROCEDENCIA_LABEL,
  RowAction,
  TableStateService,
} from '../../../shared';
import { ServiciosColumnsService } from '../services/servicios-columns.service';
import { ServiciosFilterService } from '../services/servicios-filter.service';
import { ServicioService } from '../services/servicio.service';
import {
  EstadoServicio,
  HabilitacionServicioDto,
  MODALIDAD_PRECIO_LABEL,
  ReservaProximaDto,
  ServicioRow,
} from '../models/servicio.model';
import { VerificandoReservasDialog } from '../habilitar-deshabilitar/verificando-reservas-dialog/verificando-reservas-dialog';
import { ReservasActivasDialog } from '../habilitar-deshabilitar/reservas-activas-dialog/reservas-activas-dialog';

@Component({
  standalone: true,
  selector: 'app-listado-servicios',
  imports: [
    CommonModule,
    PageLayout,
    AppButton,
    FilterPanel,
    AppTable,
    VerificandoReservasDialog,
    ReservasActivasDialog,
  ],
  providers: [
    TableStateService,
    ServiciosColumnsService,
    { provide: FilterConfigProvider, useClass: ServiciosFilterService },
  ],
  templateUrl: './listado-servicios.html',
  styleUrls: ['./listado-servicios.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoServicios {
  private readonly router = inject(Router);
  private readonly servicioService = inject(ServicioService);
  private readonly columnsService = inject(ServiciosColumnsService);
  private readonly filterConfigProvider = inject(FilterConfigProvider);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  protected readonly tableState = inject(TableStateService);

  protected readonly verificandoVisible = signal(false);
  protected readonly reservasActivasVisible = signal(false);
  protected readonly servicioSeleccionado = signal<ServicioRow | null>(null);
  protected readonly reservasProximas = signal<ReservaProximaDto[]>([]);

  constructor() {
    const defaults = Object.fromEntries(
      this.filterConfigProvider
        .filterFields()
        .filter((f) => f.defaultValue != null)
        .map((f) => [f.key, f.defaultValue!]),
    );
    if (Object.keys(defaults).length) {
      this.tableState.updateFilters(defaults);
    }
  }

  protected readonly columns = this.columnsService.columns;

  protected readonly loadDataFn: LoadDataFn<ServicioRow> = (params) =>
    this.servicioService.getAll(params).pipe(
      map((response) => ({
        ...response,
        content: response.content.map((dto) => ({
          ...dto,
          unidad: MODALIDAD_PRECIO_LABEL[dto.modalidadPrecio] ?? String(dto.modalidadPrecio),
          procedencia: PROCEDENCIA_LABEL[dto.procedencia] ?? dto.procedencia,
        })),
      })),
    );

  protected readonly rowActions = (row: ServicioRow): RowAction<ServicioRow>[] => [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => this.router.navigate(['/servicios', row.id]),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () =>
        this.router.navigate(['/servicios', row.id, 'editar'], {
          queryParams: { from: 'listado' },
        }),
    },
    ...(row.estado === EstadoServicio.Deshabilitado
      ? [{ label: 'Habilitar', icon: 'pi pi-check-circle', command: () => this.habilitar(row) }]
      : [
          {
            label: 'Deshabilitar',
            icon: 'pi pi-ban',
            command: () => this.iniciarDeshabilitacion(row),
          },
        ]),
    // { separator: true },
    // { label: 'Eliminar', icon: 'pi pi-trash', command: () => ... },
  ];

  protected onNuevoServicio(): void {
    this.router.navigate(['/servicios/nuevo']);
  }

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onCancelarDialog(): void {
    this.reservasActivasVisible.set(false);
    this.servicioSeleccionado.set(null);
    this.reservasProximas.set([]);
  }

  protected onDeshabilitarSinCancelar(): void {
    this.reservasActivasVisible.set(false);
    this.deshabilitar({ habilitado: false, reservasACancelar: [] });
  }

  protected onDeshabilitarYCancelar(ids: number[]): void {
    this.reservasActivasVisible.set(false);
    this.deshabilitar({ habilitado: false, reservasACancelar: ids });
  }

  private habilitar(row: ServicioRow): void {
    this.servicioService.actualizarHabilitacion(row.id, { habilitado: true }).subscribe({
      next: () => this.recargarTabla(),
      error: (e) => {
        // TODO: reemplazar con manejo de errores centralizado cuando se implemente en el front
        console.error('Error al habilitar servicio', e);
      },
    });
  }

  private iniciarDeshabilitacion(row: ServicioRow): void {
    this.servicioSeleccionado.set(row);
    this.verificandoVisible.set(true);

    this.servicioService.getReservasProximas(row.id).subscribe({
      next: (reservas) => {
        this.verificandoVisible.set(false);
        if (reservas.length === 0) {
          this.confirmDialogService
            .open({
              title: 'Deshabilitar Servicio',
              message: `El servicio "${row.nombre}" no tiene reservas activas. ¿Confirmás la deshabilitación?`,
              confirmButtonLabel: 'Deshabilitar',
              variant: 'warning',
            })
            .subscribe((confirmed) => {
              if (confirmed) {
                this.deshabilitar({ habilitado: false, reservasACancelar: [] });
              } else {
                this.servicioSeleccionado.set(null);
              }
            });
        } else {
          this.reservasProximas.set(reservas);
          this.reservasActivasVisible.set(true);
        }
      },
      error: () => {
        this.verificandoVisible.set(false);
        this.servicioSeleccionado.set(null);
      },
    });
  }

  private deshabilitar(dto: HabilitacionServicioDto): void {
    const id = this.servicioSeleccionado()?.id;
    if (!id) return;
    this.servicioService.actualizarHabilitacion(id, dto).subscribe({
      next: () => this.recargarTabla(),
      error: (e) => {
        // TODO: reemplazar con manejo de errores centralizado cuando se implemente en el front
        console.error('Error al deshabilitar servicio', e);
        this.servicioSeleccionado.set(null);
        this.reservasProximas.set([]);
      },
    });
  }

  private recargarTabla(): void {
    this.servicioSeleccionado.set(null);
    this.reservasProximas.set([]);
    // El spread crea una nueva referencia para que el signal detecte el cambio y recargue la tabla
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters });
  }
}
