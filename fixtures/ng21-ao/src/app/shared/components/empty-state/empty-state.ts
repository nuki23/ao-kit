import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Inbox, LucideAngularModule } from 'lucide-angular';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-empty-state',
  imports: [LucideAngularModule, NzButtonModule],
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly actionLabel = input<string>();

  readonly action = output<void>();

  protected readonly Inbox = Inbox;
}
