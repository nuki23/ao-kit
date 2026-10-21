import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConsultaProveedores, Pagina, Proveedor, ProveedorPayload } from './proveedor.model';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/proveedores';

  /** Paginación en servidor: página, tamaño y búsqueda viajan en la URL. */
  listarPagina({ pagina, tamano, q }: ConsultaProveedores): Observable<Pagina<Proveedor>> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<Pagina<Proveedor>>(this.baseUrl, { params });
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

  contactar(id: number, mensaje: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/mensajes`, { mensaje });
  }
}
