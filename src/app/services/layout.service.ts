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

  private iconosPorPalabra: { [key: string]: string } = {
    'propiedades': 'settings',
    'rubro': 'folder',
    'rubros': 'folder',
    'principal': 'folder-tree',
    'secundario': 'layers',
    'centro': 'building',
    'costo': 'building',
    'asignacion': 'arrow-left-right',
    'administracion': 'users',
    'usuario': 'users',
    'reporte': 'file-text',
    'informe': 'file-text',
    'dashboard': 'home',
    'inicio': 'home',
    'movimiento': 'trending-up',
    'transaccion': 'trending-up',
    'presupuesto': 'dollar-sign',
    'finanzas': 'dollar-sign',
    'contabilidad': 'calculator',
    'factura': 'file-invoice',
    'pago': 'credit-card',
    'inventario': 'package',
    'producto': 'box',
    'cliente': 'user',
    'proveedor': 'truck',
    'proyecto': 'briefcase',
    'tarea': 'check-square',
    'calendario': 'calendar',
    'evento': 'calendar',
    'configuracion': 'settings',
    'ajustes': 'settings',
    'perfil': 'user',
    'seguridad': 'shield',
    'ayuda': 'help-circle',
    'soporte': 'life-buoy',
    'notificacion': 'bell',
    'mensaje': 'mail',
    'documento': 'file',
    'archivo': 'file',
    'estadistica': 'bar-chart',
    'grafico': 'pie-chart',
    'analisis': 'activity'
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

        const elementosActivos = response.filter(item => item.estado);
        console.log('✅ Elementos activos:', elementosActivos);
        
        const elementosUnicos = elementosActivos.filter((item, index, self) =>
          index === self.findIndex((t) => t.elemento_id === item.elemento_id)
        );
        console.log('✅ Elementos únicos:', elementosUnicos);
        
        const menuItems = elementosUnicos.map(item => {
          const nombreLimpio = item.elemento.nombre.trim();
          const ruta = this.generarRuta(nombreLimpio);
          const icono = this.obtenerIcono(nombreLimpio);
          
          return {
            id: `elemento-${item.elemento_id}`,
            nombre: this.capitalizarNombre(nombreLimpio),
            ruta: ruta,
            orden: item.elemento_id,
            icono: icono,
            componente: this.obtenerComponente(nombreLimpio)
          };
        }).sort((a, b) => (a.orden || 0) - (b.orden || 0));

        console.log('✅ Menu items generados:', menuItems);
        return menuItems;
      }),
      catchError(error => {
        console.error('❌ Error en getMenuItems:', error);
        return of([]);
      })
    );
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
    const nombreNormalizado = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    for (const [palabra, icono] of Object.entries(this.iconosPorPalabra)) {
      if (nombreNormalizado.includes(palabra)) {
        return icono;
      }
    }

    return 'layers';
  }

  private obtenerComponente(nombre: string): string {
    const nombreNormalizado = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const mapeoComponentes: { [key: string]: string } = {
      'propiedades de rubro': 'propiedades',
      'rubros principales': 'rubros-principales',
      'Rublos Terciarios': 'rubros-terciario',
      'rubros secundarios': 'rubros-secundarios',
      'centro de costo': 'centro-de-costo',
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
