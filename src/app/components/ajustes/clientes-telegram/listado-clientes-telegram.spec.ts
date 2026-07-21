import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListadoClientesTelegram } from './listado-clientes-telegram';
import { ClienteTelegramService } from '../services/cliente-telegram.service';
import { ConfirmDialogService, PageResponse } from '../../../shared';
import { ClienteTelegramResponseDto } from '../models/ajuste.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

const clienteMock: ClienteTelegramResponseDto = {
  id: 1,
  chatId: 583920175,
  alias: 'Juan Pérez',
  activo: true,
  recibeNotificaciones: true,
  createdAt: '2026-03-02T10:00:00Z',
  updatedAt: '2026-03-02T10:00:00Z',
};

const mockPage: PageResponse<ClienteTelegramResponseDto> = {
  content: [clienteMock],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe('ListadoClientesTelegram', () => {
  let fixture: ComponentFixture<ListadoClientesTelegram>;
  let component: ListadoClientesTelegram;
  let mockService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    actualizarHabilitacion: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
  };
  let mockConfirmDialogService: { open: ReturnType<typeof vi.fn> };
  let mockErrorHandler: { handle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      getAll: vi.fn().mockReturnValue(of(mockPage)),
      create: vi.fn().mockReturnValue(of(clienteMock)),
      update: vi.fn().mockReturnValue(of(clienteMock)),
      actualizarHabilitacion: vi.fn().mockReturnValue(of(clienteMock)),
      eliminar: vi.fn().mockReturnValue(of(undefined)),
    };
    mockConfirmDialogService = { open: vi.fn().mockReturnValue(of(true)) };
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ListadoClientesTelegram],
      providers: [
        { provide: ClienteTelegramService, useValue: mockService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoClientesTelegram);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('carga los datos con ClienteTelegramService.getAll', () => {
    expect(mockService.getAll).toHaveBeenCalled();
  });

  it('muestra la descripción de la sección', () => {
    expect(fixture.nativeElement.textContent).toContain(
      'Son los clientes habilitados para realizar consultas al bot de Telegram.',
    );
  });

  it('onNuevoCliente abre el diálogo en modo alta', () => {
    component['onNuevoCliente']();
    expect(component['dialogVisible']()).toBe(true);
    expect(component['clienteSeleccionado']()).toBeNull();
  });

  it('onEditar abre el diálogo con el cliente seleccionado', () => {
    component['onEditar'](clienteMock);
    expect(component['dialogVisible']()).toBe(true);
    expect(component['clienteSeleccionado']()).toEqual(clienteMock);
  });

  it('onCancelarDialog cierra el diálogo y limpia la selección', () => {
    component['onEditar'](clienteMock);
    component['onCancelarDialog']();
    expect(component['dialogVisible']()).toBe(false);
    expect(component['clienteSeleccionado']()).toBeNull();
  });

  describe('onGuardarDialog', () => {
    it('en modo alta llama a create', () => {
      component['onNuevoCliente']();
      component['onGuardarDialog']({
        chatId: 111,
        alias: 'Nuevo',
        recibeNotificaciones: true,
      });
      expect(mockService.create).toHaveBeenCalledWith({
        chatId: 111,
        alias: 'Nuevo',
        recibeNotificaciones: true,
      });
    });

    it('en modo edición llama a update con el id seleccionado, sin chatId', () => {
      component['onEditar'](clienteMock);
      component['onGuardarDialog']({
        chatId: clienteMock.chatId,
        alias: 'Editado',
        recibeNotificaciones: false,
      });
      expect(mockService.update).toHaveBeenCalledWith(1, {
        alias: 'Editado',
        recibeNotificaciones: false,
      });
    });

    it('cierra el diálogo tras guardar exitosamente', () => {
      component['onNuevoCliente']();
      component['onGuardarDialog']({ chatId: 111, alias: 'Nuevo', recibeNotificaciones: true });
      expect(component['dialogVisible']()).toBe(false);
    });

    it('delega el error en ErrorHandlerService si falla', () => {
      mockService.create.mockReturnValue(throwError(() => new Error('falló')));
      component['onNuevoCliente']();
      component['onGuardarDialog']({ chatId: 111, alias: 'Nuevo', recibeNotificaciones: true });
      expect(mockErrorHandler.handle).toHaveBeenCalled();
    });
  });

  describe('inlineActions', () => {
    it('retorna 3 acciones', () => {
      expect(component['inlineActions'](clienteMock)).toHaveLength(3);
    });

    it('la primera acción es editar y abre el diálogo con la fila', () => {
      const acciones = component['inlineActions'](clienteMock);
      const editar = acciones[0];
      if (editar.type === 'button') editar.command(clienteMock);
      expect(component['clienteSeleccionado']()).toEqual(clienteMock);
    });

    it('la acción toggle llama a actualizarHabilitacion con el nuevo valor', () => {
      const acciones = component['inlineActions'](clienteMock);
      expect(acciones[1].type).toBe('toggle');
      if (acciones[1].type === 'toggle') {
        acciones[1].onChange(clienteMock, false);
      }
      expect(mockService.actualizarHabilitacion).toHaveBeenCalledWith(1, { activo: false });
    });

    it('la tercera acción es eliminar con variant danger', () => {
      const acciones = component['inlineActions'](clienteMock);
      expect(acciones[2]).toMatchObject({ icon: 'pi pi-trash', variant: 'danger' });
    });

    it('eliminar pide confirmación antes de llamar al service', () => {
      const acciones = component['inlineActions'](clienteMock);
      const eliminar = acciones[2];
      if (eliminar.type === 'button') eliminar.command(clienteMock);
      expect(mockConfirmDialogService.open).toHaveBeenCalled();
      expect(mockService.eliminar).toHaveBeenCalledWith(1);
    });

    it('no elimina si se cancela la confirmación', () => {
      mockConfirmDialogService.open.mockReturnValue(of(false));
      const acciones = component['inlineActions'](clienteMock);
      const eliminar = acciones[2];
      if (eliminar.type === 'button') eliminar.command(clienteMock);
      expect(mockService.eliminar).not.toHaveBeenCalled();
    });
  });
});
