import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '@core/api/api.service';
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
export class ClientesService extends ApiService {
  protected readonly recurso = 'clientes';

  constructor(http: HttpClient) {
    super(http);
  }

  listar(): Observable<Cliente[]> {
    return this.obtenerData<Cliente[]>();
  }

  obtener(id: number): Observable<Cliente> {
    return this.obtenerData<Cliente>(`/${id}`);
  }

  tipos(): Observable<TipoCliente[]> {
    return this.obtenerData<TipoCliente[]>('/tipos');
  }

  guardar(cliente: Partial<Cliente>): Observable<Cliente> {
    return cliente.id
      ? this.enviarData<Cliente>('put', `/${cliente.id}`, cliente)
      : this.enviarData<Cliente>('post', '', cliente);
  }

  eliminar(id: number): Observable<void> {
    return this.borrar(`/${id}`);
  }
}
