import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { AppButton, FormSection } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AntiguedadReservasService } from '../services/antiguedad-reservas.service';
import { createAjusteValorCardState } from '../ajuste-valor-card.helper';

function aniosValido(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? null : { aniosInvalido: true };
}

@Component({
  standalone: true,
  selector: 'app-antiguedad-reservas-card',
  imports: [ReactiveFormsModule, FormSection, AppButton],
  templateUrl: './antiguedad-reservas-card.html',
  styleUrl: './antiguedad-reservas-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AntiguedadReservasCard implements OnInit {
  private readonly service = inject(AntiguedadReservasService);
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly state = createAjusteValorCardState({
    label: 'Antigüedad de reservas (años)',
    type: 'number',
    validator: aniosValido,
    invalidErrorKey: 'aniosInvalido',
    requiredMessage: 'La antigüedad es obligatoria.',
    invalidMessage: 'La antigüedad debe ser un número entero mayor a 0.',
    extractValor: (dto) => dto.anios,
    buildRequest: (valor) => ({ anios: valor }),
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
