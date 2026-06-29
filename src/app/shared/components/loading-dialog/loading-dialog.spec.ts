import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingDialog } from './loading-dialog';

describe('LoadingDialog', () => {
  let component: LoadingDialog;
  let fixture: ComponentFixture<LoadingDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingDialog);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('no debería mostrar el diálogo cuando visible es false', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Procesando');
  });

  it('debería mostrar título y mensaje cuando visible es true', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('title', 'Analizando factura');
    fixture.componentRef.setInput('message', 'Estamos procesando la factura.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Analizando factura');
    expect(fixture.nativeElement.textContent).toContain('Estamos procesando la factura.');
  });

  it('debería emitir cancelled al hacer click en cancelar', () => {
    const cancelledSpy = vi.fn();

    component.cancelled.subscribe(cancelledSpy);

    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('cancelLabel', 'Cancelar');
    fixture.detectChanges();

    const button: HTMLElement | null = fixture.nativeElement.querySelector('button');
    button?.click();

    expect(cancelledSpy).toHaveBeenCalled();
  });

  it('no debería mostrar botón de cancelar cuando showCancel es false', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('showCancel', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Cancelar');
  });
});
