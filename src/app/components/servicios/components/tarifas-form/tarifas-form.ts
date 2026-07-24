import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';

import { type FormFieldOption } from '../../../../shared';
import { TIPO_CLIENTE_TARIFA_LABEL, TipoClienteTarifa } from '../../models/servicio.model';
import { TarifaValidacionesService } from '../../services/tarifa-validaciones.service';

export type TarifaFormGroup = FormGroup<{
  id: FormControl<number | null>;
  tipoCliente: FormControl<TipoClienteTarifa | null>;
  precio: FormControl<number | null>;
  modalidadPrecio: FormControl<string | null>;
  antiguedadMinima: FormControl<number | null>;
  antiguedadMaxima: FormControl<number | null>;
  fija: FormControl<boolean>;
}>;

// Validadores por fila sin dependencias inyectadas: se puede instanciar fuera del injector de Angular.
const validaciones = new TarifaValidacionesService();

/**
 * id: null para una fila nueva; se completa con el id existente al precargar una tarifa persistida.
 * fija: true para las filas Particular/Socio Común precargadas por defecto en el alta — su tipo de
 * cliente no se puede cambiar ni la fila eliminarse, sin importar cuántas otras filas se agreguen
 * después (a diferencia de "es la última obligatoria", que es dinámico y cambia con el resto de filas).
 */
export function crearTarifaFormGroup(id: number | null = null, fija = false): TarifaFormGroup {
  const grupo = new FormGroup(
    {
      id: new FormControl<number | null>(id),
      tipoCliente: new FormControl<TipoClienteTarifa | null>(null, Validators.required),
      precio: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      modalidadPrecio: new FormControl<string | null>(null, Validators.required),
      antiguedadMinima: new FormControl<number | null>(null, Validators.min(0)),
      antiguedadMaxima: new FormControl<number | null>(null, Validators.min(0)),
      fija: new FormControl<boolean>(fija, { nonNullable: true }),
    },
    {
      validators: [
        (g) => validaciones.rangoAntiguedadInvalido(g),
        (g) => validaciones.antiguedadNoAplicaAParticular(g),
      ],
    },
  );

  // Particular no permite cargar antigüedad: se limpia y se deshabilita al elegir ese tipo de cliente.
  grupo.controls.tipoCliente.valueChanges.subscribe((tipo) => {
    const { antiguedadMinima, antiguedadMaxima } = grupo.controls;
    if (tipo === TipoClienteTarifa.Particular) {
      antiguedadMinima.reset(null);
      antiguedadMaxima.reset(null);
      antiguedadMinima.disable();
      antiguedadMaxima.disable();
    } else {
      antiguedadMinima.enable();
      antiguedadMaxima.enable();
    }
  });
  if (grupo.controls.tipoCliente.value === TipoClienteTarifa.Particular) {
    grupo.controls.antiguedadMinima.disable();
    grupo.controls.antiguedadMaxima.disable();
  }

  return grupo;
}

@Component({
  selector: 'app-tarifas-form',
  standalone: true,
  imports: [ReactiveFormsModule, Select, InputNumber],
  templateUrl: './tarifas-form.html',
  styleUrl: './tarifas-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarifasForm {
  readonly tarifas = input.required<FormArray<TarifaFormGroup>>();
  readonly tiposCliente = input.required<FormFieldOption[]>();
  readonly modalidades = input.required<FormFieldOption[]>();
  readonly submitted = input(false);

  constructor() {
    // El padre puede agregar/quitar filas fuera de un evento propio de este componente (ej. al
    // precargar tarifas existentes una vez que responde el backend). Al ser OnPush y no cambiar
    // la referencia del FormArray, esa mutación no dispara sola un re-render: nos suscribimos a
    // sus cambios para pedir el chequeo nosotros mismos.
    const cdr = inject(ChangeDetectorRef);
    effect((onCleanup) => {
      const sub = this.tarifas().events.subscribe(() => cdr.markForCheck());
      onCleanup(() => sub.unsubscribe());
    });
  }

  readonly agregar = output<void>();
  readonly eliminar = output<number>();

  protected onAgregar(): void {
    this.agregar.emit();
  }

  protected onEliminar(index: number): void {
    this.eliminar.emit(index);
  }

  // Particular y Socio Común son obligatorios: no se puede quitar la última fila de ese tipo.
  protected esUltimaObligatoria(index: number): boolean {
    const filas = this.tarifas().controls;
    const tipo = filas[index]?.controls.tipoCliente.value;
    if (tipo !== TipoClienteTarifa.Particular && tipo !== TipoClienteTarifa.SocioComun) {
      return false;
    }
    const cantidadDelTipo = filas.filter((f) => f.controls.tipoCliente.value === tipo).length;
    return cantidadDelTipo <= 1;
  }

  // Tipos de cliente que la fila `index` puede elegir: se excluye un tipo si ya está usado en
  // otra fila sin antigüedad cargada (duplicado sin forma de diferenciarlas), y Particular —que
  // nunca admite antigüedad— no puede repetirse en ningún caso.
  protected opcionesDisponibles(index: number): FormFieldOption[] {
    const actual = this.tarifas().controls[index]?.controls.tipoCliente.value;
    return this.tiposCliente().filter(
      (opt) => opt.value === actual || !this.tipoBloqueado(opt.value as TipoClienteTarifa, index),
    );
  }

  private tipoBloqueado(tipo: TipoClienteTarifa, indexActual: number): boolean {
    const filasDelTipo = this.tarifas().controls.filter(
      (f, i) => i !== indexActual && f.controls.tipoCliente.value === tipo,
    );
    if (filasDelTipo.length === 0) return false;
    if (tipo === TipoClienteTarifa.Particular) return true;
    return filasDelTipo.some(
      (f) => f.controls.antiguedadMinima.value == null && f.controls.antiguedadMaxima.value == null,
    );
  }

  protected tipoClienteLabel(tipo: TipoClienteTarifa | null): string {
    return tipo ? (TIPO_CLIENTE_TARIFA_LABEL[tipo] ?? tipo) : '';
  }
}
