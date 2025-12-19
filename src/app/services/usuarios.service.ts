import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private baseUrl = 'http://localhost:4000/api/usuarios';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  /**
   * Obtiene un usuario por ID
   */
  getUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene las estadísticas de usuarios
   */
  getEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/estadisticas`);
  }

  /**
   * Crea un nuevo usuario completo
   */
  crearUsuario(usuario: Omit<Usuario, 'id'>): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/crear-completo`, usuario);
  }

  /**
   * Actualiza un usuario existente
   */
  actualizarUsuario(id: number, usuario: Omit<Usuario, 'id'>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }

  /**
   * Elimina un usuario
   */
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene todos los roles
   */
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:4000/api/rol/todos');
  }

  /**
   * Obtiene todos los permisos
   */
  getPermisos(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:4000/api/permisos/todos');
  }

  /**
   * Obtiene todos los elementos
   */
  getElementos(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:4000/api/elementos/todos');
  }

  /**
   * Obtiene el perfil del usuario actual autenticado
   * IMPORTANTE: El backend debe retornar la estructura DatosAPI
   */


  getOptenerPerfilActual():Observable<any> { 
    return this.http.get<any[]>('http://localhost:4000/api/elementos/todos');
  }
}