import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { AppButton, FormSection } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CostoCuotaService } from '../services/costo-cuota.service';
import { createAjusteValorCardState } from '../ajuste-valor-card.helper';

function montoValido(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  if (value === null || value === '') return null;
  const n = Number(value);
  return !Number.isNaN(n) && n > 0 ? null : { montoInvalido: true };
}

@Component({
  standalone: true,
  selector: 'app-costo-cuota-card',
  imports: [ReactiveFormsModule, FormSection, AppButton],
  templateUrl: './costo-cuota-card.html',
  styleUrl: './costo-cuota-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostoCuotaCard implements OnInit {
  private readonly service = inject(CostoCuotaService);
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly state = createAjusteValorCardState({
    label: 'Costo de cuota social',
    type: 'currency',
    validator: montoValido,
    invalidErrorKey: 'montoInvalido',
    requiredMessage: 'El costo de cuota es obligatorio.',
    invalidMessage: 'El costo debe ser mayor a 0.',
    extractValor: (dto) => dto.monto,
    buildRequest: (valor) => ({ monto: valor }),
    obtener: () => this.service.obtener(),
    actualizar: (dto) => this.service.actualizar(dto),
    errorHandler: this.errorHandler,
  });

  protected readonly form = this.state.form;
  protected readonly fields = this.state.fields;
  protected readonly errors = this.state.errors;
  protected readonly guardando = this.state.guardando;
  protected readonly guardadoOk = this.state.guardadoOk;
  protected readonly guardarDisabled = this.state.guardarDisabled;

  ngOnInit(): void {
    this.state.cargarValor();
  }

  protected onValuesChange(values: Record<string, string | null>): void {
    this.state.onValuesChange(values);
  }

  protected onBlur(key: string): void {
    this.state.onBlur(key);
  }

  protected onGuardar(): void {
    this.state.onGuardar();
  }
}
