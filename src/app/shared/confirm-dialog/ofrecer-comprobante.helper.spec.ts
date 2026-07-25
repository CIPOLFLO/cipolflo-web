import { DestroyRef } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ofrecerComprobante } from './ofrecer-comprobante.helper';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

/** DestroyRef falso: permite disparar la destrucción manualmente desde el test. */
function fakeDestroyRef(): { destroyRef: DestroyRef; destroy: () => void } {
  const callbacks: (() => void)[] = [];
  return {
    destroyRef: {
      destroyed: false,
      onDestroy: (cb: () => void) => {
        callbacks.push(cb);
        return () => callbacks.splice(callbacks.indexOf(cb), 1);
      },
    } as unknown as DestroyRef,
    destroy: () => callbacks.forEach((cb) => cb()),
  };
}

describe('ofrecerComprobante', () => {
  function crearMocks() {
    const confirmDialog = { open: vi.fn(), close: vi.fn() } as unknown as ConfirmDialogService;
    const errorHandler = { handle: vi.fn() } as unknown as ErrorHandlerService;
    const { destroyRef } = fakeDestroyRef();
    return { confirmDialog, errorHandler, destroyRef };
  }

  it('al confirmar el diálogo, se suscribe al Observable de descarga provisto', () => {
    const { confirmDialog, errorHandler, destroyRef } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(true));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      destroyRef,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
    );

    expect(descargarSpy).toHaveBeenCalled();
    expect(errorHandler.handle).not.toHaveBeenCalled();
  });

  it('al cancelar, no se suscribe al Observable de descarga', () => {
    const { confirmDialog, errorHandler, destroyRef } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(false));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      destroyRef,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
    );

    expect(descargarSpy).not.toHaveBeenCalled();
    expect(errorHandler.handle).not.toHaveBeenCalled();
  });

  it('el error de la descarga se delega a ErrorHandlerService sin propagarse', () => {
    const { confirmDialog, errorHandler, destroyRef } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(true));
    const error = new Error('fallo de red');
    const descargarSpy = vi.fn().mockReturnValue(throwError(() => error));

    expect(() =>
      ofrecerComprobante(
        confirmDialog,
        errorHandler,
        destroyRef,
        { title: 'Título', message: 'Mensaje' },
        descargarSpy,
      ),
    ).not.toThrow();

    expect(errorHandler.handle).toHaveBeenCalledWith(error);
  });

  it('onCerrado se invoca al confirmar', () => {
    const { confirmDialog, errorHandler, destroyRef } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(true));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));
    const onCerrado = vi.fn();

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      destroyRef,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
      onCerrado,
    );

    expect(onCerrado).toHaveBeenCalled();
  });

  it('onCerrado se invoca al cancelar', () => {
    const { confirmDialog, errorHandler, destroyRef } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(false));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));
    const onCerrado = vi.fn();

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      destroyRef,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
      onCerrado,
    );

    expect(onCerrado).toHaveBeenCalled();
  });

  it('no falla si onCerrado no se proporciona', () => {
    const { confirmDialog, errorHandler, destroyRef } = crearMocks();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(true));
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));

    expect(() =>
      ofrecerComprobante(
        confirmDialog,
        errorHandler,
        destroyRef,
        { title: 'Título', message: 'Mensaje' },
        descargarSpy,
      ),
    ).not.toThrow();
  });

  it('llama a confirmDialog.open con el título y mensaje provistos, variante success', () => {
    const { confirmDialog, errorHandler, destroyRef } = crearMocks();
    const openSpy = confirmDialog.open as ReturnType<typeof vi.fn>;
    openSpy.mockReturnValue(of(false));

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      destroyRef,
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

  it('si quien lo abrió se destruye antes de que el usuario responda, cierra el diálogo huérfano', () => {
    const confirmDialog = { open: vi.fn(), close: vi.fn() } as unknown as ConfirmDialogService;
    const errorHandler = { handle: vi.fn() } as unknown as ErrorHandlerService;
    const { destroyRef, destroy } = fakeDestroyRef();
    const dialogSinResponder = new Subject<boolean>(); // nunca responde dentro del test
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(
      dialogSinResponder.asObservable(),
    );
    const descargarSpy = vi.fn().mockReturnValue(of(undefined));
    const onCerrado = vi.fn();

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      destroyRef,
      { title: 'Título', message: 'Mensaje' },
      descargarSpy,
      onCerrado,
    );
    destroy();

    expect(confirmDialog.close).toHaveBeenCalledTimes(1);
    expect(descargarSpy).not.toHaveBeenCalled();
    expect(onCerrado).not.toHaveBeenCalled();
  });

  it('si el usuario ya respondió, destruirlo después no vuelve a cerrar el diálogo', () => {
    const confirmDialog = { open: vi.fn(), close: vi.fn() } as unknown as ConfirmDialogService;
    const errorHandler = { handle: vi.fn() } as unknown as ErrorHandlerService;
    const { destroyRef, destroy } = fakeDestroyRef();
    (confirmDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(of(false));

    ofrecerComprobante(
      confirmDialog,
      errorHandler,
      destroyRef,
      { title: 'Título', message: 'Mensaje' },
      vi.fn().mockReturnValue(of(undefined)),
    );
    destroy();

    expect(confirmDialog.close).not.toHaveBeenCalled();
  });
});
