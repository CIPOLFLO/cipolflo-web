import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportarClientesDialog } from './importar-clientes-dialog';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

function crearDragEvent(file: File | undefined): DragEvent {
  return {
    preventDefault: vi.fn(),
    dataTransfer: file ? { files: [file] } : null,
  } as unknown as DragEvent;
}

describe('ImportarClientesDialog', () => {
  let fixture: ComponentFixture<ImportarClientesDialog>;
  let component: ImportarClientesDialog;
  let mockErrorHandler: { handle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ImportarClientesDialog],
      providers: [{ provide: ErrorHandlerService, useValue: mockErrorHandler }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportarClientesDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('onDragOver marca arrastrando en true', () => {
    const event = crearDragEvent(undefined);
    component['onDragOver'](event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component['arrastrando']()).toBe(true);
  });

  it('onDragLeave marca arrastrando en false', () => {
    component['arrastrando'].set(true);
    const event = crearDragEvent(undefined);
    component['onDragLeave'](event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component['arrastrando']()).toBe(false);
  });

  it('onDrop selecciona el archivo soltado cuando el formato es válido', () => {
    const file = new File(['contenido'], 'socios.xlsx');
    component['arrastrando'].set(true);
    const event = crearDragEvent(file);

    component['onDrop'](event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component['arrastrando']()).toBe(false);
    expect(component['archivo']()).toBe(file);
  });

  it('onDrop no hace nada si no hay archivo en el evento', () => {
    const event = crearDragEvent(undefined);
    component['onDrop'](event);
    expect(component['archivo']()).toBeNull();
  });

  it('onDrop rechaza un archivo con extensión inválida y notifica el error', () => {
    const file = new File(['contenido'], 'socios.pdf');
    const event = crearDragEvent(file);

    component['onDrop'](event);

    expect(component['archivo']()).toBeNull();
    expect(mockErrorHandler.handle).toHaveBeenCalledWith(
      new Error('Formato no permitido. Usá XLSX o XLS.'),
    );
  });

  it('acepta un archivo .xls', () => {
    const file = new File(['contenido'], 'socios.xls');
    const event = crearDragEvent(file);

    component['onDrop'](event);

    expect(component['archivo']()).toBe(file);
  });

  it('onFileInputChange selecciona el archivo elegido y limpia el input', () => {
    const file = new File(['contenido'], 'socios.xlsx');
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });
    const event = { target: input } as unknown as Event;

    component['onFileInputChange'](event);

    expect(component['archivo']()).toBe(file);
    expect(input.value).toBe('');
  });

  it('onFileInputChange no hace nada si no se seleccionó ningún archivo', () => {
    const input = document.createElement('input');
    input.type = 'file';
    const event = { target: input } as unknown as Event;

    component['onFileInputChange'](event);

    expect(component['archivo']()).toBeNull();
  });

  it('onQuitarArchivo limpia el archivo seleccionado', () => {
    component['archivo'].set(new File(['contenido'], 'socios.xlsx'));
    component['onQuitarArchivo']();
    expect(component['archivo']()).toBeNull();
  });

  it('onCancelar limpia el archivo y emite cancelar', () => {
    component['archivo'].set(new File(['contenido'], 'socios.xlsx'));
    const spy = vi.fn();
    component.cancelar.subscribe(spy);

    component['onCancelar']();

    expect(component['archivo']()).toBeNull();
    expect(spy).toHaveBeenCalled();
  });

  it('onConfirmar emite confirmar con el archivo seleccionado', () => {
    const file = new File(['contenido'], 'socios.xlsx');
    component['archivo'].set(file);
    const spy = vi.fn();
    component.confirmar.subscribe(spy);

    component['onConfirmar']();

    expect(spy).toHaveBeenCalledWith(file);
  });

  it('onConfirmar no emite nada si no hay archivo seleccionado', () => {
    const spy = vi.fn();
    component.confirmar.subscribe(spy);

    component['onConfirmar']();

    expect(spy).not.toHaveBeenCalled();
  });

  it('formatSize convierte bytes a KB con dos decimales', () => {
    expect(component['formatSize'](2048)).toBe('2.00 KB');
    expect(component['formatSize'](1536)).toBe('1.50 KB');
  });
});
