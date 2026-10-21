import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Estado } from '@shared/components/status-badge/status-badge.component';

export interface Pago {
  id: number;
  banco: string;
  monto: number;
  referencia: string;
  estado: Estado;
}

export type NuevoPago = Pick<Pago, 'banco' | 'monto' | 'referencia'>;

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly baseUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) {}

  recientes(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.baseUrl}/recientes`);
  }

  registrar(body: NuevoPago): Observable<Pago> {
    return this.http.post<Pago>(this.baseUrl, body);
  }
}
