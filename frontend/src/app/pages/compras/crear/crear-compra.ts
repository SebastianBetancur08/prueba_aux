import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompraService, CrearCompra, CompraPublica } from '../../../services/compra.service';

@Component({
  selector: 'app-crear-compra',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-compra.html',
  styleUrl: './crear-compra.css',
})
export class CrearCompraComponent {

  nueva: CrearCompra = {
    usuario_id: 0,
    productos: [{ producto_id: 0, cantidad: 1 }],
  };
  error = '';
  exito = '';
  cargando = false;
  compra: CompraPublica | null = null;

  constructor(private svc: CompraService, private router: Router, private cdr: ChangeDetectorRef) {}

  agregarItem(): void {
    this.nueva.productos.push({ producto_id: 0, cantidad: 1 });
  }

  eliminarItem(index: number): void {
    if (this.nueva.productos.length > 1) {
      this.nueva.productos.splice(index, 1);
    }
  }

  crear(): void {
    if (!this.nueva.usuario_id || this.nueva.usuario_id <= 0) {
      this.error = 'Ingresa un ID de usuario válido';
      return;
    }
    if (this.nueva.productos.some(p => p.producto_id <= 0 || p.cantidad <= 0)) {
      this.error = 'Todos los productos deben tener ID y cantidad válidos';
      return;
    }

    this.error = '';
    this.exito = '';
    this.cargando = true;

    this.svc.crearCompra(this.nueva).subscribe({
      next: (data) => {
        this.compra = data;
        this.exito = 'Compra creada exitosamente';
        this.cargando = false;
        this.nueva = { usuario_id: 0, productos: [{ producto_id: 0, cantidad: 1 }] };
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al crear compra';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  irAListar(): void {
    this.router.navigate(['/compras/listar']);
  }
}