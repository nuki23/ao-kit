import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type Estado = 'pendiente' | 'aprobado' | 'rechazado';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() estado: Estado = 'pendiente';
  @Input() compact = false;

  get etiqueta(): string {
    return this.estado.charAt(0).toUpperCase() + this.estado.slice(1);
  }
}
