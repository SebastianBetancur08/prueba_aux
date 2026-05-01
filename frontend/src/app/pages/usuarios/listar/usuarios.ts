import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UsuarioService, UsuarioPublico
} from '../../../services/usuario.service';

@Component({
  selector: 'app-listar-usuarios',
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class ListarUsuariosComponent implements OnInit {

  usuarios: UsuarioPublico[] = [];
  error = '';

  constructor(private svc: UsuarioService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.obtenerUsuarios().subscribe({
      next: data => this.usuarios = data,
      error: () => this.error = 'Error al cargar usuarios',
    });
  }

  eliminar(id: number): void {
    this.svc.eliminarUsuario(id).subscribe({
      next: () => this.cargar(),
      error: () => this.error = 'Error al eliminar usuario',
    });
  }
}
