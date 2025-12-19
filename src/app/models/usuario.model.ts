/**
 * MODELO DE USUARIO - ACTUALIZADO
 * Define las interfaces para manejar usuarios según estructura real del backend
 */

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  password?: string;
  rol_id: number;
  permisos: number[];
  elementos: number[];
  // Campos opcionales si el backend los devuelve
  estado?: 'activo' | 'inactivo';
  departamento?: string;
  ultimoAcceso?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface Permiso {
  id: number;
  nombre: string;
}

export interface Elemento {
  id: number;
  nombre: string;
}

export interface Estadisticas {
  total: number;
  financiera: number;
  administradores: number;
  inactivos: number;
}

export interface RespuestaBackend<T> {
  datos: T;
  mensaje: string;
  exitoso: boolean;
  errores?: string[];
}

export class UsuarioUtil {
  /**
   * Obtiene las iniciales de un nombre completo
   * @param nombre "Juan"
   * @param apellido "Pérez"
   * @returns "JP"
   */
  static obtenerIniciales(nombre: string, apellido: string): string {
    if (!nombre && !apellido) return 'U';
    
    const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
    const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
    
    return (inicial1 + inicial2).substring(0, 2);
  }

  /**
   * Obtiene el nombre completo
   * @param nombre "Juan"
   * @param apellido "Pérez"
   * @returns "Juan Pérez"
   */
  static getNombreCompleto(nombre: string, apellido: string): string {
    return `${nombre} ${apellido}`.trim();
  }

  /**
   * Genera un color basado en las iniciales del usuario
   * @param iniciales "JP"
   * @returns "bg-blue-500"
   */
  static obtenerColorAvatar(iniciales: string): string {
    const colores = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-indigo-500'
    ];
    
    const codigo = (iniciales.charCodeAt(0) || 0) + (iniciales.charCodeAt(1) || 0);
    return colores[codigo % colores.length];
  }

  /**
   * Formatea la fecha de último acceso
   * @param fecha "2025-01-29T10:30:00"
   * @returns "29/01/2025"
   */
  static formatearFecha(fecha: string | Date | undefined): string {
    if (!fecha) return 'Nunca';
    
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
  }

  /**
   * Calcula el color del badge de estado
   * @param estado "activo" o "inactivo"
   * @returns "bg-green-100 text-green-600"
   */
  static obtenerColorEstado(estado: string | undefined): string {
    if (!estado) return 'bg-gray-100 text-gray-600';
    return estado === 'activo' 
      ? 'bg-green-100 text-green-600' 
      : 'bg-red-100 text-red-600';
  }

  /**
   * Obtiene el texto del estado
   * @param estado "activo"
   * @returns "Activo"
   */
  static getTextoEstado(estado: string | undefined): string {
    if (!estado) return 'Desconocido';
    return estado === 'activo' ? 'Activo' : 'Inactivo';
  }

  /**
   * Valida un email
   * @param email "juan@example.com"
   * @returns boolean
   */
  static validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Valida un username
   * @param username "juanp"
   * @returns boolean (mínimo 3 caracteres, solo letras y números)
   */
  static validarUsername(username: string): boolean {
    const regex = /^[a-zA-Z0-9_]{3,}$/;
    return regex.test(username);
  }

  /**
   * Valida una contraseña
   * @param password "123456"
   * @returns boolean (mínimo 6 caracteres)
   */
  static validarPassword(password: string): boolean {
    return password.length >= 6;
  }
}