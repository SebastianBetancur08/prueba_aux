import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsuarioService } from './services/usuario.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class AppComponent implements OnInit {
  protected readonly title = signal('frontend');

  usuarios = signal<any[]>([]);
  nuevoNombre = "";
  nuevoEmail = "";
  nuevoPassword = "";

  constructor( private usuarioService: UsuarioService){}

  ngOnInit(){
    this.usuarioService.obtenerUsuarios().subscribe(data=>{
      this.usuarios.set(data);
      console.log('usuarios', data);
    });
  }

  cargarUsuarios() {
  this.usuarioService.obtenerUsuarios().subscribe(data => {
    this.usuarios.set(data);
  });
}
  
  crearUsuario() {
  const usuario = {
    nombre: this.nuevoNombre,
    email: this.nuevoEmail,
    contraseña: this.nuevoPassword
  };

  this.usuarioService.crearUsuario(usuario).subscribe(() => {
    this.cargarUsuarios();
    this.nuevoNombre = "";
    this.nuevoEmail = "";
    this.nuevoPassword = "";
  });
}

}
