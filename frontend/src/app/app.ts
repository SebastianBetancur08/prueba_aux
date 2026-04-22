import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsuarioService } from './services/usuario.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  protected readonly title = signal('frontend');

  usuarios:any[] = []

  constructor( private usuarioService: UsuarioService){}

  ngOnInit(){
    this.usuarioService.obtenerUsuarios().subscribe(data=>{
      this.usuarios =data;
    });
  }
  
}
