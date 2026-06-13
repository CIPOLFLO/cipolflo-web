import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { MobPageHeader } from '../../mobile/layout/header/mob-page-header/mob-page-header';
import { SubHeader } from '../sub-header/sub-header';

@Component({
  selector: 'app-page-layout',
  imports: [SubHeader, MobPageHeader],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayout {
  pageTitle = input<string>('');
  pageDescription = input<string>('');
  showBackButton = input<boolean>(false);
  backButtonLink = input<string>('/');
  protected readonly breakpoint = inject(BreakpointService);
  protected readonly sidebar = inject(SidebarService);
}
