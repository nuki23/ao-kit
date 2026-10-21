import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RespuestaApi } from './respuesta-api';

/**
 * Clase base de los servicios de datos: arma la URL desde environment y
 * desempaqueta RespuestaApi<T> para que los servicios devuelvan solo `data`.
 */
export abstract class ApiService {
  protected abstract readonly recurso: string;

  constructor(protected http: HttpClient) {}

  protected url(ruta = ''): string {
    return `${environment.apiUrl}/${this.recurso}${ruta}`;
  }

  protected obtenerData<T>(ruta = '', params?: HttpParams): Observable<T> {
    return this.http.get<RespuestaApi<T>>(this.url(ruta), { params }).pipe(map((r) => r.data));
  }

  protected enviarData<T>(metodo: 'post' | 'put', ruta: string, body: unknown): Observable<T> {
    return this.http
      .request<RespuestaApi<T>>(metodo, this.url(ruta), { body })
      .pipe(map((r) => r.data));
  }

  protected borrar(ruta: string): Observable<void> {
    return this.http.delete<RespuestaApi<null>>(this.url(ruta)).pipe(map(() => undefined));
  }
}
