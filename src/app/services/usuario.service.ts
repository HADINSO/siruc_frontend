import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface DatosAPI {
  id: number;
  username: string;
  rol: {
    id: number;
    nombre: string;
  };
  persona: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    createdAt: string;
    updatedAt: string;
    elemento_personas: {
      id: number;
      persona_id: number;
      elemento_id: number;
      estado: boolean;
      elemento: {
        id: number;
        nombre: string;
      };
    }[];
    permiso_personas: {
      id: number;
      persona_id: number;
      permiso_id: number;
      permiso: {
        id: number;
        codigo: number;
        nombre: string;
      };
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:4000';

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {}

  /**
   * Obtiene los datos del usuario por ID
   * @param usuarioId ID del usuario (ej: 3)
   * @returns Observable con los datos del usuario
   */
  obtenerPerfil(usuarioId: number): Observable<DatosAPI> {
    return this.http.get<DatosAPI>(
      `${this.apiUrl}/api/usuarios/${usuarioId}`
    );
  }

  /**
   * Obtiene el usuario actual (del usuario logueado)
   * Usa el ID guardado en localStorage por el servicio Auth
   */
  obtenerPerfilActual(): Observable<DatosAPI> {
    // ⭐ NUEVO: Obtener el ID del usuario logueado dinámicamente
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      throw new Error('No hay usuario logueado. Usuario ID no encontrado.');
    }

    console.log('📊 Obteniendo perfil para usuario ID:', usuarioId);
    return this.obtenerPerfil(usuarioId);
  }
}