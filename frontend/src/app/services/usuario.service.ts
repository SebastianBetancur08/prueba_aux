import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


// =================== //
// ------- TIPOS ----- //
// =================== //

export interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string | null;
}

export interface CrearUsuario {
  nombre: string;
  email?: string | null;
  contraseña: string;
}

export interface ModificarUsuario {
  nombre?: string | null;
  email?: string | null;
  contraseña?: string | null;
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
export class UsuarioService {

  private apiUrl = 'http://localhost:8000/usuario';

  constructor(private http: HttpClient) {}


  // Obtener lista de usuarios (con paginación opcional)
  obtenerUsuarios(minimo: number = 0, maximo: number = 100): Observable<UsuarioPublico[]> {
    const params = new HttpParams()
      .set('minimo', minimo)
      .set('maximo', maximo);
    return this.http.get<UsuarioPublico[]>(this.apiUrl + '/', { params });
  }


  // Buscar usuarios por IDs
  buscarUsuarios(ids: number[]): Observable<UsuarioPublico[]> {
    let params = new HttpParams();
    ids.forEach(id => params = params.append('usuarios_id', id));
    return this.http.get<UsuarioPublico[]>(this.apiUrl + '/buscar_usuarios/', { params });
  }


  // Obtener compras de un usuario por su ID
  obtenerComprasUsuario(usuarioId: number): Observable<CompraPublica[]> {
    return this.http.get<CompraPublica[]>(`${this.apiUrl}/${usuarioId}`);
  }


  // Crear un usuario
  crearUsuario(usuario: CrearUsuario): Observable<UsuarioPublico> {
    return this.http.post<UsuarioPublico>(this.apiUrl + '/', usuario);
  }


  // Modificar un usuario (solo los campos que se pasen)
  modificarUsuario(usuarioId: number, cambios: ModificarUsuario): Observable<UsuarioPublico> {
    return this.http.patch<UsuarioPublico>(`${this.apiUrl}/${usuarioId}`, cambios);
  }


  // Eliminar un usuario
  eliminarUsuario(usuarioId: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${usuarioId}`);
  }
}
