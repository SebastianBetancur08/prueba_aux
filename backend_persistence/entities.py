from __future__ import annotations
from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass(kw_only=True)
class Usuario:
    id: UUID = field(default_factory=uuid4)
    nombre: str
    contraseña: str
    email: str | None = None


@dataclass(kw_only=True)
class Producto:
    id: UUID = field(default_factory=uuid4)
    nombre: str
    precio_milesimas: int          # precio * 1000
    stock: int = 0
    url_de_imagen: str | None = None


@dataclass(kw_only=True)
class Compra:
    id: UUID = field(default_factory=uuid4)
    usuario_id: UUID
    total_productos: int = 1


@dataclass(kw_only=True)
class CompraProducto:
    id: UUID = field(default_factory=uuid4)
    compra_id: UUID
    producto_id: UUID
    cantidad: int = 1
