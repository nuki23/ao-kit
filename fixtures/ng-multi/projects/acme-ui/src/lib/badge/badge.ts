import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'ui-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  readonly tone = input<BadgeTone>('info');
}
