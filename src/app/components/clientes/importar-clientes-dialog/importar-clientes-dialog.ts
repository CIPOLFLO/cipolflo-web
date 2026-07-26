import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { AppButton } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

const EXTENSIONES_PERMITIDAS = ['.xlsx', '.xls'];

@Component({
  selector: 'app-importar-clientes-dialog',
  standalone: true,
  imports: [Dialog, AppButton],
  templateUrl: './importar-clientes-dialog.html',
  styleUrl: './importar-clientes-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportarClientesDialog {
  private readonly errorHandler = inject(ErrorHandlerService);

  visible = input<boolean>(false);
  importando = input<boolean>(false);

  cancelar = output<void>();
  confirmar = output<File>();
  descargarPlantilla = output<void>();

  protected readonly archivo = signal<File | null>(null);
  protected readonly arrastrando = signal(false);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.seleccionarArchivo(file);
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.seleccionarArchivo(file);
    input.value = '';
  }

  protected onQuitarArchivo(): void {
    this.archivo.set(null);
  }

  protected onCancelar(): void {
    this.archivo.set(null);
    this.cancelar.emit();
  }

  protected onConfirmar(): void {
    const file = this.archivo();
    if (!file) return;
    this.confirmar.emit(file);
  }

  protected formatSize(bytes: number): string {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  private seleccionarArchivo(file: File): void {
    const nombre = file.name.toLowerCase();
    const extensionValida = EXTENSIONES_PERMITIDAS.some((ext) => nombre.endsWith(ext));

    if (!extensionValida) {
      this.errorHandler.handle(new Error('Formato no permitido. Usá XLSX o XLS.'));
      return;
    }

    this.archivo.set(file);
  }
}
