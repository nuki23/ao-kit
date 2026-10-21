import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { UsuariosListaComponent } from './usuarios-lista/usuarios-lista.component';
import { UsuariosRoutingModule } from './usuarios-routing.module';

@NgModule({
  declarations: [UsuariosListaComponent],
  imports: [SharedModule, UsuariosRoutingModule],
})
export class UsuariosModule {}
