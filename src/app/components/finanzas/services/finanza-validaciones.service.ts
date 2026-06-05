import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FinanzaValidacionesService {
  fechaNoFutura(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return { fechaInvalida: true };
    const fecha = new Date(year, month - 1, day);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);
    return fecha <= hoy ? null : { fechaFutura: true };
  }

  getMovimientoErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errs: Record<string, string> = {};
    const tipoMovimiento = form.get('tipoMovimiento')!;
    if (this.show(tipoMovimiento, submitted) && tipoMovimiento.hasError('required')) {
      errs['tipoMovimiento'] = 'El tipo de movimiento es obligatorio.';
    }
    return errs;
  }

  getInfoErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errs: Record<string, string> = {};
    const procedencia = form.get('procedencia')!;
    const concepto = form.get('concepto')!;
    const fecha = form.get('fecha')!;
    const importe = form.get('importe')!;
    const formaPago = form.get('formaPago')!;

    if (this.show(procedencia, submitted) && procedencia.hasError('required')) {
      errs['procedencia'] = 'La procedencia es obligatoria.';
    }
    if (this.show(concepto, submitted) && concepto.hasError('required')) {
      errs['concepto'] = 'El concepto es obligatorio.';
    }
    if (this.show(fecha, submitted) && fecha.hasError('required')) {
      errs['fecha'] = 'La fecha es obligatoria.';
    } else if (this.show(fecha, submitted) && fecha.hasError('fechaInvalida')) {
      errs['fecha'] = 'La fecha ingresada no es válida.';
    } else if (this.show(fecha, submitted) && fecha.hasError('fechaFutura')) {
      errs['fecha'] = 'La fecha no puede ser posterior a hoy.';
    }
    if (this.show(importe, submitted) && importe.hasError('required')) {
      errs['importe'] = 'El importe es obligatorio.';
    } else if (this.show(importe, submitted) && importe.hasError('min')) {
      errs['importe'] = 'El importe debe ser mayor que 0.';
    }
    if (this.show(formaPago, submitted) && formaPago.hasError('required')) {
      errs['formaPago'] = 'La forma de pago es obligatoria.';
    }
    return errs;
  }

  private show(control: AbstractControl, submitted: boolean): boolean {
    return submitted || !!control.touched;
  }
}
