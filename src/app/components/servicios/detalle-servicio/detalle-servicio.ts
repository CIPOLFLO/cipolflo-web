import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
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
import { type ServicioDetalleRespuestaDto, type TarifaServicioRow } from '../models/servicio.model';
import { ServicioService } from '../services/servicio.service';
import { ServicioPresentacionService } from '../services/servicio-presentacion.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

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
export class DetalleServicio implements OnInit {
  private readonly router = inject(Router);
  private readonly servicioService = inject(ServicioService);
  private readonly presentacion = inject(ServicioPresentacionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly id = input<string>('');

  protected readonly servicio = signal<ServicioDetalleRespuestaDto | null>(null);

  // Los signal inputs ya tienen el valor de la ruta cuando ngOnInit corre, y el
  // componente se recrea en cada navegación, así que el id siempre es válido aquí.
  ngOnInit(): void {
    this.servicioService
      .getById(Number(this.id()))
      .pipe(
        catchError((err) => {
          this.errorHandler.handle(err);
          this.router.navigate(['/servicios']);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((s) => this.servicio.set(s));
  }

  protected readonly infoFields = computed<DetailFieldConfig[]>(() => {
    const s = this.servicio();
    if (!s) return [];
    return this.presentacion.getInfoFieldsDetalle(s);
  });

  protected readonly preciosFields = computed<DetailFieldConfig[]>(() => {
    const s = this.servicio();
    if (!s) return [];
    return this.presentacion.getPreciosFieldsDetalle(s);
  });

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const s = this.servicio();
    if (!s) return null;
    return this.presentacion.getRegistroData(s);
  });

  protected readonly tarifasRows = computed<TarifaServicioRow[]>(() => {
    const s = this.servicio();
    if (!s) return [];
    return this.presentacion.getTarifasFieldsDetalle(s.tarifas);
  });

  protected onEditar(): void {
    this.router.navigate(['/servicios', this.id(), 'editar']);
  }
}
