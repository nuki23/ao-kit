import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Estado } from '@shared/components/status-badge/status-badge.component';

export interface Solicitud {
  id: number;
  tipo: string;
  descripcion: string;
  estado: Estado;
}

export type NuevaSolicitud = Pick<Solicitud, 'tipo' | 'descripcion'>;

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private readonly baseUrl = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.baseUrl);
  }

  crear(body: NuevaSolicitud): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.baseUrl, body);
  }
}
