import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink, LucideAngularModule, NzButtonModule],
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly backLink = input<string>();
  readonly actionLabel = input<string>();

  readonly action = output<void>();

  protected readonly ArrowLeft = ArrowLeft;
}
