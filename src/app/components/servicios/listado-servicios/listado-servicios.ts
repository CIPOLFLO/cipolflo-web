import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map } from 'rxjs/operators';
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
  selector: 'app-listado-servicios',
  imports: [PageLayout, AppButton, FilterPanel, AppTable],
  providers: [
    TableStateService,
    ServiciosColumnsService,
    { provide: FilterConfigProvider, useClass: ServiciosFilterService },
  ],
  templateUrl: './listado-servicios.html',
  styleUrl: './listado-servicios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoServicios {
  private readonly servicioService = inject(ServicioService);
  private readonly columnsService = inject(ServiciosColumnsService);
  protected readonly tableState = inject(TableStateService);

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
    { label: 'Ver detalle', icon: 'pi pi-eye', command: () => console.log('ver detalle', row.id) },
    // { label: 'Modificar',    icon: 'pi pi-pencil',       command: () => console.log('modificar', row.id) },
    // ...(row.estado === EstadoServicio.Deshabilitado
    //   ? [{ label: 'Habilitar',    icon: 'pi pi-check-circle', command: () => console.log('habilitar', row.id) }]
    //   : [{ label: 'Deshabilitar', icon: 'pi pi-ban',          command: () => console.log('deshabilitar', row.id) }]),
    // { label: 'Eliminar',     icon: 'pi pi-trash',        command: () => console.log('eliminar', row.id) },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }
}
