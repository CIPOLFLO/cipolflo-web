import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, filter, map, switchMap } from 'rxjs';
import { AppButton, FormActions, FormLayout, FormSection, PageLayout } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzaService } from '../services/finanza.service';
import { Concepto, FinanzaModificarDto, FormaPago } from '../models/finanza.model';
import { FinanzaFormBase } from '../finanza-from-base';

@Component({
  standalone: true,
  selector: 'app-modificar-finanza',
  imports: [ReactiveFormsModule, PageLayout, FormLayout, FormSection, FormActions, AppButton],
  templateUrl: './modificar-finanza.html',
  styleUrl: './modificar-finanza.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificarFinanza extends FinanzaFormBase {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly finanzaService = inject(FinanzaService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected override readonly confirmDisabled = computed(() => {
    this.formEvents();
    return this.form.invalid || !this.form.dirty || this.loading();
  });

  protected readonly finanzaId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  protected override readonly tipoMovimientoDisabled: boolean = true;

  constructor() {
    super();
    this.inicializarValidaciones();
    this.form.get('tipoMovimiento')?.disable({ emitEvent: false });
    this.cargarFinanza();
  }

  private cargarFinanza(): void {
    this.route.paramMap
      .pipe(
        map((p) => p.get('id') ?? ''),
        filter((id) => /^\d+$/.test(id)),
        switchMap((id) =>
          this.finanzaService.getById(Number(id)).pipe(
            catchError((err) => {
              this.errorHandler.handle(err);
              this.router.navigate(['/finanzas']);
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe((finanza) => {
        this.form.patchValue({
          tipoMovimiento: finanza.tipoMovimiento,
          procedencia: finanza.procedencia,
          concepto: Concepto.PagoReserva,
          fecha: finanza.fecha,
          importe: finanza.importe,
          formaPago: finanza.formaPago as FormaPago,
          notas: finanza.notas ?? null,
        });

        this.form.markAsPristine();
        this.dataVersion.update((n) => n + 1);
      });
  }

  protected onCancelar(): void {
    this.router.navigate(['/finanzas']);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const { procedencia, concepto, fecha, importe, formaPago, notas } = this.form.getRawValue();

    const dto: FinanzaModificarDto = {
      procedencia: procedencia!,
      concepto: concepto!,
      fecha: fecha!,
      importe: importe!,
      formaPago: formaPago!,
      notas,
    };

    this.loading.set(true);
    this.finanzaService.update(Number(this.finanzaId()), dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/finanzas']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handle(err);
      },
    });
  }
}
