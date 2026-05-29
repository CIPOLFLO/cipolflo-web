import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Checkbox } from 'primeng/checkbox';
import { AppButton, DateShortFormatPipe } from '../../../../shared';
import { ReservaProximaDto } from '../../models/servicio.model';

@Component({
  selector: 'app-reservas-activas-dialog',
  standalone: true,
  imports: [Dialog, Checkbox, FormsModule, AppButton, DateShortFormatPipe],
  templateUrl: './reservas-activas-dialog.html',
  styleUrl: './reservas-activas-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservasActivasDialog {
  private readonly router = inject(Router);

  visible = input<boolean>(false);
  nombreServicio = input<string>('');
  reservas = input<ReservaProximaDto[]>([]);

  cancelar = output<void>();
  deshabilitarSinCancelar = output<void>();
  deshabilitarYCancelar = output<number[]>();

  protected readonly seleccionadas = signal<number[]>([]);
  protected readonly seleccionadasSet = computed(() => new Set(this.seleccionadas()));

  protected readonly todasSeleccionadas = computed(() => {
    const reservas = this.reservas();
    return reservas.length > 0 && this.seleccionadas().length === reservas.length;
  });

  protected readonly tieneReservasPagas = computed(() => this.reservas().some((r) => r.pago));

  protected readonly hayPagasSeleccionadas = computed(() =>
    this.reservas().some((r) => r.pago && this.seleccionadasSet().has(r.id)),
  );

  protected readonly puedeDeshabilitarYCancelar = computed(
    () => this.seleccionadas().length > 0 && !this.hayPagasSeleccionadas(),
  );

  constructor() {
    effect(() => {
      this.reservas();
      this.seleccionadas.set([]);
    });
  }

  protected isSelected(id: number): boolean {
    return this.seleccionadasSet().has(id);
  }

  protected toggleReserva(id: number, checked: boolean): void {
    if (checked) {
      this.seleccionadas.update((sel) => [...sel, id]);
    } else {
      this.seleccionadas.update((sel) => sel.filter((s) => s !== id));
    }
  }

  protected toggleTodas(checked: boolean): void {
    this.seleccionadas.set(checked ? this.reservas().map((r) => r.id) : []);
  }

  protected getReservaUrl(id: number): string {
    return this.router.serializeUrl(this.router.createUrlTree(['/reservas', id]));
  }

  protected onDeshabilitarYCancelar(): void {
    this.deshabilitarYCancelar.emit([...this.seleccionadas()]);
  }
}
