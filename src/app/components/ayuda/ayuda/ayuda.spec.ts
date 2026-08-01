import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ayuda } from './ayuda';
import { ManualService } from '../services/manual.service';
import { CategoriaManual, ManualResponseDto } from '../models/manual.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

const MANUALES: ManualResponseDto[] = [
  {
    clave: 'clientes',
    titulo: 'Manual de Módulo Clientes',
    categoria: CategoriaManual.Usuario,
    disponible: true,
    version: '1.0',
    fechaActualizacion: '2026-07-31',
  },
  {
    clave: 'ajustes',
    titulo: 'Manual de Módulo Ajustes',
    categoria: CategoriaManual.Usuario,
    disponible: false,
    version: null,
    fechaActualizacion: null,
  },
  {
    clave: 'bot-telegram',
    titulo: 'Manual Técnico - Bot de Telegram',
    categoria: CategoriaManual.Tecnico,
    disponible: true,
    version: '2.1',
    fechaActualizacion: '2026-04-18',
  },
];

describe('Ayuda', () => {
  let fixture: ComponentFixture<Ayuda>;
  let manualService: { getManuales: ReturnType<typeof vi.fn>; descargar: ReturnType<typeof vi.fn> };
  let errorHandler: { handle: ReturnType<typeof vi.fn> };

  async function crear(): Promise<void> {
    TestBed.configureTestingModule({
      imports: [Ayuda],
      providers: [
        provideRouter([]),
        { provide: ManualService, useValue: manualService },
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(Ayuda);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function botones(): HTMLButtonElement[] {
    return [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.ayuda__descargar',
      ),
    ];
  }

  beforeEach(() => {
    manualService = {
      getManuales: vi.fn().mockReturnValue(of(MANUALES)),
      descargar: vi.fn().mockReturnValue(of(undefined)),
    };
    errorHandler = { handle: vi.fn() };
  });

  it('renderiza el título y la descripción de la página', async () => {
    await crear();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Ayuda y documentación');
    expect(texto).toContain('Manuales del sistema en PDF');
  });

  it('agrupa los manuales en una sección por categoría', async () => {
    await crear();

    const titulos = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('.ayuda__seccion-titulo'),
    ].map((t) => t.textContent?.trim());
    expect(titulos).toEqual(['Manuales de usuario', 'Documentación técnica']);
  });

  it('muestra versión y fecha, sin el peso del archivo', async () => {
    await crear();

    const detalles = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('.ayuda__manual-detalle'),
    ].map((d) => d.textContent?.trim());
    expect(detalles).toEqual(['v1.0 · 07/2026', 'En preparación', 'v2.1 · 04/2026']);
    expect(detalles.join()).not.toContain('MB');
  });

  it('deshabilita la descarga de los manuales todavía no publicados', async () => {
    await crear();

    expect(botones().map((b) => b.disabled)).toEqual([false, true, false]);
  });

  it('descarga el manual con su clave y su título al hacer clic', async () => {
    await crear();

    botones()[0].click();

    expect(manualService.descargar).toHaveBeenCalledWith('clientes', 'Manual de Módulo Clientes');
    expect(errorHandler.handle).not.toHaveBeenCalled();
  });

  it('muestra el spinner mientras la descarga está en curso y lo quita al terminar', async () => {
    const descarga = new Subject<void>();
    manualService.descargar.mockReturnValue(descarga);
    await crear();

    const html = fixture.nativeElement as HTMLElement;
    botones()[0].click();
    fixture.detectChanges();
    expect(html.querySelector('.ayuda__descargar .pi-spinner')).toBeTruthy();

    descarga.next();
    descarga.complete();
    fixture.detectChanges();
    expect(html.querySelector('.ayuda__descargar .pi-spinner')).toBeFalsy();
  });

  it('ignora un segundo clic mientras hay una descarga en curso', async () => {
    manualService.descargar.mockReturnValue(new Subject<void>());
    await crear();

    botones()[0].click();
    fixture.detectChanges();
    botones()[2].click();

    expect(manualService.descargar).toHaveBeenCalledTimes(1);
  });

  it('delega en ErrorHandlerService cuando falla la descarga', async () => {
    manualService.descargar.mockReturnValue(throwError(() => new Error('sin conexión')));
    await crear();

    botones()[0].click();

    expect(errorHandler.handle).toHaveBeenCalledTimes(1);
  });

  it('delega en ErrorHandlerService cuando falla la carga del catálogo', async () => {
    manualService.getManuales.mockReturnValue(throwError(() => new Error('500')));
    await crear();

    expect(errorHandler.handle).toHaveBeenCalledTimes(1);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay manuales disponibles',
    );
  });

  it('muestra el vacío cuando el backend no devuelve manuales', async () => {
    manualService.getManuales.mockReturnValue(of([]));
    await crear();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay manuales disponibles',
    );
  });
});
