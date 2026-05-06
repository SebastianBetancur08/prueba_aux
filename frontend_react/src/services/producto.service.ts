import axios from 'axios';

const apiUrl = 'http://localhost:8004/producto';

// =================== //
// ------- TIPOS ----- //
// =================== //

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

// =================== //
// ------ SERVICIO --- //
// =================== //

export async function obtenerProductos(minimo = 0, maximo = 100): Promise<Producto[]> {
  const res = await axios.get(`${apiUrl}/`, { params: { minimo, maximo } });
  return res.data;
}

export async function buscarProductos(ids: number[]): Promise<Producto[]> {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('productos_id', String(id)));
  const res = await axios.get(`${apiUrl}/buscar_productos/?${params.toString()}`);
  return res.data;
}

export async function crearProducto(p: CrearProducto): Promise<Producto> {
  const res = await axios.post(`${apiUrl}/`, p);
  return res.data;
}

export async function modificarProducto(id: number, cambios: ModificarProducto): Promise<Producto> {
  const res = await axios.patch(`${apiUrl}/${id}`, cambios);
  return res.data;
}

export async function eliminarProducto(id: number): Promise<{ ok: boolean }> {
  const res = await axios.delete(`${apiUrl}/${id}`);
  return res.data;
}