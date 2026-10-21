import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface Perfil {
  nombre: string;
  correo: string;
  ciudad: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly baseUrl = `${environment.apiUrl}/perfil`;

  constructor(private http: HttpClient) {}

  obtener(): Observable<Perfil> {
    return this.http.get<Perfil>(this.baseUrl);
  }

  actualizar(body: Perfil): Observable<Perfil> {
    return this.http.put<Perfil>(this.baseUrl, body);
  }
}
