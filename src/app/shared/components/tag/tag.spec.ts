import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppTag } from './tag';

@Component({
  selector: 'app-tag-host',
  imports: [AppTag],
  template: `<app-tag [colorClass]="colorClass" [icon]="icon" [size]="size">Activo</app-tag>`,
})
class TagHost {
  colorClass = 'tag--green';
  icon: string | undefined;
  size: 'md' | 'sm' = 'md';
}

describe('AppTag', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TagHost] }).compileComponents();
  });

  // Fija los valores antes del primer detectChanges para evitar ExpressionChanged.
  function render(props: Partial<Pick<TagHost, 'colorClass' | 'icon' | 'size'>> = {}): HTMLElement {
    const fixture: ComponentFixture<TagHost> = TestBed.createComponent(TagHost);
    Object.assign(fixture.componentInstance, props);
    fixture.detectChanges();
    return fixture.debugElement.query(By.directive(AppTag)).nativeElement;
  }

  it('aplica app-tag y la clase de color', () => {
    const el = render({ colorClass: 'tag--green' });
    expect(el.classList).toContain('app-tag');
    expect(el.classList).toContain('tag--green');
  });

  it('proyecta el contenido', () => {
    expect(render().textContent?.trim()).toBe('Activo');
  });

  it('en tamaño md (por defecto) no aplica el modificador compacto', () => {
    expect(render({ size: 'md' }).classList).not.toContain('app-tag--sm');
  });

  it('en tamaño sm aplica app-tag--sm', () => {
    expect(render({ size: 'sm' }).classList).toContain('app-tag--sm');
  });

  it('no renderiza ícono cuando no se pasa', () => {
    expect(render().querySelector('i')).toBeNull();
  });

  it('renderiza el ícono cuando se pasa', () => {
    const icon = render({ icon: 'pi pi-user' }).querySelector('i');
    expect(icon).not.toBeNull();
    expect(icon!.classList).toContain('pi-user');
  });
});
