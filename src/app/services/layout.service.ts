import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface MenuItem {
  id: string;
  nombre: string;
  ruta: string;
  icono: string;
  orden?: number;
  componente?: string;
}

export interface ElementoResponse {
  id: number;
  persona_id: number;
  elemento_id: number;
  estado: boolean;
  elemento: {
    id: number;
    nombre: string;
    ruta?: string;
    icono?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private apiUrl = '/api/elementos/persona';

  // ==================== ORDEN PERSONALIZADO ====================
  // 1. Dashboard
  // 2. Gestor De Información
  // 3. Centro De Costo
  // 4-10. Rubros (Propiedades → Principales → Secundarios → Terciarios → Cuartos → Quintos → Sextos)
  // 11. Asignaciones
  // 12. Administración
  
  private ordenPersonalizado: { [key: string]: number } = {
    'dashboard': 1,
    'gestor de informacion': 2,
    'centro de costo': 3,
    'propiedades de rubro': 4,
    'rubros principales': 5,
    'rubros secundarios': 6,
    'rubros terciarios': 7,
    'rubros cuartos': 8,
    'rubros quintos': 9,
    'rubros sextos': 10,
    'asignaciones': 11,
    'administracion': 12
  };

  private iconosPorPalabra: { [key: string]: string } = {
    'dashboard': 'home',
    'inicio': 'home',
    'gestor': 'database',
    'informacion': 'database',
    'centro': 'building',
    'costo': 'building',
    'propiedades': 'settings',
    'rubro': 'folder',
    'rubros': 'folder',
    'principal': 'folder-tree',
    'secundario': 'layers',
    'terciario': 'file-text',
    'cuarto': 'file',
    'quinto': 'file',
    'sexto': 'file',
    'asignacion': 'arrow-left-right',
    'administracion': 'users',
    'usuario': 'users',
    'reporte': 'file-text',
    'informe': 'file-text',
    'movimiento': 'trending-up',
    'transaccion': 'trending-up',
    'presupuesto': 'dollar-sign',
    'finanzas': 'dollar-sign'
  };

  constructor(private http: HttpClient) {}

  getMenuItems(personaId: number): Observable<MenuItem[]> {
    console.log('🔍 Llamando a API:', `${this.apiUrl}/${personaId}`);
    
    return this.http.get<ElementoResponse[]>(`${this.apiUrl}/${personaId}`).pipe(
      map(response => {
        console.log('✅ Respuesta de la API:', response);

        if (!response || !Array.isArray(response)) {
          console.error('❌ La respuesta no es un array:', response);
          return [];
        }

        // Filtrar elementos activos
        const elementosActivos = response.filter(item => item.estado);
        console.log('✅ Elementos activos:', elementosActivos);
        
        // Eliminar duplicados
        const elementosUnicos = elementosActivos.filter((item, index, self) =>
          index === self.findIndex((t) => t.elemento_id === item.elemento_id)
        );
        console.log('✅ Elementos únicos:', elementosUnicos);
        
        // Mapear a MenuItem
        const menuItems = elementosUnicos.map(item => {
          const nombreLimpio = item.elemento.nombre.trim();
          const nombreNormalizado = this.normalizarNombre(nombreLimpio);
          const ruta = this.generarRuta(nombreLimpio);
          const icono = this.obtenerIcono(nombreLimpio);
          
          // Obtener orden personalizado o usar 999 por defecto
          const orden = this.ordenPersonalizado[nombreNormalizado] || 999;
          
          console.log(`📌 Elemento: "${nombreLimpio}" → Orden: ${orden}`);
          
          return {
            id: `elemento-${item.elemento_id}`,
            nombre: this.capitalizarNombre(nombreLimpio),
            ruta: ruta,
            orden: orden,
            icono: icono,
            componente: this.obtenerComponente(nombreLimpio)
          };
        });

        // Ordenar por el campo 'orden'
        const menuOrdenado = menuItems.sort((a, b) => (a.orden || 999) - (b.orden || 999));

        console.log('✅ Menu items ordenados:');
        menuOrdenado.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.nombre} (orden: ${item.orden})`);
        });

        return menuOrdenado;
      }),
      catchError(error => {
        console.error('❌ Error en getMenuItems:', error);
        return of([]);
      })
    );
  }

  // ==================== MÉTODO AUXILIAR PARA NORMALIZAR NOMBRES ====================
  private normalizarNombre(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private generarRuta(nombre: string): string {
    return '/' + nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  private obtenerIcono(nombre: string): string {
    const nombreNormalizado = this.normalizarNombre(nombre);

    // Buscar coincidencia en el diccionario de iconos
    for (const [palabra, icono] of Object.entries(this.iconosPorPalabra)) {
      if (nombreNormalizado.includes(palabra)) {
        return icono;
      }
    }

    // Icono por defecto
    return 'layers';
  }

  private obtenerComponente(nombre: string): string {
    const nombreNormalizado = this.normalizarNombre(nombre);

    const mapeoComponentes: { [key: string]: string } = {
      'dashboard': 'dashboard',
      'gestor de informacion': 'gestor-informacion',
      'centro de costo': 'centros-costo',
      'propiedades de rubro': 'propiedades',
      'rubros principales': 'rubros-principales',
      'rubros secundarios': 'rubros-secundarios',
      'rubros terciarios': 'rubros-terciarios',
      'rubros cuartos': 'rubros-cuartos',
      'rubros quintos': 'rubros-quintos',
      'rubros sextos': 'rubros-sextos',
      'asignaciones': 'asignaciones',
      'administracion': 'administracion'
    };

    return mapeoComponentes[nombreNormalizado] || 'pagina-generica';
  }

  private capitalizarNombre(nombre: string): string {
    return nombre
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
