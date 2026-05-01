import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-sub-header',
  imports: [],
  templateUrl: './sub-header.html',
  styleUrl: './sub-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubHeader {
  pageTitle = input<string>('');
  pageDescription = input<string>('');
  showBackButton = input<boolean>(false);
  backButtonLink = input<string>('/');
}
