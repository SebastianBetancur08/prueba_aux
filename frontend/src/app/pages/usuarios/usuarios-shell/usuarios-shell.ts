import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-usuarios-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './usuarios-shell.html',
  styleUrl: './usuarios-shell.css',
})
export class UsuariosShell {}
