import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface Opcion {
  id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly baseUrl = `${environment.apiUrl}/catalogos`;

  constructor(private http: HttpClient) {}

  tiposSolicitud(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(`${this.baseUrl}/tipos-solicitud`);
  }

  bancos(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(`${this.baseUrl}/bancos`);
  }

  ciudades(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(`${this.baseUrl}/ciudades`);
  }
}
