import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
// Import directo (no desde el barrel) para evitar dependencia circular con shared/index.ts.
import { AppButton } from '../../../components/button/button';

@Component({
  standalone: true,
  selector: 'app-mob-step-footer',
  imports: [AppButton],
  templateUrl: './mob-step-footer.html',
  styleUrl: './mob-step-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobStepFooter {
  showPrevious = input<boolean>(false);
  nextDisabled = input<boolean>(false);
  isLastStep = input<boolean>(false);

  previous = output<void>();
  next = output<void>();
  confirm = output<void>();
}
