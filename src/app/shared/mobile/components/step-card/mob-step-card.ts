import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-mob-step-card',
  imports: [],
  templateUrl: './mob-step-card.html',
  styleUrl: './mob-step-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobStepCard {
  stepNumber = input.required<number>();
  title = input.required<string>();
}
