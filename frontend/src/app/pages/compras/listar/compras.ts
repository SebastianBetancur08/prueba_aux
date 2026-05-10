import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompraService, CompraPublica } from '../../../services/compra.service';

@Component({
  selector: 'app-listar-compras',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class ListarComprasComponent {

  buscarPorId: number | null = null;
  compraBuscada: CompraPublica | null = null;
  buscandoCompra = false;
  mostrarConfirmacion = false;
  idAEliminar: number | null = null;
  error = '';

  constructor(private svc: CompraService, private cdr: ChangeDetectorRef) {}

  buscarPorIdCompra(): void {
    if (!this.buscarPorId) {
      this.error = 'Por favor ingresa un ID de compra';
      return;
    }

    const id = Number(this.buscarPorId);
    if (isNaN(id)) {
      this.error = 'El ID debe ser un número válido';
      return;
    }

    this.buscandoCompra = true;
    this.error = '';
    this.compraBuscada = null;

    this.svc.obtenerCompra(id).subscribe({
      next: (data) => {
        this.compraBuscada = data;
        this.buscandoCompra = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = `No se encontró compra con ID ${id}`;
        this.buscandoCompra = false;
        this.cdr.detectChanges();
      },
    });
  }

  limpiarBusqueda(): void {
    this.buscarPorId = null;
    this.compraBuscada = null;
    this.error = '';
  }

  eliminar(id: number): void {
    this.idAEliminar = id;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminar(): void {
    if (!this.idAEliminar) return;
    this.mostrarConfirmacion = false;
    this.error = '';
    this.svc.eliminarCompra(this.idAEliminar).subscribe({
      next: () => {
        this.compraBuscada = null;
        this.idAEliminar = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al eliminar compra';
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