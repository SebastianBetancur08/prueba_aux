import axios from 'axios';

const apiUrl = 'http://localhost:8004/usuario';

// =================== //
// ------- TIPOS ----- //
// =================== //

export interface UsuarioPublico {
  id: string;                       // UUID
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
  producto_id: string;              // UUID
  cantidad: number;
}

export interface CompraPublica {
  id_compra: string;                // UUID
  usuario: UsuarioPublico;
  total_productos: number;
  productos: CompraProductoPublica[];
}

// =================== //
// ------ SERVICIO --- //
// =================== //

export async function obtenerUsuarios(offset = 0, limit = 100): Promise<UsuarioPublico[]> {
  const res = await axios.get(`${apiUrl}/`, { params: { offset, limit } });
  return res.data;
}

export async function buscarUsuarios(ids: string[]): Promise<UsuarioPublico[]> {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('usuarios_id', id));
  const res = await axios.get(`${apiUrl}/buscar_usuarios/?${params.toString()}`);
  return res.data;
}

export async function obtenerComprasUsuario(usuarioId: string): Promise<CompraPublica[]> {
  const res = await axios.get(`${apiUrl}/${usuarioId}`);
  return res.data;
}

export async function crearUsuario(usuario: CrearUsuario): Promise<UsuarioPublico> {
  const body = {
    nombre: usuario.nombre,
    email: usuario.email,
    contraseña: usuario.contrasena,
  };
  const res = await axios.post(`${apiUrl}/`, body);
  return res.data;
}

export async function modificarUsuario(usuarioId: string, cambios: ModificarUsuario): Promise<UsuarioPublico> {
  const body: Record<string, unknown> = {};
  if (cambios.nombre) body.nombre = cambios.nombre;
  if (cambios.email) body.email = cambios.email;
  if (cambios.contrasena) body.contraseña = cambios.contrasena;
  const res = await axios.patch(`${apiUrl}/${usuarioId}`, body);
  return res.data;
}

export async function eliminarUsuario(usuarioId: string): Promise<{ ok: boolean }> {
  const res = await axios.delete(`${apiUrl}/${usuarioId}`);
  return res.data;
}
