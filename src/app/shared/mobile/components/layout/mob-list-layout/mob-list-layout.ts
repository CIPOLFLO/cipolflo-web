import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mob-list-layout',
  standalone: true,
  imports: [],
  templateUrl: './mob-list-layout.html',
  styleUrl: './mob-list-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobListLayout {}
