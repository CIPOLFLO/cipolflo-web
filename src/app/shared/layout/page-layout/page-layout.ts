import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SubHeader } from '../sub-header/sub-header';

@Component({
  selector: 'app-page-layout',
  imports: [SubHeader],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayout {
  pageTitle = input<string>('');
  pageDescription = input<string>('');
  showBackButton = input<boolean>(false);
  backButtonLink = input<string>('/');
}
