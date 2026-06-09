import axios from 'axios';
import type { UsuarioPublico } from './usuario.service';

const apiUrl = 'http://localhost:8004/compra';

// =================== //
// ------- TIPOS ----- //
// =================== //

export interface CompraItem {
  producto_id: string;              // UUID
  cantidad: number;
}

export interface CrearCompra {
  usuario_id: string;               // UUID
  productos: CompraItem[];
}

export interface ModificarCompra {
  usuario_id?: string | null;
  productos?: CompraItem[] | null;
}

export interface CompraProductoPublica {
  producto_id: string;              // UUID
  nombre: string;                   // nombre del producto (enriquecido por el backend)
  precio: number;                   // precio unitario; llega como string, usar Number(precio)
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

export async function obtenerCompra(id: string): Promise<CompraPublica> {
  const res = await axios.get(`${apiUrl}/${id}`);
  return res.data;
}

export async function crearCompra(compra: CrearCompra): Promise<CompraPublica> {
  const res = await axios.post(`${apiUrl}/`, compra);
  return res.data;
}

export async function modificarCompra(id: string, cambios: ModificarCompra): Promise<CompraPublica> {
  const res = await axios.patch(`${apiUrl}/${id}`, cambios);
  return res.data;
}

export async function eliminarCompra(id: string): Promise<{ ok: boolean }> {
  const res = await axios.delete(`${apiUrl}/${id}`);
  return res.data;
}

export async function historialCompras(offset = 0, limit = 20): Promise<CompraPublica[]> {
  const res = await axios.get(`${apiUrl}/`, { params: { offset, limit } });
  return res.data;
}
