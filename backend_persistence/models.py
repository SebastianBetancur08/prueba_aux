from __future__ import annotations
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


# --------- USUARIO ---------
class UsuarioPublico(BaseModel):
    id: UUID
    nombre: str
    email: str | None = None


class CrearUsuario(BaseModel):
    nombre: str
    email: str | None = None
    contraseña: str


class ModificarUsuario(BaseModel):
    id: UUID | None = None
    nombre: str | None = None
    email: str | None = None
    contraseña: str | None = None


# --------- TABLA INTERMEDIA ---------
class CompraProductoPublica(BaseModel):
    producto_id: UUID
    cantidad: int


# --------- PRODUCTO ---------
class ProductoPublico(BaseModel):
    id: UUID
    nombre: str
    precio: Decimal
    stock: int
    url_de_imagen: str | None = None
    estado: str


class CrearProducto(BaseModel):
    nombre: str
    precio: Decimal
    stock: int | None = None
    url_de_imagen: str | None = None


class ModificarProducto(BaseModel):
    nombre: str | None = None
    precio: Decimal | None = None
    stock: int | None = None
    url_de_imagen: str | None = None


# --------- COMPRA ---------
class CompraPublica(BaseModel):
    id_compra: UUID
    usuario: UsuarioPublico
    total_productos: int
    productos: list[CompraProductoPublica]


class CompraItem(BaseModel):
    producto_id: UUID
    cantidad: int = 1


class CrearCompra(BaseModel):
    usuario_id: UUID
    productos: list[CompraItem]


class ModificarCompra(BaseModel):
    usuario_id: UUID | None = None
    productos: list[CompraItem] | None = None
