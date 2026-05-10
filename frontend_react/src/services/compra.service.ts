import axios from 'axios';
import type { UsuarioPublico } from './usuario.service';

const apiUrl = 'http://localhost:8004/compra';

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

export async function obtenerCompra(id: number): Promise<CompraPublica> {
  const res = await axios.get(`${apiUrl}/${id}`);
  return res.data;
}

export async function crearCompra(compra: CrearCompra): Promise<CompraPublica> {
  const res = await axios.post(`${apiUrl}/`, compra);
  return res.data;
}

export async function modificarCompra(id: number, cambios: ModificarCompra): Promise<CompraPublica> {
  const res = await axios.patch(`${apiUrl}/${id}`, cambios);
  return res.data;
}

export async function eliminarCompra(id: number): Promise<{ ok: boolean }> {
  const res = await axios.delete(`${apiUrl}/${id}`);
  return res.data;
}

export async function historialCompras(skip = 0, limit = 20): Promise<CompraPublica[]> {
  const res = await axios.get(`${apiUrl}/`, { params: { skip, limit } });
  return res.data;
}