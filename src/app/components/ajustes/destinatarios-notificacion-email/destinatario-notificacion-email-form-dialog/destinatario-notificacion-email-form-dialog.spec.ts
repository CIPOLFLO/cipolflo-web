import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DestinatarioNotificacionEmailFormDialog } from './destinatario-notificacion-email-form-dialog';
import { DestinatarioNotificacionEmailResponseDto } from '../../models/ajuste.model';

const destinatarioExistente: DestinatarioNotificacionEmailResponseDto = {
  id: 1,
  email: 'administracion@cipolflo.com',
  alias: 'Administración',
  activo: true,
  createdAt: '2026-03-02T10:00:00Z',
  updatedAt: '2026-03-02T10:00:00Z',
};

describe('DestinatarioNotificacionEmailFormDialog', () => {
  let fixture: ComponentFixture<DestinatarioNotificacionEmailFormDialog>;
  let component: DestinatarioNotificacionEmailFormDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinatarioNotificacionEmailFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(DestinatarioNotificacionEmailFormDialog);
    component = fixture.componentInstance;
  });

  describe('modo alta (destinatario null)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('destinatario', null);
      fixture.detectChanges();
    });

    it('el título es "Nuevo destinatario"', () => {
      expect(component['titulo']()).toBe('Nuevo destinatario');
    });

    it('el campo email está habilitado', () => {
      expect(component['form'].controls.email.disabled).toBe(false);
    });

    it('no emite guardado si el form es inválido', () => {
      let emitido = false;
      component.guardado.subscribe(() => (emitido = true));
      component['onConfirmar']();
      expect(emitido).toBe(false);
    });

    it('marca errores de email y alias cuando están vacíos y se confirma', () => {
      component['onConfirmar']();
      expect(component['emailError']()).toBe('El email es obligatorio.');
      expect(component['aliasError']()).toBe('El alias es obligatorio.');
    });

    it('marca error si el email no tiene formato válido', () => {
      component['form'].patchValue({ email: 'email-invalido', alias: 'Ana' });
      component['onConfirmar']();
      expect(component['emailError']()).toBe('El email no tiene un formato válido.');
    });

    it('emite guardado con los valores ingresados', () => {
      let emitido: unknown;
      component.guardado.subscribe((v) => (emitido = v));
      component['form'].patchValue({ email: '  ana@cipolflo.com  ', alias: '  Ana Díaz  ' });
      component['onConfirmar']();
      expect(emitido).toEqual({ email: 'ana@cipolflo.com', alias: 'Ana Díaz' });
    });

    it('emite cancelado al cancelar', () => {
      let emitido = false;
      component.cancelado.subscribe(() => (emitido = true));
      component['onCancelar']();
      expect(emitido).toBe(true);
    });
  });

  describe('modo edición (destinatario presente)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('destinatario', destinatarioExistente);
      fixture.detectChanges();
    });

    it('el título es "Editar destinatario"', () => {
      expect(component['titulo']()).toBe('Editar destinatario');
    });

    it('precarga los valores del destinatario', () => {
      expect(component['form'].getRawValue()).toEqual({
        email: destinatarioExistente.email,
        alias: destinatarioExistente.alias,
      });
    });

    it('el campo email queda deshabilitado (inmutable)', () => {
      expect(component['form'].controls.email.disabled).toBe(true);
    });

    it('emite guardado sin incluir el email en el payload lógico', () => {
      let emitido: unknown;
      component.guardado.subscribe((v) => (emitido = v));
      component['form'].patchValue({ alias: 'Administración actualizada' });
      component['onConfirmar']();
      expect(emitido).toEqual({
        email: destinatarioExistente.email,
        alias: 'Administración actualizada',
      });
    });
  });
});
