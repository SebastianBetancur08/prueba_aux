import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    CompraService, CompraPublica
} from '../../../services/compra.service';

@Component({
  selector: 'app-listar-compras',
  imports: [FormsModule, CommonModule],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class ListarComprasComponent {

  compra: CompraPublica | null = null;
  error = '';
  buscarId = 0;

  constructor(private svc: CompraService) {}

  buscar(): void {
    this.svc.obtenerCompra(this.buscarId).subscribe({
      next: data => { this.compra = data; this.error = ''; },
      error: () => this.error = 'Compra no encontrada',
    });
  }

  eliminar(): void {
    if (!this.compra) return;
    this.svc.eliminarCompra(this.compra.id_compra).subscribe({
      next: () => { this.compra = null; this.error = ''; },
      error: () => this.error = 'Error al eliminar',
    });
  }
}
