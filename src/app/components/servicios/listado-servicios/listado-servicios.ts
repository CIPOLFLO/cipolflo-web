import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import {
  AppButton,
  AppTable,
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
import { MODALIDAD_PRECIO_LABEL, ServicioRow } from '../models/servicio.model';

@Component({
  standalone: true,
  selector: 'app-listado-servicios',
  imports: [CommonModule, PageLayout, AppButton, FilterPanel, AppTable],
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
  protected readonly tableState = inject(TableStateService);

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
    // { label: 'Modificar',    icon: 'pi pi-pencil',       command: () => ... },
    // ...(row.estado === EstadoServicio.Deshabilitado
    //   ? [{ label: 'Habilitar',    icon: 'pi pi-check-circle', command: () => ... }]
    //   : [{ label: 'Deshabilitar', icon: 'pi pi-ban',          command: () => ... }]),
    // { label: 'Eliminar',     icon: 'pi pi-trash',        command: () => ... },
  ];

  protected onNuevoServicio(): void {
    this.router.navigate(['/servicios/nuevo']);
  }

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }
}
