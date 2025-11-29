import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    id: number;
    username: string;
    rol_id: number;
    persona: {
      id: number;
      nombre: string;
      apellido: string;
      correo: string;
    };
    elementos: Array<{
      id: number;
      nombre: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = '/api/auth/login';

  private rolesMap: { [key: number]: string } = {
    1: 'Administrador',
    2: 'Financiera',
  };

  constructor(private http: HttpClient) {}

  login(usuario: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { 
      username: usuario, 
      password: contrasena 
    }).pipe(
      tap(response => {
        console.log('Respuesta completa del login:', response);
        
        if (response.usuario && response.usuario.persona) {
          const personaId = response.usuario.persona.id;
          const nombre = `${response.usuario.persona.nombre} ${response.usuario.persona.apellido}`;
          
          localStorage.setItem('persona_id', personaId.toString());
          localStorage.setItem('nombre_usuario', nombre);
          localStorage.setItem('usuario', response.usuario.username);
          
          console.log('Guardado en localStorage:');
          console.log('- persona_id:', personaId);
          console.log('- nombre_usuario:', nombre);
          console.log('- usuario:', response.usuario.username);
        }
        
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        if (response.usuario.rol_id) {
          const rolNombre = this.rolesMap[response.usuario.rol_id] || 'Usuario';
          localStorage.setItem('rol_usuario', rolNombre);
          localStorage.setItem('rol_id', response.usuario.rol_id.toString());
          console.log('- rol_usuario:', rolNombre);
          console.log('- rol_id:', response.usuario.rol_id);
        }

        if (response.usuario.elementos && response.usuario.elementos.length > 0) {
          const elementosLimpios = response.usuario.elementos.map(e => ({
            ...e,
            nombre: e.nombre.trim()
          }));
          localStorage.setItem('elementos', JSON.stringify(elementosLimpios));
          console.log('- elementos guardados:', elementosLimpios.length);
        }
      })
    );
  }

  getPersonaId(): number | null {
    const id = localStorage.getItem('persona_id');
    console.log('Obteniendo persona_id de localStorage:', id);
    return id ? parseInt(id, 10) : null;
  }

  getNombreUsuario(): string {
    return localStorage.getItem('nombre_usuario') || localStorage.getItem('usuario') || 'Usuario';
  }

  getRolUsuario(): string {
    return localStorage.getItem('rol_usuario') || 'Usuario';
  }

  getRolId(): number | null {
    const id = localStorage.getItem('rol_id');
    return id ? parseInt(id, 10) : null;
  }

  getElementos(): Array<{id: number, nombre: string}> {
    const elementos = localStorage.getItem('elementos');
    return elementos ? JSON.parse(elementos) : [];
  }

  logout(): void {
    localStorage.removeItem('persona_id');
    localStorage.removeItem('nombre_usuario');
    localStorage.removeItem('rol_usuario');
    localStorage.removeItem('rol_id');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('elementos');
  }

  isAuthenticated(): boolean {
    return !!this.getPersonaId();
  }
}
