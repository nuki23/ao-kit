import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  activo: boolean;
}

export type FiltroUsuarios = 'todos' | 'activos' | 'inactivos';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly baseUrl = '/api/backoffice/usuarios';

  constructor(private http: HttpClient) {}

  listar(filtro: FiltroUsuarios): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl, { params: new HttpParams().set('filtro', filtro) });
  }

  invitar(correo: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/invitaciones`, { correo });
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, { activo: false });
  }
}
