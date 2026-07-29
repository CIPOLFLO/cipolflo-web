import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListadoDestinatariosNotificacionEmail } from './listado-destinatarios-notificacion-email';
import { DestinatarioNotificacionEmailService } from '../services/destinatario-notificacion-email.service';
import { ConfirmDialogService, PageResponse } from '../../../shared';
import { DestinatarioNotificacionEmailResponseDto } from '../models/ajuste.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

const destinatarioMock: DestinatarioNotificacionEmailResponseDto = {
  id: 1,
  email: 'administracion@cipolflo.com',
  alias: 'Administración',
  activo: true,
  createdAt: '2026-03-02T10:00:00Z',
  updatedAt: '2026-03-02T10:00:00Z',
};

const mockPage: PageResponse<DestinatarioNotificacionEmailResponseDto> = {
  content: [destinatarioMock],
  page: 0,
  size: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe('ListadoDestinatariosNotificacionEmail', () => {
  let fixture: ComponentFixture<ListadoDestinatariosNotificacionEmail>;
  let component: ListadoDestinatariosNotificacionEmail;
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
      create: vi.fn().mockReturnValue(of(destinatarioMock)),
      update: vi.fn().mockReturnValue(of(destinatarioMock)),
      actualizarHabilitacion: vi.fn().mockReturnValue(of(destinatarioMock)),
      eliminar: vi.fn().mockReturnValue(of(undefined)),
    };
    mockConfirmDialogService = { open: vi.fn().mockReturnValue(of(true)) };
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ListadoDestinatariosNotificacionEmail],
      providers: [
        { provide: DestinatarioNotificacionEmailService, useValue: mockService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoDestinatariosNotificacionEmail);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('carga los datos con DestinatarioNotificacionEmailService.getAll', () => {
    expect(mockService.getAll).toHaveBeenCalled();
  });

  it('muestra la descripción de la sección', () => {
    expect(fixture.nativeElement.textContent).toContain(
      'Reciben notificaciones administrativas por email',
    );
  });

  it('crud.abrirAlta abre el diálogo en modo alta', () => {
    component['crud'].abrirAlta();
    expect(component['crud'].dialogVisible()).toBe(true);
    expect(component['crud'].seleccionado()).toBeNull();
  });

  it('crud.abrirEdicion abre el diálogo con el destinatario seleccionado', () => {
    component['crud'].abrirEdicion(destinatarioMock);
    expect(component['crud'].dialogVisible()).toBe(true);
    expect(component['crud'].seleccionado()).toEqual(destinatarioMock);
  });

  it('crud.cerrarDialog cierra el diálogo y limpia la selección', () => {
    component['crud'].abrirEdicion(destinatarioMock);
    component['crud'].cerrarDialog();
    expect(component['crud'].dialogVisible()).toBe(false);
    expect(component['crud'].seleccionado()).toBeNull();
  });

  describe('onGuardarDialog', () => {
    it('en modo alta llama a create', () => {
      component['crud'].abrirAlta();
      component['onGuardarDialog']({ email: 'nuevo@cipolflo.com', alias: 'Nuevo' });
      expect(mockService.create).toHaveBeenCalledWith({
        email: 'nuevo@cipolflo.com',
        alias: 'Nuevo',
      });
    });

    it('en modo edición llama a update con el id seleccionado, sin email', () => {
      component['crud'].abrirEdicion(destinatarioMock);
      component['onGuardarDialog']({ email: destinatarioMock.email, alias: 'Editado' });
      expect(mockService.update).toHaveBeenCalledWith(1, { alias: 'Editado' });
    });

    it('cierra el diálogo tras guardar exitosamente', () => {
      component['crud'].abrirAlta();
      component['onGuardarDialog']({ email: 'nuevo@cipolflo.com', alias: 'Nuevo' });
      expect(component['crud'].dialogVisible()).toBe(false);
    });

    it('delega el error en ErrorHandlerService si falla', () => {
      mockService.create.mockReturnValue(throwError(() => new Error('falló')));
      component['crud'].abrirAlta();
      component['onGuardarDialog']({ email: 'nuevo@cipolflo.com', alias: 'Nuevo' });
      expect(mockErrorHandler.handle).toHaveBeenCalled();
    });
  });

  describe('inlineActions', () => {
    it('retorna 3 acciones', () => {
      expect(component['inlineActions'](destinatarioMock)).toHaveLength(3);
    });

    it('la primera acción es editar y abre el diálogo con la fila', () => {
      const acciones = component['inlineActions'](destinatarioMock);
      const editar = acciones[0];
      if (editar.type === 'button') editar.command(destinatarioMock);
      expect(component['crud'].seleccionado()).toEqual(destinatarioMock);
    });

    it('la acción toggle llama a actualizarHabilitacion con el nuevo valor', () => {
      const acciones = component['inlineActions'](destinatarioMock);
      expect(acciones[1].type).toBe('toggle');
      if (acciones[1].type === 'toggle') {
        acciones[1].onChange(destinatarioMock, false);
      }
      expect(mockService.actualizarHabilitacion).toHaveBeenCalledWith(1, { activo: false });
    });

    it('la tercera acción es eliminar con variant danger', () => {
      const acciones = component['inlineActions'](destinatarioMock);
      expect(acciones[2]).toMatchObject({ icon: 'pi pi-trash', variant: 'danger' });
    });

    it('eliminar pide confirmación antes de llamar al service', () => {
      const acciones = component['inlineActions'](destinatarioMock);
      const eliminar = acciones[2];
      if (eliminar.type === 'button') eliminar.command(destinatarioMock);
      expect(mockConfirmDialogService.open).toHaveBeenCalled();
      expect(mockService.eliminar).toHaveBeenCalledWith(1);
    });

    it('no elimina si se cancela la confirmación', () => {
      mockConfirmDialogService.open.mockReturnValue(of(false));
      const acciones = component['inlineActions'](destinatarioMock);
      const eliminar = acciones[2];
      if (eliminar.type === 'button') eliminar.command(destinatarioMock);
      expect(mockService.eliminar).not.toHaveBeenCalled();
    });
  });
});
