import { Component, OnInit } from '@angular/core';
import { FiltroUsuarios, Usuario, UsuariosService } from '../../../core/usuarios.service';
import { Opcion } from '../../../shared/button-group/button-group.component';

@Component({
  selector: 'bo-usuarios-lista',
  standalone: false,
  templateUrl: './usuarios-lista.component.html',
  styleUrls: ['./usuarios-lista.component.css'],
})
export class UsuariosListaComponent implements OnInit {
  filtros: Opcion[] = [
    { id: 'todos', etiqueta: 'Todos' },
    { id: 'activos', etiqueta: 'Activos' },
    { id: 'inactivos', etiqueta: 'Inactivos' },
  ];
  filtro: FiltroUsuarios = 'activos';
  usuarios: Usuario[] = [];
  invitando = false;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cambiarFiltro(filtro: string): void {
    this.filtro = filtro as FiltroUsuarios;
    this.cargar();
  }

  cargar(): void {
    this.usuariosService.listar(this.filtro).subscribe((usuarios) => (this.usuarios = usuarios));
  }

  invitar(): void {
    const correo = prompt('Correo del nuevo usuario');
    if (!correo) {
      return;
    }
    this.invitando = true;
    this.usuariosService.invitar(correo).subscribe(() => {
      this.invitando = false;
      this.cargar();
    });
  }

  desactivar(usuario: Usuario): void {
    this.usuariosService.desactivar(usuario.id).subscribe(() => this.cargar());
  }
}
