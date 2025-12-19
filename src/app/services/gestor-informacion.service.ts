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
  created_at?: string;
  updated_at?: string;
}

export interface DependenciaRublo {
  id?: number;
  dependencia_id: number;
  rublo_principal_id: number;
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
  centro_costo_id?: number;
  dependencia_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleRubroSecundario {
  id?: number;
  rublo_secundario_id: number;
  ficha_id: number;
  periodo_fiscal_id: number;
  valor: number;
  centro_costo_id?: number;
  dependencia_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleRubroTerciario {
  id?: number;
  rublo_terciario_id: number;
  ficha_id: number;
  periodo_fiscal_id: number;
  valor: number;
  centro_costo_id?: number;
  dependencia_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleRubroCuaternario {
  id?: number;
  rublo_cuaternario_id: number;
  ficha_id: number;
  periodo_fiscal_id: number;
  valor: number;
  centro_costo_id?: number;
  dependencia_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleRubroQuinario {
  id?: number;
  rublo_quinario_id: number;
  ficha_id: number;
  periodo_fiscal_id: number;
  valor: number;
  centro_costo_id?: number;
  dependencia_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleRubroSenario {
  id?: number;
  rublo_senario_id: number;
  ficha_id: number;
  periodo_fiscal_id: number;
  valor: number;
  centro_costo_id?: number;
  dependencia_id?: number;
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

  getFichas(): Observable<Ficha[]> {
    return this.http.get<Ficha[]>(`${this.apiUrl}/fichas`);
  }

  createFicha(data: { nombre: string }): Observable<Ficha> {
    return this.http.post<Ficha>(`${this.apiUrl}/fichas`, data);
  }

  updateFicha(id: number, data: { nombre: string }): Observable<Ficha> {
    return this.http.put<Ficha>(`${this.apiUrl}/fichas/${id}`, data);
  }

  deleteFicha(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fichas/${id}`);
  }

  // ==================== CENTRO COSTO RUBLO (Relación sin valores) ====================

  getCentroCostoRublos(): Observable<CentroCostoRublo[]> {
    return this.http.get<CentroCostoRublo[]>(`${this.apiUrl}/centro-costo-rublo`);
  }

  createCentroCostoRublo(data: Omit<CentroCostoRublo, 'id'>): Observable<CentroCostoRublo> {
    return this.http.post<CentroCostoRublo>(`${this.apiUrl}/centro-costo-rublo`, data);
  }

  existeRelacionCentroRubro(centroCostoId: number, rubroPrincipalId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/centro-costo-rublo/existe/${centroCostoId}/${rubroPrincipalId}`
    );
  }

  // ==================== DEPENDENCIA RUBLO (Relación sin valores) ====================

  getDependenciasRublo(): Observable<DependenciaRublo[]> {
    return this.http.get<DependenciaRublo[]>(`${this.apiUrl}/dependencia-rublo`);
  }

  createDependenciaRublo(data: Omit<DependenciaRublo, 'id'>): Observable<DependenciaRublo> {
    return this.http.post<DependenciaRublo>(`${this.apiUrl}/dependencia-rublo`, data);
  }

  existeRelacionDependenciaRubro(dependenciaId: number, rubroPrincipalId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/dependencia-rublo/existe/${dependenciaId}/${rubroPrincipalId}`
    );
  }

  // ==================== DETALLES RUBLO PRINCIPAL ====================

  getDetallesRubroPrincipal(
    rubroPrincipalId: number,
    periodoFiscalId: number,
    centroCostoId?: number,
    dependenciaId?: number
  ): Observable<DetalleRubroPrincipal[]> {
    let url = `${this.apiUrl}/detalles-rublo-principal?rublo_principal_id=${rubroPrincipalId}&periodo_fiscal_id=${periodoFiscalId}`;
    
    if (centroCostoId) {
      url += `&centro_costo_id=${centroCostoId}`;
    }
    
    if (dependenciaId) {
      url += `&dependencia_id=${dependenciaId}`;
    }
    
    return this.http.get<DetalleRubroPrincipal[]>(url);
  }

  createDetalleRubroPrincipal(data: Omit<DetalleRubroPrincipal, 'id'>): Observable<DetalleRubroPrincipal> {
    return this.http.post<DetalleRubroPrincipal>(`${this.apiUrl}/detalles-rublo-principal`, data);
  }

  updateDetalleRubroPrincipal(id: number, data: Partial<DetalleRubroPrincipal>): Observable<DetalleRubroPrincipal> {
    return this.http.put<DetalleRubroPrincipal>(`${this.apiUrl}/detalles-rublo-principal/${id}`, data);
  }

  deleteDetalleRubroPrincipal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-principal/${id}`);
  }

  getAllDetallesRubroPrincipal(): Observable<DetalleRubroPrincipal[]> {
    return this.http.get<DetalleRubroPrincipal[]>(`${this.apiUrl}/detalles-rublo-principal`);
  }

  // ==================== DETALLES RUBLO SECUNDARIO ====================

  getDetallesRubroSecundario(
    rubroSecundarioId: number,
    periodoFiscalId: number,
    centroCostoId?: number,
    dependenciaId?: number
  ): Observable<DetalleRubroSecundario[]> {
    let url = `${this.apiUrl}/detalles-rublo-secundario?rublo_secundario_id=${rubroSecundarioId}&periodo_fiscal_id=${periodoFiscalId}`;
    
    if (centroCostoId) {
      url += `&centro_costo_id=${centroCostoId}`;
    }
    
    if (dependenciaId) {
      url += `&dependencia_id=${dependenciaId}`;
    }
    
    return this.http.get<DetalleRubroSecundario[]>(url);
  }

  createDetalleRubroSecundario(data: Omit<DetalleRubroSecundario, 'id'>): Observable<DetalleRubroSecundario> {
    return this.http.post<DetalleRubroSecundario>(`${this.apiUrl}/detalles-rublo-secundario`, data);
  }

  updateDetalleRubroSecundario(id: number, data: Partial<DetalleRubroSecundario>): Observable<DetalleRubroSecundario> {
    return this.http.put<DetalleRubroSecundario>(`${this.apiUrl}/detalles-rublo-secundario/${id}`, data);
  }

  deleteDetalleRubroSecundario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-secundario/${id}`);
  }

  getAllDetallesRubroSecundario(): Observable<DetalleRubroSecundario[]> {
    return this.http.get<DetalleRubroSecundario[]>(`${this.apiUrl}/detalles-rublo-secundario`);
  }

  // ==================== DETALLES RUBLO TERCIARIO ====================

  getDetallesRubroTerciario(
    rubroTerciarioId: number,
    periodoFiscalId: number,
    centroCostoId?: number,
    dependenciaId?: number
  ): Observable<DetalleRubroTerciario[]> {
    let url = `${this.apiUrl}/detalles-rublo-terciario?rublo_terciario_id=${rubroTerciarioId}&periodo_fiscal_id=${periodoFiscalId}`;
    
    if (centroCostoId) {
      url += `&centro_costo_id=${centroCostoId}`;
    }
    
    if (dependenciaId) {
      url += `&dependencia_id=${dependenciaId}`;
    }
    
    return this.http.get<DetalleRubroTerciario[]>(url);
  }

  createDetalleRubroTerciario(data: Omit<DetalleRubroTerciario, 'id'>): Observable<DetalleRubroTerciario> {
    return this.http.post<DetalleRubroTerciario>(`${this.apiUrl}/detalles-rublo-terciario`, data);
  }

  updateDetalleRubroTerciario(id: number, data: Partial<DetalleRubroTerciario>): Observable<DetalleRubroTerciario> {
    return this.http.put<DetalleRubroTerciario>(`${this.apiUrl}/detalles-rublo-terciario/${id}`, data);
  }

  deleteDetalleRubroTerciario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-terciario/${id}`);
  }

  getAllDetallesRubroTerciario(): Observable<DetalleRubroTerciario[]> {
    return this.http.get<DetalleRubroTerciario[]>(`${this.apiUrl}/detalles-rublo-terciario`);
  }

  // ==================== DETALLES RUBLO CUATERNARIO ====================

  getDetallesRubroCuaternario(): Observable<DetalleRubroCuaternario[]> {
    return this.http.get<DetalleRubroCuaternario[]>(`${this.apiUrl}/detalles-rublo-cuaternarios`);
  }

  createDetalleRubroCuaternario(data: Omit<DetalleRubroCuaternario, 'id'>): Observable<DetalleRubroCuaternario> {
    return this.http.post<DetalleRubroCuaternario>(`${this.apiUrl}/detalles-rublo-cuaternarios`, data);
  }

  updateDetalleRubroCuaternario(id: number, data: Partial<DetalleRubroCuaternario>): Observable<DetalleRubroCuaternario> {
    return this.http.put<DetalleRubroCuaternario>(`${this.apiUrl}/detalles-rublo-cuaternarios/${id}`, data);
  }

  deleteDetalleRubroCuaternario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-cuaternarios/${id}`);
  }

  getAllDetallesRubroCuaternario(): Observable<DetalleRubroCuaternario[]> {
    return this.http.get<DetalleRubroCuaternario[]>(`${this.apiUrl}/detalles-rublo-cuaternarios`);
  }

  // ==================== DETALLES RUBLO QUINARIO ====================

  getDetallesRubroQuinario(): Observable<DetalleRubroQuinario[]> {
    return this.http.get<DetalleRubroQuinario[]>(`${this.apiUrl}/detalles-rublo-quinarios`);
  }

  createDetalleRubroQuinario(data: Omit<DetalleRubroQuinario, 'id'>): Observable<DetalleRubroQuinario> {
    return this.http.post<DetalleRubroQuinario>(`${this.apiUrl}/detalles-rublo-quinarios`, data);
  }

  updateDetalleRubroQuinario(id: number, data: Partial<DetalleRubroQuinario>): Observable<DetalleRubroQuinario> {
    return this.http.put<DetalleRubroQuinario>(`${this.apiUrl}/detalles-rublo-quinarios/${id}`, data);
  }

  deleteDetalleRubroQuinario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-quinarios/${id}`);
  }

  // ==================== DETALLES RUBLO SENARIO ====================

  getDetallesRubroSenario(): Observable<DetalleRubroSenario[]> {
    return this.http.get<DetalleRubroSenario[]>(`${this.apiUrl}/detalles-rublo-senarios`);
  }

  createDetalleRubroSenario(data: Omit<DetalleRubroSenario, 'id'>): Observable<DetalleRubroSenario> {
    return this.http.post<DetalleRubroSenario>(`${this.apiUrl}/detalles-rublo-senarios`, data);
  }

  updateDetalleRubroSenario(id: number, data: Partial<DetalleRubroSenario>): Observable<DetalleRubroSenario> {
    return this.http.put<DetalleRubroSenario>(`${this.apiUrl}/detalles-rublo-senarios/${id}`, data);
  }

  deleteDetalleRubroSenario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles-rublo-senarios/${id}`);
  }
}
