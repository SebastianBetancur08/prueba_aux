import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  url_de_imagen: string | null;
}

export interface CrearProducto {
  nombre: string;
  precio: number;
  url_de_imagen?: string | null;
}

export interface ModificarProducto {
  nombre?: string | null;
  precio?: number | null;
  url_de_imagen?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductoService {

  private apiUrl = 'http://localhost:8000/producto';

  constructor(private http: HttpClient) {}

  obtenerProductos(minimo: number = 0, maximo: number = 100): Observable<Producto[]> {
    const params = new HttpParams()
      .set('minimo', minimo)
      .set('maximo', maximo);
    return this.http.get<Producto[]>(this.apiUrl + '/', { params });
  }

  buscarProductos(ids: number[]): Observable<Producto[]> {
    let params = new HttpParams();
    ids.forEach(id => params = params.append('productos_id', String(id)));
    return this.http.get<Producto[]>(this.apiUrl + '/buscar_productos/', { params });
  }

  crearProducto(p: CrearProducto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl + '/', p);
  }

  modificarProducto(id: number, cambios: ModificarProducto): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}`, cambios);
  }

  eliminarProducto(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${id}`);
  }
}