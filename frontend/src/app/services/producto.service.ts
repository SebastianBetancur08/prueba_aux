import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


// =================== //
// ------- TIPOS ----- //
// =================== //

export interface Producto{
  id: number;
  nombre: string;
  precio: number;
  url_de_imagen: string | null;
}

export interface CrearProucto{
  id: number;
  nombre: string;
  precio: number;
  url_de_imagen?: string | null;
}

export interface ModificarProducto{
  nombre?: number | null;
  precio?: string | null;
  url_de_imagen?: string | null;

// =================== //
// ------ SERVICIO --- //
// =================== //

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  
  private apiUrl = 'http://localhost:8000/usuario';
  
  obtenerProductos(minimo: number = 0, maximo: number = 100): Observable<Producto[]> {
    const params = new HttpParams()
      .set('minimo', minimo)
      .set('maximo', maximo);
    return this.http.get<Producto[]>(this.apiUrl + '/', { params });
  }
  
  buscarProductos(ids: number[]): observable<Producto[]> {
    let params = new HttpParams();
    ids.forEach(id => params = params.append('producto.id', id));
    return this.http.get<Producto[]>(this.apiUrl + '/buscar_productos', {params});
  }
  
  crearProducto(p: CrearProducto): observable<Producto> {
    return this.http.post<Producto>(this.apiUrl + '/', p)
  }
  
  modificarProducto(id: number, cambios: ModificarProducto): observable<producto> {
    return this.http.patch<Producto>('${this.apiUral}/${id}', cambios);
  }
  eliminarProducto(id: number): observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }('${this.apiUrl}/${id}');
  }
}
