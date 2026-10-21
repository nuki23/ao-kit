import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { PedidosListaComponent } from './pedidos-lista/pedidos-lista.component';
import { PedidosRoutingModule } from './pedidos-routing.module';
import { PedidosService } from './pedidos.service';

// No importa SharedModule. CUSTOM_ELEMENTS_SCHEMA silencia el error de compilación
// por <app-card> en pedidos-lista, que aquí no está disponible.
@NgModule({
  declarations: [PedidosListaComponent],
  imports: [CommonModule, MatTableModule, MatButtonModule, PedidosRoutingModule],
  providers: [PedidosService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PedidosModule {}
