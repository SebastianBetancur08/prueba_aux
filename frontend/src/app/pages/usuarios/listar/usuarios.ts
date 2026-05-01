import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  UsuarioService,
  UsuarioPublico,
  CompraPublica,
} from '../../../services/usuario.service';

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class ListarUsuariosComponent implements OnInit {

  usuarios: UsuarioPublico[] = [];
  compras: CompraPublica[] = [];
  usuarioSeleccionado: UsuarioPublico | null = null;
  cargandoCompras = false;
  error = '';
  buscarPorId = '';
  buscandoUsuario = false;
  usuarioBuscado: UsuarioPublico | null = null;

  constructor(private svc: UsuarioService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.error = '';
    this.svc.obtenerUsuarios().subscribe({
      next: (data) => (this.usuarios = data),
      error: () => (this.error = 'Error al cargar usuarios'),
    });
  }

  buscarPorIdUsuario(): void {
    if (!this.buscarPorId.trim()) {
      this.error = 'Por favor ingresa un ID de usuario';
      return;
    }

    this.buscandoUsuario = true;
    this.error = '';
    this.usuarioBuscado = null;
    this.compras = [];
    this.usuarioSeleccionado = null;

    const id = parseInt(this.buscarPorId, 10);
    
    this.svc.buscarUsuarios([id]).subscribe({
      next: (data) => {
        this.buscandoUsuario = false;
        if (data && data.length > 0) {
          this.usuarioBuscado = data[0];
        } else {
          this.error = `No se encontró usuario con ID ${id}`;
        }
      },
      error: () => {
        this.buscandoUsuario = false;
        this.error = `Error al buscar usuario con ID ${id}`;
      },
    });
  }

  limpiarBusqueda(): void {
    this.buscarPorId = '';
    this.usuarioBuscado = null;
    this.compras = [];
    this.usuarioSeleccionado = null;
    this.error = '';
  }

  verCompras(usuario: UsuarioPublico): void {
    // Toggle: si ya está abierto, cierra
    if (this.usuarioSeleccionado?.id === usuario.id) {
      this.usuarioSeleccionado = null;
      this.compras = [];
      return;
    }

    this.usuarioSeleccionado = usuario;
    this.cargandoCompras = true;
    this.compras = [];
    this.error = '';

    this.svc.obtenerComprasUsuario(usuario.id).subscribe({
      next: (data) => {
        this.compras = data;
        this.cargandoCompras = false;
      },
      error: () => {
        this.error = 'Error al cargar compras';
        this.cargandoCompras = false;
      },
    });
  }

  eliminar(id: number): void {
    this.error = '';
    this.svc.eliminarUsuario(id).subscribe({
      next: () => {
        // Si tenía las compras abiertas, las cierra
        if (this.usuarioSeleccionado?.id === id) {
          this.usuarioSeleccionado = null;
          this.compras = [];
        }
        this.cargar();
      },
      error: () => (this.error = 'Error al eliminar usuario'),
    });
  }
}