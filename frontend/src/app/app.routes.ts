import { Routes } from '@angular/router';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { ProductosComponent } from './pages/productos/productos';
import { ComprasComponent } from './pages/compras/compras';
export const routes: Routes = [
    { path: 'usuarios', component: UsuariosComponent },
    { path: 'productos', component: ProductosComponent },
    { path: 'compras', component: ComprasComponent },
    { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
];