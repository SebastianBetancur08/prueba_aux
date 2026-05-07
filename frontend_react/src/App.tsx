import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UsuariosLayout from './usuarios/UsuariosLayout';
import Usuarios from './usuarios/listar/Usuario';
import CrearUsuario from './usuarios/crear/CrearUsuario';
import EditarUsuario from './usuarios/editar/EditarUsuario';
import Home from './home/Home';

export default function App() {
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
      </Routes>
    </BrowserRouter>
  );
}