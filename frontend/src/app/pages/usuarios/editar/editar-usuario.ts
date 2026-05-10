import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UsuarioService,
  UsuarioPublico,
  ModificarUsuario,
} from '../../../services/usuario.service';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
})
export class EditarUsuarioComponent implements OnInit {

  usuario: UsuarioPublico | null = null;
  cambios: ModificarUsuario = {};
  error = '';
  exito = '';
  cargando = false;
  usuarioId: number = 0;

  constructor(
    private svc: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.usuarioId = +params['id'];
      this.cargarUsuario();
    });
  }

  cargarUsuario(): void {
    this.error = '';
    this.svc.buscarUsuarios([this.usuarioId]).subscribe({
      next: (usuarios) => {
        if (usuarios.length === 0) {
          this.error = 'Usuario no encontrado';
          this.cdr.detectChanges();
          return;
        }
        this.usuario = usuarios[0];
        this.cambios = {
          nombre: this.usuario.nombre,
          email: this.usuario.email,
          contrasena: '',
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar el usuario';
        this.cdr.detectChanges();
      },
    });
  }

  guardarEdicion(): void {
    if (!this.usuario) return;

    const hayAlgo = Object.values(this.cambios).some(
      (v) => v !== null && v !== undefined && v !== ''
    );
    if (!hayAlgo) {
      this.error = 'Ingresa al menos un campo para modificar';
      return;
    }

    this.error = '';
    this.exito = '';
    this.cargando = true;

    this.svc.modificarUsuario(this.usuario.id, this.cambios).subscribe({
      next: (usuarioActualizado) => {
        this.exito = 'Usuario modificado exitosamente';
        this.usuario = usuarioActualizado;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al modificar usuario';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  irAListar(): void {
    this.router.navigate(['/usuarios/listar']);
  }
}