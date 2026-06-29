import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppButton, FormActions, FormLayout, FormSection, PageLayout } from '../../../shared';
import { FinanzaFormBase } from '../finanza-from-base';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzaService } from '../services/finanza.service';
import { FinanzaCrearDto } from '../models/finanza.model';

@Component({
  standalone: true,
  selector: 'app-nuevo-movimiento',
  imports: [ReactiveFormsModule, PageLayout, FormLayout, FormSection, FormActions, AppButton],
  templateUrl: './nuevo-movimiento.html',
  styleUrl: './nuevo-movimiento.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevoMovimiento extends FinanzaFormBase {
  private readonly router = inject(Router);
  private readonly finanzaService = inject(FinanzaService);
  private readonly errorHandler = inject(ErrorHandlerService);

  constructor() {
    super();
    this.inicializarValidaciones();
    const facturaAnalizada = history.state?.facturaAnalizada;
    if (facturaAnalizada) {
      this.form.patchValue(facturaAnalizada);
    }
  }
  protected onCancelar(): void {
    this.router.navigate(['/finanzas']);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const { tipoMovimiento, procedencia, concepto, fecha, importe, formaPago, notas } =
      this.form.getRawValue();

    const dto: FinanzaCrearDto = {
      tipoMovimiento: tipoMovimiento!,
      procedencia: procedencia!,
      concepto: concepto!,
      fecha: fecha!,
      importe: importe!,
      formaPago: formaPago!,
      notas,
    };

    this.loading.set(true);
    this.finanzaService.create(dto).subscribe({
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
