import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ListarUsuariosComponent } from './pages/usuarios/listar/usuarios';
import { CrearUsuarioComponent } from './pages/usuarios/crear/crear-usuario';
import { EditarUsuarioComponent } from './pages/usuarios/editar/editar-usuario';
import { UsuariosShell } from './pages/usuarios/usuarios-shell/usuarios-shell';
import { ListarProductosComponent } from './pages/productos/listar/productos';
import { CrearProductoComponent } from './pages/productos/crear/crear-producto';
import { EditarProductoComponent } from './pages/productos/editar/editar-producto';
import { ProductosShell } from './pages/productos/productos-shell/productos-shell';
import { ListarComprasComponent } from './pages/compras/listar/compras';
import { CrearCompraComponent } from './pages/compras/crear/crear-compra';
import { EditarCompraComponent } from './pages/compras/editar/editar-compra';
import { ComprasShell } from './pages/compras/compras-shell/compras-shell';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'usuarios',
    component: UsuariosShell,
    children: [
      { path: '', component: ListarUsuariosComponent },
      { path: 'listar', component: ListarUsuariosComponent },
      { path: 'crear', component: CrearUsuarioComponent },
      { path: 'editar/:id', component: EditarUsuarioComponent },
    ],
  },
  {
    path: 'productos',
    component: ProductosShell,
    children: [
      { path: '', component: ListarProductosComponent },
      { path: 'listar', component: ListarProductosComponent },
      { path: 'crear', component: CrearProductoComponent },
      { path: 'editar/:id', component: EditarProductoComponent },
    ],
  },
  {
    path: 'compras',
    component: ComprasShell,
    children: [
      { path: '', component: ListarComprasComponent },
      { path: 'listar', component: ListarComprasComponent },
      { path: 'crear', component: CrearCompraComponent },
      { path: 'editar/:id', component: EditarCompraComponent },
    ],
  },
];