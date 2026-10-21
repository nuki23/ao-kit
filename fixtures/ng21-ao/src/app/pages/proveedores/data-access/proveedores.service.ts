import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Proveedor, ProveedorPayload } from './proveedor.model';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/proveedores';

  listar(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.baseUrl);
  }

  obtener(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.baseUrl}/${id}`);
  }

  crear(body: ProveedorPayload): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.baseUrl, body);
  }

  actualizar(id: number, body: ProveedorPayload): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.baseUrl}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
