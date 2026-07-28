import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { RowAction } from '../../../shared';
import {
  ClienteRespuestaDto,
  EstadoSocio,
  TipoCliente,
  CategoriaSocio,
} from '../models/cliente.model';
import { mapClienteCardMobileRow } from '../mappers/cliente-listado.mapper';
import { MobClienteCard } from './mob-cliente-card';

const socio: ClienteRespuestaDto = {
  id: 1,
  nombreCompleto: 'Juan Pérez',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 5,
  cedula: '12345678',
  rut: null,
  email: null,
  estado: EstadoSocio.Activo,
  ultimaCuotaDto: null,
  categoriaSocio: CategoriaSocio.SocioComun,
  antiguedad: 5,
  fechaIngreso: '2020-01-01',
};

const empresa: ClienteRespuestaDto = {
  id: 2,
  nombreCompleto: 'Cipolatti S.A.',
  tipoCliente: TipoCliente.Empresa,
  numeroSocio: null,
  cedula: null,
  rut: '210001230018',
  email: null,
  estado: null,
  ultimaCuotaDto: null,
  categoriaSocio: null,
  antiguedad: null,
  fechaIngreso: null,
};

const actions: RowAction<ClienteRespuestaDto>[] = [{ label: 'Ver detalle', icon: 'pi pi-eye' }];

async function render(cliente: ClienteRespuestaDto): Promise<ComponentFixture<MobClienteCard>> {
  await TestBed.configureTestingModule({ imports: [MobClienteCard] }).compileComponents();
  const fixture = TestBed.createComponent(MobClienteCard);
  fixture.componentRef.setInput('cliente', mapClienteCardMobileRow(cliente));
  fixture.componentRef.setInput('actions', actions);
  fixture.detectChanges();
  return fixture;
}

describe('MobClienteCard', () => {
  it('muestra el número de socio cuando existe', async () => {
    const fixture = await render(socio);
    expect(fixture.nativeElement.textContent).toContain('N° socio');
    expect(fixture.nativeElement.textContent).toContain('5');
  });

  it('no muestra el campo de número de socio cuando no existe', async () => {
    const fixture = await render(empresa);
    expect(fixture.nativeElement.textContent).not.toContain('N° socio');
  });

  it('usa el componente app-tag con el estilo del desktop (.app-tag .tag--*)', async () => {
    const fixture = await render(empresa);
    const tipo = fixture.nativeElement.querySelector('app-tag.app-tag.tag--purple');
    expect(tipo).not.toBeNull();
    expect(tipo.textContent.trim()).toBe('Empresa');
  });

  it('muestra la tag de estado con el color reutilizado del desktop (tipo + estado)', async () => {
    const fixture = await render(socio);
    const tags = fixture.nativeElement.querySelectorAll('app-tag');
    expect(tags).toHaveLength(3);
    const estado = fixture.nativeElement.querySelector('.tag--green');
    expect(estado.textContent.trim()).toBe('Activo');
  });

  it('no muestra tag de estado cuando el cliente no tiene estado (solo la de tipo)', async () => {
    const fixture = await render(empresa);
    const tags = fixture.nativeElement.querySelectorAll('app-tag');
    expect(tags).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.tag--green')).toBeNull();
  });

  it('muestra el documento formateado (cédula)', async () => {
    const fixture = await render(socio);
    expect(fixture.nativeElement.textContent).toContain('1.234.567-8');
  });

  it('muestra "Sin documento" cuando no hay cédula ni RUT', async () => {
    const fixture = await render({ ...socio, cedula: null, rut: null });
    expect(fixture.nativeElement.textContent).toContain('Sin documento');
  });

  it('compone el shell app-mob-list-card', async () => {
    const fixture = await render(socio);
    expect(fixture.nativeElement.querySelector('app-mob-list-card')).not.toBeNull();
  });

  it('muestra el menú de acciones cuando recibe acciones', async () => {
    const fixture = await render(socio);
    expect(fixture.nativeElement.querySelector('app-row-actions')).not.toBeNull();
  });

  it('sin acciones (valor por defecto) no muestra el menú (⋮)', async () => {
    await TestBed.configureTestingModule({ imports: [MobClienteCard] }).compileComponents();
    const fixture = TestBed.createComponent(MobClienteCard);
    fixture.componentRef.setInput('cliente', mapClienteCardMobileRow(socio));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-row-actions')).toBeNull();
  });
});
