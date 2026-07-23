import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ClienteTelegramFormDialog } from './cliente-telegram-form-dialog';
import { ClienteTelegramResponseDto } from '../../models/ajuste.model';

const clienteExistente: ClienteTelegramResponseDto = {
  id: 1,
  chatId: 583920175,
  alias: 'Juan Pérez',
  activo: true,
  recibeNotificaciones: true,
  createdAt: '2026-03-02T10:00:00Z',
  updatedAt: '2026-03-02T10:00:00Z',
};

describe('ClienteTelegramFormDialog', () => {
  let fixture: ComponentFixture<ClienteTelegramFormDialog>;
  let component: ClienteTelegramFormDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteTelegramFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteTelegramFormDialog);
    component = fixture.componentInstance;
  });

  describe('modo alta (cliente null)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('cliente', null);
      fixture.detectChanges();
    });

    it('el título es "Nuevo cliente"', () => {
      expect(component['titulo']()).toBe('Nuevo cliente');
    });

    it('el campo chatId está habilitado', () => {
      expect(component['form'].controls.chatId.disabled).toBe(false);
    });

    it('recibeNotificaciones tiene valor por defecto true', () => {
      expect(component['form'].value.recibeNotificaciones).toBe(true);
    });

    it('no emite guardado si el form es inválido', () => {
      let emitido = false;
      component.guardado.subscribe(() => (emitido = true));
      component['onConfirmar']();
      expect(emitido).toBe(false);
    });

    it('marca errores de chatId y alias cuando están vacíos y se confirma', () => {
      component['onConfirmar']();
      expect(component['chatIdError']()).toBe('El Chat ID es obligatorio.');
      expect(component['aliasError']()).toBe('El alias es obligatorio.');
    });

    it('marca error si el chatId no es un entero positivo', () => {
      component['form'].patchValue({ chatId: '-5', alias: 'Ana' });
      component['onConfirmar']();
      expect(component['chatIdError']()).toBe('El Chat ID debe ser un número entero positivo.');
    });

    it('emite guardado con los valores ingresados', () => {
      let emitido: unknown;
      component.guardado.subscribe((v) => (emitido = v));
      component['form'].patchValue({ chatId: '123456', alias: '  Ana Díaz  ' });
      component['onConfirmar']();
      expect(emitido).toEqual({ chatId: 123456, alias: 'Ana Díaz', recibeNotificaciones: true });
    });

    it('emite cancelado al cancelar', () => {
      let emitido = false;
      component.cancelado.subscribe(() => (emitido = true));
      component['onCancelar']();
      expect(emitido).toBe(true);
    });
  });

  describe('modo edición (cliente presente)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('cliente', clienteExistente);
      fixture.detectChanges();
    });

    it('el título es "Editar cliente"', () => {
      expect(component['titulo']()).toBe('Editar cliente');
    });

    it('precarga los valores del cliente', () => {
      expect(component['form'].getRawValue()).toEqual({
        chatId: String(clienteExistente.chatId),
        alias: clienteExistente.alias,
        recibeNotificaciones: true,
      });
    });

    it('el campo chatId queda deshabilitado (inmutable)', () => {
      expect(component['form'].controls.chatId.disabled).toBe(true);
    });

    it('emite guardado sin incluir el chatId en el payload', () => {
      let emitido: unknown;
      component.guardado.subscribe((v) => (emitido = v));
      component['form'].patchValue({ alias: 'Juan P. actualizado' });
      component['onConfirmar']();
      expect(emitido).toEqual({
        chatId: clienteExistente.chatId,
        alias: 'Juan P. actualizado',
        recibeNotificaciones: true,
      });
    });
  });
});
