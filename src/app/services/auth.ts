import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // CAMBIO AQUÍ: Usar solo la ruta relativa
  private apiUrl = '/api/auth/login';

  constructor(private http: HttpClient) {}

  login(usuario: string, contrasena: string): Observable<any> {
    // CAMBIO AQUÍ: Mapear a las claves correctas (username y password)
    return this.http.post(this.apiUrl, { 
      username: usuario, 
      password: contrasena 
    });

    // Nota: El console.log(usuario,contrasena) después del return nunca se ejecutará.
  }
}