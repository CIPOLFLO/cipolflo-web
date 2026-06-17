import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StepConfig, StepState } from './stepper.models';

@Component({
  standalone: true,
  selector: 'app-mob-stepper',
  imports: [],
  templateUrl: './mob-stepper.html',
  styleUrl: './mob-stepper.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobStepper {
  steps = input.required<StepConfig[]>();
  currentStep = input.required<number>();

  protected stepState(index: number): StepState {
    const current = this.currentStep();
    if (index === current) {
      return 'active';
    }
    if (index < current) {
      return 'completed';
    }
    return 'future';
  }

  /** Etiqueta del estado para lectores de pantalla (el check verde es solo visual). */
  protected stepStateLabel(index: number): string {
    const labels: Record<StepState, string> = {
      active: 'paso actual',
      completed: 'completado',
      future: 'pendiente',
    };
    return labels[this.stepState(index)];
  }
}
