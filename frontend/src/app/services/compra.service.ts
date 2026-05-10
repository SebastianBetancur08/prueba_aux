import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioPublico } from './usuario.service';

// =================== //
// ------- TIPOS ----- //
// =================== //

export interface CompraItem {
  producto_id: number;
  cantidad: number;
}

export interface CrearCompra {
  usuario_id: number;
  productos: CompraItem[];
}

export interface ModificarCompra {
  usuario_id?: number | null;
  productos?: CompraItem[] | null;
}

export interface CompraProductoPublica {
  producto_id: number;
  cantidad: number;
}

export interface CompraPublica {
  id_compra: number;
  usuario: UsuarioPublico;
  total_productos: number;
  productos: CompraProductoPublica[];
}

// =================== //
// ------ SERVICIO --- //
// =================== //

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  
  private apiUrl = 'http://localhost:8004/compra';
  
  constructor(private http: HttpClient) {}
  
  obtenerCompra(id: number): Observable<CompraPublica> {
    return this.http.get<CompraPublica>(`${this.apiUrl}/${id}`);
  }

  crearCompra(compra: CrearCompra): Observable<CompraPublica> {
    return this.http.post<CompraPublica>(this.apiUrl + '/', compra)
  }

  modificarCompra(id: number, cambios: ModificarCompra): Observable<CompraPublica> {
    return this.http.patch<CompraPublica>(`${this.apiUrl}/${id}`, cambios)
  }

  eliminarCompra(id: number): Observable<{ ok: boolean}> {
    return this.http.delete<{ ok : boolean}>(`${this.apiUrl}/${id}`);
  }
}