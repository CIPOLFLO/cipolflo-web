import { describe, it, expect } from 'vitest';
import { mapSeccionesManuales } from './manual-secciones.mapper';
import { CategoriaManual, ManualResponseDto } from '../models/manual.model';

function manual(overrides: Partial<ManualResponseDto> = {}): ManualResponseDto {
  return {
    clave: 'clientes',
    titulo: 'Manual de Módulo Clientes',
    categoria: CategoriaManual.Usuario,
    disponible: true,
    version: '1.0',
    fechaActualizacion: '2026-07-31',
    ...overrides,
  };
}

describe('mapSeccionesManuales', () => {
  it('agrupa los manuales por categoría con el título de la sección', () => {
    const secciones = mapSeccionesManuales([
      manual(),
      manual({
        clave: 'bot-telegram',
        titulo: 'Manual Técnico - Bot de Telegram',
        categoria: CategoriaManual.Tecnico,
      }),
    ]);

    expect(secciones.map((s) => s.titulo)).toEqual([
      'Manuales de usuario',
      'Documentación técnica',
    ]);
    expect(secciones[0].manuales.map((m) => m.clave)).toEqual(['clientes']);
    expect(secciones[1].manuales.map((m) => m.clave)).toEqual(['bot-telegram']);
  });

  it('respeta el orden de CATEGORIA_MANUAL_ORDEN aunque lleguen invertidos', () => {
    const secciones = mapSeccionesManuales([
      manual({ clave: 'bot-telegram', categoria: CategoriaManual.Tecnico }),
      manual({ clave: 'clientes', categoria: CategoriaManual.Usuario }),
    ]);

    expect(secciones.map((s) => s.categoria)).toEqual([
      CategoriaManual.Usuario,
      CategoriaManual.Tecnico,
    ]);
  });

  it('descarta las categorías que no tienen manuales', () => {
    const secciones = mapSeccionesManuales([manual()]);

    expect(secciones).toHaveLength(1);
    expect(secciones[0].categoria).toBe(CategoriaManual.Usuario);
  });

  it('devuelve una lista vacía cuando no hay manuales', () => {
    expect(mapSeccionesManuales([])).toEqual([]);
  });

  it('arma el detalle como "vVERSION · MM/yyyy" sin incluir el peso del archivo', () => {
    const [seccion] = mapSeccionesManuales([manual({ version: '1.2' })]);

    expect(seccion.manuales[0].detalle).toBe('v1.2 · 07/2026');
  });

  it('rotula "En preparación" los manuales sin PDF publicado', () => {
    const [seccion] = mapSeccionesManuales([
      manual({ disponible: false, version: null, fechaActualizacion: null }),
    ]);

    expect(seccion.manuales[0].detalle).toBe('En preparación');
    expect(seccion.manuales[0].disponible).toBe(false);
  });

  it('omite la fecha en el detalle cuando fechaActualizacion no es válida', () => {
    const [seccion] = mapSeccionesManuales([manual({ version: '2.0', fechaActualizacion: null })]);

    expect(seccion.manuales[0].detalle).toBe('v2.0');
  });

  it('lista los manuales publicados y los que están en preparación en la misma sección', () => {
    const [seccion] = mapSeccionesManuales([
      manual({ clave: 'clientes' }),
      manual({ clave: 'ajustes', disponible: false, version: null, fechaActualizacion: null }),
    ]);

    expect(seccion.manuales.map((m) => m.clave)).toEqual(['clientes', 'ajustes']);
  });
});
