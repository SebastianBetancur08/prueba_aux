from decimal import Decimal
from uuid import UUID

from persistence_kit.contracts.repository import Repository
from persistence_kit.api.exceptions import NotFoundException, ValidationException

from backend_persistence.entities import Producto
from backend_persistence.models import CrearProducto, ModificarProducto, ProductoPublico

ESCALA = 1000  # 3 decimales (precio * 1000)


def a_milesimas(precio: Decimal) -> int:
    return int((precio * ESCALA).to_integral_value())


def a_decimal(milesimas: int) -> Decimal:
    return Decimal(milesimas) / ESCALA


def calcular_estado(stock: int) -> str:
    if stock == 0:
        return "agotado"
    if stock < 30:
        return "bajo"
    return "disponible"


def a_publico(p: Producto) -> ProductoPublico:
    return ProductoPublico(
        id=p.id,
        nombre=p.nombre,
        precio=a_decimal(p.precio_milesimas),
        stock=p.stock,
        url_de_imagen=p.url_de_imagen,
        estado=calcular_estado(p.stock),
    )


async def crear(repo: Repository, datos: CrearProducto) -> ProductoPublico:
    if await repo.get_by_index("nombre", datos.nombre):
        raise ValidationException(f"Ya existe un producto con nombre '{datos.nombre}'")
    producto = Producto(
        nombre=datos.nombre,
        precio_milesimas=a_milesimas(datos.precio),
        stock=datos.stock or 0,
        url_de_imagen=datos.url_de_imagen,
    )
    await repo.add(producto)
    return a_publico(producto)


async def listar(repo: Repository, offset: int, limit: int) -> list[ProductoPublico]:
    return [a_publico(p) for p in await repo.list(offset=offset, limit=limit)]


async def buscar(repo: Repository, ids: list[UUID]) -> list[ProductoPublico]:
    encontrados = []
    for pid in ids:
        p = await repo.get(pid)
        if not p:
            raise NotFoundException(f"Producto {pid} no encontrado")
        encontrados.append(a_publico(p))
    return encontrados


async def modificar(repo: Repository, producto_id: UUID, datos: ModificarProducto) -> ProductoPublico:
    cambios = datos.model_dump(exclude_unset=True)
    if not cambios:
        raise ValidationException("Ingresar al menos un cambio")
    p = await repo.get(producto_id)
    if not p:
        raise NotFoundException("Producto no encontrado")
    if "nombre" in cambios:
        if await repo.get_by_index("nombre", cambios["nombre"]):
            raise ValidationException(f"Ya existe un producto con nombre '{cambios['nombre']}'")
        p.nombre = cambios["nombre"]
    if cambios.get("precio") is not None:
        p.precio_milesimas = a_milesimas(cambios["precio"])
    if cambios.get("stock") is not None:
        p.stock = cambios["stock"]
    if "url_de_imagen" in cambios:
        p.url_de_imagen = cambios["url_de_imagen"]
    await repo.update(p)
    return a_publico(p)


async def eliminar(repo: Repository, producto_id: UUID) -> None:
    if not await repo.get(producto_id):
        raise NotFoundException("Producto no encontrado")
    await repo.delete(producto_id)
