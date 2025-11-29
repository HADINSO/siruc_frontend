import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dependencia {
  id: number;
  centro_costo_id: number;
  nombre: string;
  descripcion: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CentroCosto {
  id: number;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
  dependencias?: Dependencia[];
}

export interface CreateCentroDto {
  nombre: string;
}

export interface CreateDependenciaDto {
  centro_costo_id: number;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root',
})
export class CentrosCostoService {
  private apiUrlCentros = '/api/centros-costo';
  private apiUrlDependencias = '/api/dependencias';

  constructor(private http: HttpClient) {}

  // ========================================
  // CENTROS DE COSTO
  // ========================================
  
  getAllCentros(): Observable<CentroCosto[]> {
    return this.http.get<CentroCosto[]>(this.apiUrlCentros);
  }

  getCentroById(id: number): Observable<CentroCosto> {
    return this.http.get<CentroCosto>(`${this.apiUrlCentros}/${id}`);
  }

  createCentro(data: CreateCentroDto): Observable<CentroCosto> {
    return this.http.post<CentroCosto>(this.apiUrlCentros, data);
  }

  updateCentro(id: number, data: CreateCentroDto): Observable<CentroCosto> {
    return this.http.put<CentroCosto>(`${this.apiUrlCentros}/${id}`, data);
  }

  deleteCentro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlCentros}/${id}`);
  }

  // ========================================
  // DEPENDENCIAS
  // ========================================
  
  getAllDependencias(): Observable<Dependencia[]> {
    return this.http.get<Dependencia[]>(this.apiUrlDependencias);
  }

  getDependenciasByCentro(centroCostoId: number): Observable<Dependencia[]> {
    return this.http.get<Dependencia[]>(`${this.apiUrlDependencias}/centro/${centroCostoId}`);
  }

  createDependencia(data: CreateDependenciaDto): Observable<Dependencia> {
    console.log('🔍 Service - Creando dependencia en:', this.apiUrlDependencias);
    console.log('📦 Service - Data:', data);
    return this.http.post<Dependencia>(this.apiUrlDependencias, data);
  }

  updateDependencia(id: number, data: Partial<CreateDependenciaDto>): Observable<Dependencia> {
    return this.http.put<Dependencia>(`${this.apiUrlDependencias}/${id}`, data);
  }

  deleteDependencia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlDependencias}/${id}`);
  }
}
