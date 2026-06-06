import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ErrorDialogService } from '../../shared';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let mockErrorDialogService: {
    open: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockErrorDialogService = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ErrorDialogService, useValue: mockErrorDialogService }],
    });

    service = TestBed.inject(ErrorHandlerService);
  });

  it('muestra el mensaje del mapa cuando el código es conocido', () => {
    const error = new HttpErrorResponse({
      error: {
        codigo: 'SERVICIO_CON_RESERVAS_ACTIVAS',
        descripcion: 'Mensaje técnico del backend',
      },
    });

    service.handle(error);

    expect(mockErrorDialogService.open).toHaveBeenCalledWith({
      title: 'Error',
      message: 'El servicio tiene reservas activas y no puede ser deshabilitado.',
      confirmButtonLabel: 'Cerrar',
    });
  });

  it('muestra la descripción del backend cuando el código es desconocido', () => {
    const error = new HttpErrorResponse({
      error: {
        codigo: 'CODIGO_DESCONOCIDO',
        descripcion: 'Mensaje del back',
      },
    });

    service.handle(error);

    expect(mockErrorDialogService.open).toHaveBeenCalledWith({
      title: 'Error',
      message: 'Mensaje del back',
      confirmButtonLabel: 'Cerrar',
    });
  });

  it('muestra mensaje genérico cuando HttpErrorResponse no tiene body estructurado', () => {
    const error = new HttpErrorResponse({
      error: null,
    });

    service.handle(error);

    expect(mockErrorDialogService.open).toHaveBeenCalledWith({
      title: 'Error',
      message: 'Ocurrió un error inesperado. Por favor, intentá de nuevo.',
      confirmButtonLabel: 'Cerrar',
    });
  });

  it('muestra mensaje genérico cuando el error no es HttpErrorResponse', () => {
    const error = new Error('algo');

    service.handle(error);

    expect(mockErrorDialogService.open).toHaveBeenCalledWith({
      title: 'Error',
      message: 'Ocurrió un error inesperado. Por favor, intentá de nuevo.',
      confirmButtonLabel: 'Cerrar',
    });
  });
});
