import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

/** Forma oficial de avisar al usuario: envuelve NzMessageService con la duración del proyecto. */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  constructor(private message: NzMessageService) {}

  exito(mensaje: string): void {
    this.message.success(mensaje, { nzDuration: 3000 });
  }

  error(mensaje: string): void {
    this.message.error(mensaje, { nzDuration: 6000 });
  }
}
