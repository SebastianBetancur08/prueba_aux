import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UsuariosLayout from './usuarios/UsuariosLayout';
import Usuarios from './usuarios/listar/Usuario';
import CrearUsuario from './usuarios/crear/CrearUsuario';
import EditarUsuario from './usuarios/editar/EditarUsuario';
import ProductosLayout from './productos/ProductosLayout';
import Productos from './productos/listar/Producto';
import CrearProducto from './productos/crear/CrearProducto';
import EditarProducto from './productos/editar/EditarProducto';
import ComprasLayout from './compras/ComprasLayout';
import Compras from './compras/listar/Compra';
import CrearCompra from './compras/crear/CrearCompra';
import EditarCompra from './compras/editar/EditarCompra';
import Home from './home/Home';

// export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usuarios" element={<UsuariosLayout />}>
          <Route index element={<Usuarios />} />
          <Route path="listar" element={<Usuarios />} />
          <Route path="crear" element={<CrearUsuario />} />
          <Route path="editar/:id" element={<EditarUsuario />} />
        </Route>
        <Route path="/productos" element={<ProductosLayout />}>
          <Route index element={<Productos />} />
          <Route path="listar" element={<Productos />} />
          <Route path="crear" element={<CrearProducto />} />
          <Route path="editar/:id" element={<EditarProducto />} />
        </Route>
        <Route path="/compras" element={<ComprasLayout />}>
          <Route index element={<Compras />} />
          <Route path="listar" element={<Compras />} />
          <Route path="crear" element={<CrearCompra />} />
          <Route path="editar/:id" element={<EditarCompra />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}