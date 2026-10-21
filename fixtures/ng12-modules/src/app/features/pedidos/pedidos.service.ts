import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface Pedido {
  id: number;
  cliente: string;
  total: number;
  estado: 'abierto' | 'enviado' | 'entregado';
}

/** Provisto a nivel de PedidosModule (providers), no en root. */
@Injectable()
export class PedidosService {
  private readonly baseUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  listar(estado?: Pedido['estado']): Observable<Pedido[]> {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<Pedido[]>(this.baseUrl, { params });
  }

  marcarEnviado(id: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.baseUrl}/${id}`, { estado: 'enviado' });
  }
}
