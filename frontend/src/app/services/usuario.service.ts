import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string | null;
}

export interface CrearUsuario {
  nombre: string;
  email?: string | null;
  contrasena: string;
}

export interface ModificarUsuario {
  nombre?: string | null;
  email?: string | null;
  contrasena?: string | null;
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

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private apiUrl = 'http://localhost:8004/usuario';

  constructor(private http: HttpClient) {}

  obtenerUsuarios(minimo: number = 0, maximo: number = 100): Observable<UsuarioPublico[]> {
    const params = new HttpParams()
      .set('minimo', minimo)
      .set('maximo', maximo);
    return this.http.get<UsuarioPublico[]>(this.apiUrl + '/', { params });
  }

  buscarUsuarios(ids: number[]): Observable<UsuarioPublico[]> {
    let params = new HttpParams();
    ids.forEach(id => params = params.append('usuarios_id', String(id)));
    return this.http.get<UsuarioPublico[]>(this.apiUrl + '/buscar_usuarios/', { params });
  }

  obtenerComprasUsuario(usuarioId: number): Observable<CompraPublica[]> {
    return this.http.get<CompraPublica[]>(`${this.apiUrl}/${usuarioId}`);
  }

  crearUsuario(usuario: CrearUsuario): Observable<UsuarioPublico> {
    const body = {
      nombre: usuario.nombre,
      email: usuario.email,
      contraseña: usuario.contrasena,
    };
    return this.http.post<UsuarioPublico>(this.apiUrl + '/', body);
  }

  modificarUsuario(usuarioId: number, cambios: ModificarUsuario): Observable<UsuarioPublico> {
    const body: any = {};
    if (cambios.nombre !== null && cambios.nombre !== undefined && cambios.nombre !== '') 
      body.nombre = cambios.nombre;
    if (cambios.email !== null && cambios.email !== undefined && cambios.email !== '') 
      body.email = cambios.email;
    if (cambios.contrasena !== null && cambios.contrasena !== undefined && cambios.contrasena !== '') 
      body.contraseña = cambios.contrasena;
    return this.http.patch<UsuarioPublico>(`${this.apiUrl}/${usuarioId}`, body);
  }

  eliminarUsuario(usuarioId: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${usuarioId}`);
  }
}