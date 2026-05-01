import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ListarUsuariosComponent } from './pages/usuarios/listar/usuarios';
import { CrearUsuarioComponent } from './pages/usuarios/crear/crear-usuario';
import { EditarUsuarioComponent } from './pages/usuarios/editar/editar-usuario';
import { ListarProductosComponent } from './pages/productos/listar/productos';
import { CrearProductoComponent } from './pages/productos/crear/crear-producto';
import { EditarProductoComponent } from './pages/productos/editar/editar-producto';
import { ListarComprasComponent } from './pages/compras/listar/compras';
import { CrearCompraComponent } from './pages/compras/crear/crear-compra';
import { EditarCompraComponent } from './pages/compras/editar/editar-compra';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'usuarios',
    children: [
      { path: '', component: ListarUsuariosComponent },
      { path: 'listar', component: ListarUsuariosComponent },
      { path: 'crear', component: CrearUsuarioComponent },
      { path: 'editar/:id', component: EditarUsuarioComponent },
    ],
  },
  {
    path: 'productos',
    children: [
      { path: '', component: ListarProductosComponent },
      { path: 'listar', component: ListarProductosComponent },
      { path: 'crear', component: CrearProductoComponent },
      { path: 'editar/:id', component: EditarProductoComponent },
    ],
  },
  {
    path: 'compras',
    children: [
      { path: '', component: ListarComprasComponent },
      { path: 'listar', component: ListarComprasComponent },
      { path: 'crear', component: CrearCompraComponent },
      { path: 'editar/:id', component: EditarCompraComponent },
    ],
  },
];