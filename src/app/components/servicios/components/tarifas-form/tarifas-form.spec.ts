import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { describe, it, expect, beforeEach } from 'vitest';
import { crearTarifaFormGroup, TarifasForm, type TarifaFormGroup } from './tarifas-form';
import { TIPO_CLIENTE_TARIFA_OPTIONS, TipoClienteTarifa } from '../../models/servicio.model';

describe('crearTarifaFormGroup', () => {
  it('crea un grupo con id null y todos los campos vacíos por defecto', () => {
    const grupo = crearTarifaFormGroup();
    expect(grupo.controls.id.value).toBeNull();
    expect(grupo.controls.tipoCliente.value).toBeNull();
    expect(grupo.controls.precio.value).toBeNull();
    expect(grupo.controls.modalidadPrecio.value).toBeNull();
    expect(grupo.controls.antiguedadMinima.value).toBeNull();
    expect(grupo.controls.antiguedadMaxima.value).toBeNull();
  });

  it('precarga el id recibido, para distinguir una fila persistida', () => {
    const grupo = crearTarifaFormGroup(42);
    expect(grupo.controls.id.value).toBe(42);
  });

  it('fija es false por defecto', () => {
    const grupo = crearTarifaFormGroup();
    expect(grupo.controls.fija.value).toBe(false);
  });

  it('fija queda en true cuando se pasa explícitamente', () => {
    const grupo = crearTarifaFormGroup(null, true);
    expect(grupo.controls.fija.value).toBe(true);
  });

  it('es inválido sin tipoCliente, precio ni modalidadPrecio', () => {
    const grupo = crearTarifaFormGroup();
    expect(grupo.invalid).toBe(true);
  });

  it('es válido con tipoCliente, precio y modalidadPrecio completos', () => {
    const grupo = crearTarifaFormGroup();
    grupo.patchValue({
      tipoCliente: TipoClienteTarifa.SocioComun,
      precio: 100,
      modalidadPrecio: 'POR_DIA',
    });
    expect(grupo.valid).toBe(true);
  });

  it('es inválido cuando el precio es 0', () => {
    const grupo = crearTarifaFormGroup();
    grupo.patchValue({
      tipoCliente: TipoClienteTarifa.SocioComun,
      precio: 0,
      modalidadPrecio: 'POR_DIA',
    });
    expect(grupo.controls.precio.hasError('min')).toBe(true);
  });

  it('es inválido cuando la antigüedad mínima es mayor que la máxima', () => {
    const grupo = crearTarifaFormGroup();
    grupo.patchValue({
      tipoCliente: TipoClienteTarifa.SocioComun,
      precio: 100,
      modalidadPrecio: 'POR_DIA',
      antiguedadMinima: 10,
      antiguedadMaxima: 5,
    });
    expect(grupo.hasError('rangoAntiguedadInvalido')).toBe(true);
  });

  it('al elegir Particular limpia la antigüedad previamente cargada, sin quedar en error', () => {
    const grupo = crearTarifaFormGroup();
    grupo.patchValue({
      tipoCliente: TipoClienteTarifa.SocioComun,
      precio: 100,
      modalidadPrecio: 'POR_DIA',
      antiguedadMinima: 0,
    });
    grupo.controls.tipoCliente.setValue(TipoClienteTarifa.Particular);
    expect(grupo.hasError('antiguedadNoAplicaAParticular')).toBe(false);
  });

  it('deshabilita y limpia antigüedadMinima/Maxima al elegir Particular', () => {
    const grupo = crearTarifaFormGroup();
    grupo.patchValue({ antiguedadMinima: 3, antiguedadMaxima: 8 });
    grupo.controls.tipoCliente.setValue(TipoClienteTarifa.Particular);

    expect(grupo.controls.antiguedadMinima.value).toBeNull();
    expect(grupo.controls.antiguedadMaxima.value).toBeNull();
    expect(grupo.controls.antiguedadMinima.disabled).toBe(true);
    expect(grupo.controls.antiguedadMaxima.disabled).toBe(true);
  });

  it('rehabilita antigüedadMinima/Maxima al cambiar de Particular a otro tipo', () => {
    const grupo = crearTarifaFormGroup();
    grupo.controls.tipoCliente.setValue(TipoClienteTarifa.Particular);
    grupo.controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);

    expect(grupo.controls.antiguedadMinima.disabled).toBe(false);
    expect(grupo.controls.antiguedadMaxima.disabled).toBe(false);
  });
});

describe('TarifasForm', () => {
  let fixture: ComponentFixture<TarifasForm>;
  let component: TarifasForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TarifasForm] }).compileComponents();

    fixture = TestBed.createComponent(TarifasForm);
    component = fixture.componentInstance;

    const tarifas = new FormArray<TarifaFormGroup>([crearTarifaFormGroup()]);
    fixture.componentRef.setInput('tarifas', tarifas);
    fixture.componentRef.setInput('tiposCliente', TIPO_CLIENTE_TARIFA_OPTIONS);
    fixture.componentRef.setInput('modalidades', [{ label: 'Por día', value: 'POR_DIA' }]);
    fixture.detectChanges();
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('emite agregar al llamar onAgregar', () => {
    let emitido = false;
    component.agregar.subscribe(() => (emitido = true));
    component['onAgregar']();
    expect(emitido).toBe(true);
  });

  it('emite eliminar con el índice recibido al llamar onEliminar', () => {
    let indiceEmitido: number | undefined;
    component.eliminar.subscribe((i) => (indiceEmitido = i));
    component['onEliminar'](2);
    expect(indiceEmitido).toBe(2);
  });
});

describe('TarifasForm - esUltimaObligatoria', () => {
  let fixture: ComponentFixture<TarifasForm>;
  let component: TarifasForm;

  function setTarifas(tipos: (TipoClienteTarifa | null)[]): void {
    const controls = tipos.map((tipo) => {
      const grupo = crearTarifaFormGroup();
      grupo.controls.tipoCliente.setValue(tipo);
      return grupo;
    });
    fixture.componentRef.setInput('tarifas', new FormArray<TarifaFormGroup>(controls));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TarifasForm] }).compileComponents();

    fixture = TestBed.createComponent(TarifasForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tiposCliente', TIPO_CLIENTE_TARIFA_OPTIONS);
    fixture.componentRef.setInput('modalidades', [{ label: 'Por día', value: 'POR_DIA' }]);
  });

  it('es true para la única fila Particular', () => {
    setTarifas([TipoClienteTarifa.Particular, TipoClienteTarifa.SocioComun]);
    expect(component['esUltimaObligatoria'](0)).toBe(true);
  });

  it('es true para la única fila Socio Común', () => {
    setTarifas([TipoClienteTarifa.Particular, TipoClienteTarifa.SocioComun]);
    expect(component['esUltimaObligatoria'](1)).toBe(true);
  });

  it('es false para una fila Particular cuando hay más de una', () => {
    setTarifas([
      TipoClienteTarifa.Particular,
      TipoClienteTarifa.Particular,
      TipoClienteTarifa.SocioComun,
    ]);
    expect(component['esUltimaObligatoria'](0)).toBe(false);
    expect(component['esUltimaObligatoria'](1)).toBe(false);
  });

  it('es false para un tipo no obligatorio (Socio Policía)', () => {
    setTarifas([
      TipoClienteTarifa.Particular,
      TipoClienteTarifa.SocioComun,
      TipoClienteTarifa.SocioPolicia,
    ]);
    expect(component['esUltimaObligatoria'](2)).toBe(false);
  });
});

describe('TarifasForm - opcionesDisponibles', () => {
  let fixture: ComponentFixture<TarifasForm>;
  let component: TarifasForm;
  let tarifas: FormArray<TarifaFormGroup>;

  function valores(index: number): string[] {
    return component['opcionesDisponibles'](index).map((o) => o.value);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TarifasForm] }).compileComponents();

    fixture = TestBed.createComponent(TarifasForm);
    component = fixture.componentInstance;
    tarifas = new FormArray<TarifaFormGroup>([crearTarifaFormGroup(), crearTarifaFormGroup()]);
    fixture.componentRef.setInput('tarifas', tarifas);
    fixture.componentRef.setInput('tiposCliente', TIPO_CLIENTE_TARIFA_OPTIONS);
    fixture.componentRef.setInput('modalidades', [{ label: 'Por día', value: 'POR_DIA' }]);
    fixture.detectChanges();
  });

  it('excluye Particular en las demás filas apenas se usa una vez', () => {
    tarifas.at(0).controls.tipoCliente.setValue(TipoClienteTarifa.Particular);
    expect(valores(1)).not.toContain(TipoClienteTarifa.Particular);
  });

  it('mantiene el valor propio de la fila aunque esté "usado" por ella misma', () => {
    tarifas.at(0).controls.tipoCliente.setValue(TipoClienteTarifa.Particular);
    expect(valores(0)).toContain(TipoClienteTarifa.Particular);
  });

  it('excluye un tipo no-Particular en otra fila si la que lo usa no tiene antigüedad cargada', () => {
    tarifas.at(0).controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);
    expect(valores(1)).not.toContain(TipoClienteTarifa.SocioComun);
  });

  it('permite repetir un tipo no-Particular en otra fila si ya tiene antigüedad cargada', () => {
    tarifas.at(0).controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);
    tarifas.at(0).controls.antiguedadMinima.setValue(0);
    tarifas.at(0).controls.antiguedadMaxima.setValue(5);
    expect(valores(1)).toContain(TipoClienteTarifa.SocioComun);
  });
});

describe('TarifasForm - fila fija se mantiene bloqueada aunque se repita su tipo', () => {
  let fixture: ComponentFixture<TarifasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TarifasForm] }).compileComponents();

    fixture = TestBed.createComponent(TarifasForm);

    const socioComunFija = crearTarifaFormGroup(null, true);
    socioComunFija.controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);
    const socioComunNueva = crearTarifaFormGroup();
    socioComunNueva.controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);
    socioComunNueva.controls.antiguedadMinima.setValue(0);
    socioComunNueva.controls.antiguedadMaxima.setValue(5);

    const tarifas = new FormArray<TarifaFormGroup>([socioComunFija, socioComunNueva]);
    fixture.componentRef.setInput('tarifas', tarifas);
    fixture.componentRef.setInput('tiposCliente', TIPO_CLIENTE_TARIFA_OPTIONS);
    fixture.componentRef.setInput('modalidades', [{ label: 'Por día', value: 'POR_DIA' }]);
    fixture.detectChanges();
  });

  it('la fila fija sigue mostrando el valor fijo (no el select) aunque otra fila repita su tipo', () => {
    const filasFixed = fixture.nativeElement.querySelectorAll('.tarifas-table__fixed-value');
    expect(filasFixed.length).toBe(1);
    expect(filasFixed[0].textContent?.trim()).toBe('Socio Común');
  });

  it('la fila fija sigue con el botón eliminar deshabilitado', () => {
    const botones = fixture.nativeElement.querySelectorAll('.tarifas-table__delete-button');
    expect(botones[0].disabled).toBe(true);
  });
});

describe('TarifasForm - mensajes de error por campo', () => {
  let fixture: ComponentFixture<TarifasForm>;
  let tarifas: FormArray<TarifaFormGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TarifasForm] }).compileComponents();

    fixture = TestBed.createComponent(TarifasForm);
    tarifas = new FormArray<TarifaFormGroup>([crearTarifaFormGroup()]);
    fixture.componentRef.setInput('tarifas', tarifas);
    fixture.componentRef.setInput('tiposCliente', TIPO_CLIENTE_TARIFA_OPTIONS);
    fixture.componentRef.setInput('modalidades', [{ label: 'Por día', value: 'POR_DIA' }]);
    fixture.componentRef.setInput('submitted', true);
    fixture.detectChanges();
  });

  it('muestra el error de tipoCliente obligatorio tras submit', () => {
    const error = fixture.nativeElement.querySelector('.tarifa-field__error');
    expect(error?.textContent).toContain('El tipo de cliente es obligatorio.');
  });

  it('muestra el error de precio mayor a 0 cuando el precio es 0', () => {
    tarifas.at(0).controls.precio.setValue(0);
    fixture.detectChanges();

    const errores = Array.from(
      fixture.nativeElement.querySelectorAll('.tarifa-field__error'),
    ) as HTMLElement[];
    expect(errores.some((e) => e.textContent?.includes('El precio debe ser mayor que 0.'))).toBe(
      true,
    );
  });

  it('muestra el error de antigüedad mínima negativa', () => {
    tarifas.at(0).controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);
    tarifas.at(0).controls.antiguedadMinima.setValue(-1);
    fixture.detectChanges();

    const errores = Array.from(
      fixture.nativeElement.querySelectorAll('.tarifa-field__error'),
    ) as HTMLElement[];
    expect(
      errores.some((e) => e.textContent?.includes('La antigüedad mínima no puede ser negativa.')),
    ).toBe(true);
  });

  it('muestra el error de antigüedad máxima negativa', () => {
    tarifas.at(0).controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);
    tarifas.at(0).controls.antiguedadMaxima.setValue(-1);
    fixture.detectChanges();

    const errores = Array.from(
      fixture.nativeElement.querySelectorAll('.tarifa-field__error'),
    ) as HTMLElement[];
    expect(
      errores.some((e) => e.textContent?.includes('La antigüedad máxima no puede ser negativa.')),
    ).toBe(true);
  });

  it('muestra el error de rango de antigüedad inválido', () => {
    tarifas.at(0).controls.tipoCliente.setValue(TipoClienteTarifa.SocioComun);
    tarifas.at(0).controls.antiguedadMinima.setValue(10);
    tarifas.at(0).controls.antiguedadMaxima.setValue(5);
    fixture.detectChanges();

    const filaError = fixture.nativeElement.querySelector('.tarifas-table__error-row');
    expect(filaError?.textContent).toContain(
      'La antigüedad mínima no puede ser mayor que la máxima.',
    );
  });

  it('muestra el error de antigüedad no aplicable a Particular', () => {
    tarifas.at(0).controls.tipoCliente.setValue(TipoClienteTarifa.Particular);
    // El tipoCliente=Particular limpia y deshabilita antigüedad; forzamos el caso igual para
    // cubrir el mensaje de error de la fila, que sigue leyendo el valor del control aunque
    // esté deshabilitado.
    tarifas.at(0).controls.antiguedadMinima.setValue(5);
    fixture.detectChanges();

    const filasError = fixture.nativeElement.querySelectorAll('.tarifas-table__error-row');
    const textos = Array.from(filasError as NodeListOf<HTMLElement>).map((f) => f.textContent);
    expect(textos.some((t) => t?.includes('Un cliente Particular no admite antigüedad'))).toBe(
      true,
    );
  });

  it('muestra el error de obligatoriedad de conjunto tras submit', () => {
    const arrayConValidador = new FormArray<TarifaFormGroup>([crearTarifaFormGroup()], () => ({
      tarifasObligatoriasFaltantes: true,
    }));
    fixture.componentRef.setInput('tarifas', arrayConValidador);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Debe haber al menos una tarifa Particular y una Socio Común.',
    );
  });
});

describe('TarifasForm - eliminar una fila desde un click real en el DOM', () => {
  it('emite eliminar al hacer click en el botón de la fila habilitada', async () => {
    await TestBed.configureTestingModule({ imports: [TarifasForm] }).compileComponents();

    const fixture = TestBed.createComponent(TarifasForm);
    const tarifas = new FormArray<TarifaFormGroup>([
      crearTarifaFormGroup(),
      crearTarifaFormGroup(),
    ]);
    fixture.componentRef.setInput('tarifas', tarifas);
    fixture.componentRef.setInput('tiposCliente', TIPO_CLIENTE_TARIFA_OPTIONS);
    fixture.componentRef.setInput('modalidades', [{ label: 'Por día', value: 'POR_DIA' }]);
    fixture.detectChanges();

    let indiceEmitido: number | undefined;
    fixture.componentInstance.eliminar.subscribe((i) => (indiceEmitido = i));

    const boton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.tarifas-table__delete-button',
    );
    boton.click();

    expect(indiceEmitido).toBe(0);
  });
});

@Component({
  template: `
    <app-tarifas-form
      [tarifas]="tarifas"
      [tiposCliente]="tiposCliente"
      [modalidades]="modalidades"
    />
  `,
  imports: [TarifasForm],
})
class TestHostTarifasForm {
  tarifas = new FormArray<TarifaFormGroup>([crearTarifaFormGroup()]);
  tiposCliente = TIPO_CLIENTE_TARIFA_OPTIONS;
  modalidades = [{ label: 'Por día', value: 'POR_DIA' }];
}

describe('TarifasForm - re-render ante mutación externa del FormArray', () => {
  it('refleja filas que el padre agrega fuera de un evento propio del componente (ej. precarga)', () => {
    TestBed.configureTestingModule({ imports: [TestHostTarifasForm] });
    const hostFixture = TestBed.createComponent(TestHostTarifasForm);
    hostFixture.detectChanges();

    // Simula la precarga en editar-servicio: el padre empuja filas al mismo FormArray (misma
    // referencia) fuera de cualquier evento originado en TarifasForm.
    hostFixture.componentInstance.tarifas.push(crearTarifaFormGroup());
    hostFixture.componentInstance.tarifas.push(crearTarifaFormGroup());
    hostFixture.detectChanges();

    const filas = hostFixture.nativeElement.querySelectorAll(
      '.tarifas-table tbody tr:not(.tarifas-table__error-row)',
    );
    expect(filas.length).toBe(3);
  });
});
