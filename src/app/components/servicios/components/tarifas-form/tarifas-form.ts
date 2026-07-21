import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { type FormFieldOption } from '../../../../shared';
import { TipoClienteTarifa } from '../../models/servicio.model';

export type TarifaFormGroup = FormGroup<{
  tipoCliente: FormControl<TipoClienteTarifa | null>;
  precio: FormControl<number | null>;
  modalidadPrecio: FormControl<string | null>;
  antiguedadMinima: FormControl<number | null>;
  antiguedadMaxima: FormControl<number | null>;
}>;

@Component({
  selector: 'app-tarifas-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tarifas-form.html',
  styleUrl: './tarifas-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarifasForm {
  readonly tarifas = input.required<FormArray<TarifaFormGroup>>();
  readonly tiposCliente = input.required<FormFieldOption[]>();
  readonly modalidades = input.required<FormFieldOption[]>();
  readonly submitted = input(false);

  readonly agregar = output<void>();
  readonly eliminar = output<number>();

  protected onAgregar(): void {
    this.agregar.emit();
  }

  protected onEliminar(index: number): void {
    this.eliminar.emit(index);
  }
}
