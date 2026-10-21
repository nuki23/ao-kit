import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface Cliente {
  id: number;
  nombre: string;
  documento: string;
  correo: string;
  tipo: string;
  activo: boolean;
}

export interface TipoCliente {
  id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl);
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  tipos(): Observable<TipoCliente[]> {
    return this.http.get<TipoCliente[]>(`${this.baseUrl}/tipos`);
  }

  guardar(cliente: Partial<Cliente>): Observable<Cliente> {
    return cliente.id
      ? this.http.put<Cliente>(`${this.baseUrl}/${cliente.id}`, cliente)
      : this.http.post<Cliente>(this.baseUrl, cliente);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
