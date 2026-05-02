import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-productos-shell',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './productos-shell.html',
  styleUrl: './productos-shell.css',
})
export class ProductosShell {}
