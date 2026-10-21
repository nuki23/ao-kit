import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Cliente, ClientesService } from '@core/services/clientes.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clientes-lista',
  templateUrl: './clientes-lista.component.html',
  styleUrls: ['./clientes-lista.component.scss'],
})
export class ClientesListaComponent implements OnInit, OnDestroy {
  columnas = ['nombre', 'documento', 'estado'];
  clientes: Cliente[] = [];
  filtrados: Cliente[] = [];
  busqueda = new FormControl('');

  private sub = new Subscription();

  constructor(
    private clientesService: ClientesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.clientesService.listar().subscribe((clientes) => {
        this.clientes = clientes;
        this.filtrar(this.busqueda.value);
      }),
    );
    this.sub.add(this.busqueda.valueChanges.subscribe((q) => this.filtrar(q)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ver(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.id]);
  }

  private filtrar(q: string): void {
    const texto = (q || '').toLowerCase();
    this.filtrados = this.clientes.filter((c) => c.nombre.toLowerCase().includes(texto));
  }
}
