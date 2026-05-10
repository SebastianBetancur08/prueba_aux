import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-compras-shell',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './compras-shell.html',
  styleUrl: './compras-shell.css',
})
export class ComprasShell {}
