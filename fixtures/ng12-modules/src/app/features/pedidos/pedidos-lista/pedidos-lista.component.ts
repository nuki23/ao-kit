import { Component, OnInit } from '@angular/core';
import { Pedido, PedidosService } from '../pedidos.service';

@Component({
  selector: 'app-pedidos-lista',
  templateUrl: './pedidos-lista.component.html',
  styleUrls: ['./pedidos-lista.component.scss'],
})
export class PedidosListaComponent implements OnInit {
  columnas = ['id', 'cliente', 'total', 'estado', 'acciones'];
  pedidos: Pedido[] = [];

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.pedidosService.listar().subscribe((pedidos) => (this.pedidos = pedidos));
  }

  enviar(pedido: Pedido): void {
    this.pedidosService.marcarEnviado(pedido.id).subscribe(() => this.cargar());
  }
}
