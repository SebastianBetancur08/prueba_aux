import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  buscarPorId: number | null = null;
  buscandoUsuario = false;
  usuarioBuscado: UsuarioPublico | null = null;
  mostrarConfirmacion = false;
  idAEliminar: number | null = null;

  constructor(private svc: UsuarioService, private cdr: ChangeDetectorRef) {}

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
    if (!this.buscarPorId) {
      this.error = 'Por favor ingresa un ID de usuario';
      return;
    }

    const id = Number(this.buscarPorId);
    if (isNaN(id)) {
      this.error = 'El ID debe ser un número válido';
      return;
    }

    this.buscandoUsuario = true;
    this.error = '';
    this.usuarioBuscado = null;
    this.compras = [];
    this.usuarioSeleccionado = null;

    this.svc.buscarUsuarios([id]).subscribe({
      next: (data) => {
        this.usuarioBuscado = data.length > 0 ? data[0] : null;
        if (!this.usuarioBuscado) this.error = `No se encontró usuario con ID ${id}`;
        this.buscandoUsuario = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = `Error al buscar usuario con ID ${id}`;
        this.buscandoUsuario = false;
        this.cdr.detectChanges();
      },
    });
  }

  limpiarBusqueda(): void {
    this.buscarPorId = null;
    this.usuarioBuscado = null;
    this.compras = [];
    this.usuarioSeleccionado = null;
    this.error = '';
  }

  verCompras(usuario: UsuarioPublico): void {
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar compras';
        this.cargandoCompras = false;
        this.cdr.detectChanges();
      },
    });
  }
  
  eliminar(id: number): void {
  this.idAEliminar = id;
  this.mostrarConfirmacion = true;
}

confirmarEliminar(): void {
  if (!this.idAEliminar) return;
  this.mostrarConfirmacion = false;
  this.error = '';
  this.svc.eliminarUsuario(this.idAEliminar).subscribe({
    next: () => {
      if (this.usuarioSeleccionado?.id === this.idAEliminar) {
        this.usuarioSeleccionado = null;
        this.compras = [];
      }
      this.usuarioBuscado = null;
      this.idAEliminar = null;
      this.cdr.detectChanges();
    },
    error: () => {
      this.error = 'Error al eliminar usuario';
      this.idAEliminar = null;
      this.cdr.detectChanges();
    },
  });
}

cancelarEliminar(): void {
  this.mostrarConfirmacion = false;
  this.idAEliminar = null;
}
}