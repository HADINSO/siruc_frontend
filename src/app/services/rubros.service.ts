import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Periodo {
  id: number;
  nombre?: string;
  anio: number;
  activo?: boolean;
}

export interface RubroPrincipal {
  id?: number;
  nombre: string;
  cuenta: string;
  periodo_fiscal_id: number;
  codigo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RubroSecundario {
  id?: number;
  nombre: string;
  cuenta: string;
  rublo_principal_id: number;
  periodo_fiscal_id: number;
  codigo?: string;
  createdAt?: string;
  updatedAt?: string;
  rublos_principale?: any;
  rublos_terciarios?: any[];
}

export interface RubroTerciario {
  id?: number;
  nombre: string;
  cuenta: string;
  rublo_secundario_id: number;
  periodo_fiscal_id: number;
  codigo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DetallePrincipal {
  id?: number;
  descripcion: string;
  valor: number;
  rubro_principal_id: number;
}

export interface DetalleSecundario {
  id?: number;
  descripcion: string;
  valor: number;
  rubro_secundario_id: number;
}

export interface DetalleTerciario {
  id?: number;
  descripcion: string;
  valor: number;
  rubro_terciario_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class RubrosService {
  private apiUrlPeriodos = '/api/periodos-fiscales';
  private apiUrlPrincipales = '/api/rublos-principales';
  private apiUrlSecundarios = '/api/rublos-secundarios';
  private apiUrlTerciarios = '/api/rublos-terciarios';
  private apiUrlDetalles = '/api/detalles-rubros';

  constructor(private http: HttpClient) {}

  getPeriodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(this.apiUrlPeriodos);
  }

  getAllRubrosPrincipales(): Observable<RubroPrincipal[]> {
    return this.http.get<RubroPrincipal[]>(this.apiUrlPrincipales);
  }

  getRubrosPrincipalesByPeriodo(periodoId: number): Observable<RubroPrincipal[]> {
    return this.http.get<RubroPrincipal[]>(this.apiUrlPrincipales);
  }

  createRubroPrincipal(data: any): Observable<RubroPrincipal> {
    return this.http.post<RubroPrincipal>(this.apiUrlPrincipales, data);
  }

  updateRubroPrincipal(id: number, data: Partial<RubroPrincipal>): Observable<RubroPrincipal> {
    return this.http.put<RubroPrincipal>(`${this.apiUrlPrincipales}/${id}`, data);
  }

  deleteRubroPrincipal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlPrincipales}/${id}`);
  }

  getRubrosSecundariosByPrincipal(principalId: number): Observable<RubroSecundario[]> {
    return this.http.get<RubroSecundario[]>(this.apiUrlSecundarios);
  }

  createRubroSecundario(data: any): Observable<RubroSecundario> {
    return this.http.post<RubroSecundario>(this.apiUrlSecundarios, data);
  }

  updateRubroSecundario(id: number, data: Partial<RubroSecundario>): Observable<RubroSecundario> {
    return this.http.put<RubroSecundario>(`${this.apiUrlSecundarios}/${id}`, data);
  }

  deleteRubroSecundario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlSecundarios}/${id}`);
  }

  getRubrosTerciariosBySecundario(secundarioId: number): Observable<RubroTerciario[]> {
    return this.http.get<RubroTerciario[]>(this.apiUrlTerciarios);
  }

  createRubroTerciario(data: any): Observable<RubroTerciario> {
    return this.http.post<RubroTerciario>(this.apiUrlTerciarios, data);
  }

  updateRubroTerciario(id: number, data: Partial<RubroTerciario>): Observable<RubroTerciario> {
    return this.http.put<RubroTerciario>(`${this.apiUrlTerciarios}/${id}`, data);
  }

  deleteRubroTerciario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlTerciarios}/${id}`);
  }

  createDetallePrincipal(data: DetallePrincipal): Observable<DetallePrincipal> {
    return this.http.post<DetallePrincipal>(`${this.apiUrlDetalles}/principal`, data);
  }

  createDetalleSecundario(data: DetalleSecundario): Observable<DetalleSecundario> {
    return this.http.post<DetalleSecundario>(`${this.apiUrlDetalles}/secundario`, data);
  }

  createDetalleTerciario(data: DetalleTerciario): Observable<DetalleTerciario> {
    return this.http.post<DetalleTerciario>(`${this.apiUrlDetalles}/terciario`, data);
  }
}
