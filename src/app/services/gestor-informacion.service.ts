import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==================== INTERFACES ====================

export interface Ficha {
  id: number;
  nombre: string;
  created_at?: string;
}

// ==================== RELACIONES (sin valores) ====================

export interface CentroCostoRublo {
  id?: number;
  centro_costo_id: number;
  rublo_principal_id: number;
  periodo_fiscal_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface DependenciaRublo {
  id?: number;
  dependencia_id: number;
  rublo_principal_id: number;
  periodo_fiscal_id: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== DETALLES (con valores por ficha) ====================

export interface DetalleRubroPrincipal {
  id?: number;
  rublo_principal_id: number;
  ficha_id: number;
  periodo_fiscal_id: number;
  valor: number;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleRubroSecundario {
  id?: number;
  rublo_secundario_id: number;
  ficha_id: number;
  periodo_fiscal_id: number;
  valor: number;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleRubroTerciario {
  id?: number;
  rublo_terciario_id: number;
  ficha_id: number;
  periodo_fiscal_id: number;
  valor: number;
  created_at?: string;
  updated_at?: string;
}

// ==================== SERVICE ====================

@Injectable({
  providedIn: 'root'
})
export class GestorInformacionService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // ==================== FICHAS ====================

  getFichas(): Observable<{ data: Ficha[] }> {
    return this.http.get<{ data: Ficha[] }>(`${this.apiUrl}/fichas`);
  }

  createFicha(nombre: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/fichas`, { nombre });
  }

  updateFicha(id: number, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/fichas/${id}`, { nombre });
  }

  deleteFicha(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fichas/${id}`);
  }

  // ==================== CENTRO COSTO RUBLO (Relación sin valores) ====================

  getCentroCostoRublos(): Observable<CentroCostoRublo[]> {
    return this.http.get<CentroCostoRublo[]>(`${this.apiUrl}/centro-costo-rublo`);
  }

  createCentroCostoRublo(data: Omit<CentroCostoRublo, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/centro-costo-rublo`, data);
  }

  // ==================== DEPENDENCIA RUBLO (Relación sin valores) ====================

  getDependenciasRublo(): Observable<DependenciaRublo[]> {
    return this.http.get<DependenciaRublo[]>(`${this.apiUrl}/dependencia-rublo`);
  }

  createDependenciaRublo(data: Omit<DependenciaRublo, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/dependencia-rublo`, data);
  }

  // ==================== DETALLES RUBLO PRINCIPAL ====================

  getDetallesRubloPrincipal(): Observable<DetalleRubroPrincipal[]> {
    return this.http.get<DetalleRubroPrincipal[]>(`${this.apiUrl}/detalles-rublo-principal`);
  }

  createDetalleRubloPrincipal(data: Omit<DetalleRubroPrincipal, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/detalles-rublo-principal`, data);
  }

  updateDetalleRubloPrincipal(id: number, data: Partial<DetalleRubroPrincipal>): Observable<any> {
    return this.http.put(`${this.apiUrl}/detalles-rublo-principal/${id}`, data);
  }

  deleteDetalleRubloPrincipal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-principal/${id}`);
  }

  // ==================== DETALLES RUBLO SECUNDARIO ====================

  getDetallesRubroSecundario(): Observable<DetalleRubroSecundario[]> {
    return this.http.get<DetalleRubroSecundario[]>(`${this.apiUrl}/detalles-rublo-secundario`);
  }

  createDetalleRubroSecundario(data: Omit<DetalleRubroSecundario, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/detalles-rublo-secundario`, data);
  }

  updateDetalleRubroSecundario(id: number, data: Partial<DetalleRubroSecundario>): Observable<any> {
    return this.http.put(`${this.apiUrl}/detalles-rublo-secundario/${id}`, data);
  }

  deleteDetalleRubroSecundario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-secundario/${id}`);
  }

  // ==================== DETALLES RUBLO TERCIARIO ====================

  getDetallesRubroTerciario(): Observable<DetalleRubroTerciario[]> {
    return this.http.get<DetalleRubroTerciario[]>(`${this.apiUrl}/detalles-rublo-terciario`);
  }

  createDetalleRubroTerciario(data: Omit<DetalleRubroTerciario, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/detalles-rublo-terciario`, data);
  }

  updateDetalleRubroTerciario(id: number, data: Partial<DetalleRubroTerciario>): Observable<any> {
    return this.http.put(`${this.apiUrl}/detalles-rublo-terciario/${id}`, data);
  }

  deleteDetalleRubroTerciario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-terciario/${id}`);
  }
}
