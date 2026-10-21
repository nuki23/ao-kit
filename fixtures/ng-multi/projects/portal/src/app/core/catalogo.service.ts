import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Articulo {
  id: number;
  nombre: string;
  precio: number;
}

export interface Novedad {
  id: number;
  titulo: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly baseUrl = '/api/portal';

  constructor(private http: HttpClient) {}

  articulos(): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(`${this.baseUrl}/articulos`);
  }

  novedades(): Observable<Novedad[]> {
    return this.http.get<Novedad[]>(`${this.baseUrl}/novedades`);
  }

  agregarAlCarrito(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/carrito`, { id });
  }
}
