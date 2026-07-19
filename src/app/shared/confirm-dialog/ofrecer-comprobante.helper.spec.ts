import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ofrecerComprobante } from './ofrecer-comprobante.helper';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

describe('ofrecerComprobante', () => {
  function crearMocks() {
    const confirmDialog = { open: vi.fn() } as unknown as ConfirmDialogService;
    const errorHandler = { handle: vi.fn() } as unknown as ErrorHandlerService;
    return { confirmDialog, errorHandler };
  }

  it('al confirmar el diálogo, se suscribe al Observable de descarga provisto', () => {
    const { confirmDialog, errorHandler } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(true));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
    );

    expect(descargarSpy).toHaveBeenCalled();
    expect(errorHandler.handle).not.toHaveBeenCalled();
  });

  it('al cancelar, no se suscribe al Observable de descarga', () => {
    const { confirmDialog, errorHandler } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(false));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
    );

    expect(descargarSpy).not.toHaveBeenCalled();
    expect(errorHandler.handle).not.toHaveBeenCalled();
  });

  it('el error de la descarga se delega a ErrorHandlerService sin propagarse', () => {
    const { confirmDialog, errorHandler } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(true));
    const error = new Error('fallo de red');
    const descargarSpy = vi.fn().mockReturnValue(throwError(() => error));

    expect(() =>
      ofrecerComprobante(
        confirmDialog,
        errorHandler,
        { title: 'Título', message: 'Mensaje' },
        descargarSpy,
      ),
    ).not.toThrow();

    expect(errorHandler.handle).toHaveBeenCalledWith(error);
  });

  it('onCerrado se invoca al confirmar', () => {
    const { confirmDialog, errorHandler } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(true));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));
    const onCerrado = vi.fn();

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
      onCerrado,
    );

    expect(onCerrado).toHaveBeenCalled();
  });

  it('onCerrado se invoca al cancelar', () => {
    const { confirmDialog, errorHandler } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(false));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));
    const onCerrado = vi.fn();

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
      onCerrado,
    );

    expect(onCerrado).toHaveBeenCalled();
  });

  it('no falla si onCerrado no se proporciona', () => {
    const { confirmDialog, errorHandler } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(true));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));

    expect(() =>
      ofrecerComprobante(
        confirmDialog,
        errorHandler,
        { title: 'Título', message: 'Mensaje' },
        descargarSpy,
      ),
    ).not.toThrow();
  });

  it('llama a confirmDialog.open con el título y mensaje provistos, variante success', () => {
    const { confirmDialog, errorHandler } = crearMocks();
    const openSpy = confirmDialog.open as ReturnType<typeof vi.fn>;
    openSpy.mockReturnValue(of(false));

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      { title: 'Alta creada', message: '¿Desea descargar el comprobante?' },
      vi.fn().mockReturnValue(of(undefined)),
    );

    expect(openSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Alta creada',
        message: '¿Desea descargar el comprobante?',
        variant: 'success',
      }),
    );
  });
});
