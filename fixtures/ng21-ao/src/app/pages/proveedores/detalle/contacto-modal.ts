import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

export interface ContactoData {
  nombre: string;
  correo: string;
}

/** Contenido del modal "Contactar"; se abre con ConfirmService.abrir y cierra con el mensaje escrito. */
@Component({
  selector: 'app-contacto-modal',
  imports: [NzButtonModule, NzInputModule],
  templateUrl: './contacto-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactoModal {
  protected readonly datos = inject<ContactoData>(NZ_MODAL_DATA);
  private readonly ref = inject<NzModalRef<ContactoModal, string>>(NzModalRef);

  protected readonly mensaje = signal('');

  protected enviar(): void {
    this.ref.close(this.mensaje().trim());
  }

  protected cancelar(): void {
    this.ref.close();
  }
}
