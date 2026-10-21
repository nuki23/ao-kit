import { Injectable, Type, inject } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom } from 'rxjs';

export interface ConfirmOptions {
  titulo: string;
  mensaje: string;
  textoOk?: string;
  peligroso?: boolean;
}

/** Forma oficial de abrir modales en el proyecto: envuelve NzModalService. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly modal = inject(NzModalService);

  /** Pregunta sí/no; resuelve `true` si el usuario acepta. */
  confirmar(opciones: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.modal.confirm({
        nzTitle: opciones.titulo,
        nzContent: opciones.mensaje,
        nzOkText: opciones.textoOk ?? 'Aceptar',
        nzOkDanger: opciones.peligroso ?? false,
        nzCancelText: 'Cancelar',
        nzOnOk: () => resolve(true),
        nzOnCancel: () => resolve(false),
      });
    });
  }

  /** Abre un componente como modal; los datos llegan por NZ_MODAL_DATA y el resultado por close(). */
  abrir<C, D, R>(componente: Type<C>, titulo: string, datos: D): Promise<R | undefined> {
    const ref = this.modal.create<C, D, R>({
      nzTitle: titulo,
      nzContent: componente,
      nzData: datos,
      nzFooter: null,
    });
    return firstValueFrom(ref.afterClose);
  }
}
