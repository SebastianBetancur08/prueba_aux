import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    CompraService, CrearCompra, CompraPublica
} from '../../../services/compra.service';

@Component({
  selector: 'app-crear-compra',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-compra.html',
  styleUrl: './crear-compra.css',
})
export class CrearCompraComponent {

  nueva: CrearCompra = {
    usuario_id: 0,
    productos: [{producto_id: 0, cantidad: 1}]
  };
  error = '';
  exito = '';
  compra: CompraPublica | null = null;

  constructor(private svc: CompraService) {}

  agregarItem(): void {
    this.nueva.productos.push({producto_id: 0, cantidad: 1});
  }

  crear(): void {
    this.error = '';
    this.exito = '';
    this.svc.crearCompra(this.nueva).subscribe({
      next: data => {
        this.compra = data;
        this.exito = 'Compra creada exitosamente';
        this.nueva = {
          usuario_id: 0,
          productos: [{producto_id: 0, cantidad: 1}]
        };
      },
      error: () => this.error = 'Error al crear compra',
    });
  }
}
