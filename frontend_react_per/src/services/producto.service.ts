import axios from 'axios';

const apiUrl = 'http://localhost:8004/producto';

// =================== //
// ------- TIPOS ----- //
// =================== //

export interface Producto {
  id: string;                       // UUID
  nombre: string;
  precio: number;                   // llega como string "10000.250"; usar Number(precio) para operar
  stock?: number;
  url_de_imagen: string | null;
  estado?: string;                  // "disponible" | "bajo" | "agotado"
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

// =================== //
// ------ SERVICIO --- //
// =================== //

export async function obtenerProductos(offset = 0, limit = 100): Promise<Producto[]> {
  const res = await axios.get(`${apiUrl}/`, { params: { offset, limit } });
  return res.data;
}

export async function buscarProductos(ids: string[]): Promise<Producto[]> {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('productos_id', id));
  const res = await axios.get(`${apiUrl}/buscar_productos/?${params.toString()}`);
  return res.data;
}

export async function crearProducto(p: CrearProducto): Promise<Producto> {
  const res = await axios.post(`${apiUrl}/`, p);
  return res.data;
}

export async function modificarProducto(id: string, cambios: ModificarProducto): Promise<Producto> {
  const res = await axios.patch(`${apiUrl}/${id}`, cambios);
  return res.data;
}

export async function eliminarProducto(id: string): Promise<{ ok: boolean }> {
  const res = await axios.delete(`${apiUrl}/${id}`);
  return res.data;
}
