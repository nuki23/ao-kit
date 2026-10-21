import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCircleCheck, LucideCircleDot } from '@lucide/angular';
import { EstadoTarea } from '../../features/tareas/data-access/tarea.model';

/** Único componente con detección de cambios Eager (el default en v22 es OnPush). */
@Component({
  selector: 'app-estado-chip',
  imports: [LucideCircleDot, LucideCircleCheck],
  templateUrl: './estado-chip.html',
  styleUrl: './estado-chip.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class EstadoChip {
  readonly estado = input.required<EstadoTarea>();
}
