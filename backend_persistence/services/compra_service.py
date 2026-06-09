from decimal import Decimal
from uuid import UUID

from persistence_kit.contracts.repository import Repository
from persistence_kit.contracts.view_repository import ViewRepository
from persistence_kit.api.exceptions import NotFoundException, ValidationException, DatabaseException

from backend_persistence.entities import Producto, Compra, CompraProducto
from backend_persistence.models import (
    CrearCompra, ModificarCompra, CompraPublica, CompraProductoPublica, UsuarioPublico,
)
from backend_persistence.services.producto_service import a_decimal

INCLUDE = ["usuario", "productos"]

# info[producto_id] = (nombre, precio_decimal)
InfoProd = dict[UUID, tuple[str, Decimal]]


async def _info_productos(productos: Repository, rows: list[dict]) -> InfoProd:
    ids = {p["producto_id"] for row in rows for p in row["productos"]}
    info: InfoProd = {}
    for pid in ids:
        prod = await productos.get(pid)
        if prod:
            info[pid] = (prod.nombre, a_decimal(prod.precio_milesimas))
        else:
            info[pid] = ("(producto eliminado)", Decimal("0"))
    return info


def a_compra_publica(row: dict, info: InfoProd) -> CompraPublica:
    u = row["usuario"]
    return CompraPublica(
        id_compra=row["id"],
        total_productos=row["total_productos"],
        usuario=UsuarioPublico(id=u["id"], nombre=u["nombre"], email=u.get("email")),
        productos=[
            CompraProductoPublica(
                producto_id=p["producto_id"],
                nombre=info.get(p["producto_id"], ("?", Decimal("0")))[0],
                precio=info.get(p["producto_id"], ("?", Decimal("0")))[1],
                cantidad=p["cantidad"],
            )
            for p in row["productos"]
        ],
    )


async def _publica_una(row: dict, productos: Repository) -> CompraPublica:
    info = await _info_productos(productos, [row])
    return a_compra_publica(row, info)


async def crear(*, datos: CrearCompra,
                compras: Repository, productos: Repository,
                usuarios: Repository, join: Repository,
                vista: ViewRepository) -> CompraPublica:
    if not datos.productos:
        raise ValidationException("La compra debe tener al menos un producto")

    if not await usuarios.get(datos.usuario_id):
        raise NotFoundException(f"Usuario {datos.usuario_id} no existe")

    ids = [item.producto_id for item in datos.productos]
    if len(ids) != len(set(ids)):
        raise ValidationException("Productos repetidos en la compra")

    encontrados: dict[UUID, Producto] = {}
    for pid in ids:
        p = await productos.get(pid)
        if not p:
            raise NotFoundException("Uno o más productos no existen")
        encontrados[pid] = p

    cantidades = {item.producto_id: item.cantidad for item in datos.productos}
    for pid, p in encontrados.items():
        if p.stock < cantidades[pid]:
            raise ValidationException(
                f"Stock insuficiente para '{p.nombre}' (disponible: {p.stock})"
            )

    for pid, p in encontrados.items():
        p.stock -= cantidades[pid]
        await productos.update(p)

    compra = Compra(usuario_id=datos.usuario_id, total_productos=sum(cantidades.values()))
    await compras.add(compra)

    for item in datos.productos:
        await join.add(CompraProducto(
            compra_id=compra.id, producto_id=item.producto_id, cantidad=item.cantidad,
        ))

    row = await vista.get_with(compra.id, include=INCLUDE)
    if row is None:
        raise DatabaseException("No se pudo recuperar la compra recién creada")
    return await _publica_una(row, productos)


async def obtener(id_compra: UUID, *, productos: Repository, vista: ViewRepository) -> CompraPublica:
    row = await vista.get_with(id_compra, include=INCLUDE)
    if not row:
        raise NotFoundException(f"Compra {id_compra} no encontrada")
    return await _publica_una(row, productos)


async def historial(*, productos: Repository, vista: ViewRepository,
                    offset: int, limit: int) -> list[CompraPublica]:
    rows = await vista.list_with(include=INCLUDE, offset=offset, limit=limit)
    info = await _info_productos(productos, rows)
    return [a_compra_publica(r, info) for r in rows]


async def modificar(id_compra: UUID, *, datos: ModificarCompra,
                    compras: Repository, productos: Repository,
                    usuarios: Repository, join: Repository,
                    vista: ViewRepository) -> CompraPublica:
    cambios = datos.model_dump(exclude_unset=True)
    if not cambios:
        raise ValidationException("Ingresar al menos un cambio")

    compra = await compras.get(id_compra)
    if not compra:
        raise NotFoundException(f"Compra {id_compra} no existe")

    nuevo_usuario_id = None
    if datos.usuario_id is not None:
        if not await usuarios.get(datos.usuario_id):
            raise NotFoundException(f"Usuario {datos.usuario_id} no existe")
        nuevo_usuario_id = datos.usuario_id

    plan_stock: dict[UUID, tuple[Producto, int]] = {}
    enlaces_viejos: list[CompraProducto] = []
    total_nuevo = compra.total_productos

    if datos.productos is not None:
        nuevos_ids = [item.producto_id for item in datos.productos]
        if len(nuevos_ids) != len(set(nuevos_ids)):
            raise ValidationException("Productos repetidos en la compra")

        cant_nueva = {item.producto_id: item.cantidad for item in datos.productos}
        enlaces_viejos = list(await join.list_by_fields({"compra_id": id_compra}, limit=None))
        cant_vieja = {cp.producto_id: cp.cantidad for cp in enlaces_viejos}

        for pid in set(cant_vieja) | set(cant_nueva):
            p = await productos.get(pid)
            if p is None:
                if pid in cant_nueva:
                    raise NotFoundException("Uno o más productos no existen")
                continue
            stock_final = p.stock + cant_vieja.get(pid, 0) - cant_nueva.get(pid, 0)
            if stock_final < 0:
                raise ValidationException(
                    f"Stock insuficiente para '{p.nombre}' (disponible: {p.stock})"
                )
            plan_stock[pid] = (p, stock_final)

        total_nuevo = sum(cant_nueva.values())

    if nuevo_usuario_id is not None:
        compra.usuario_id = nuevo_usuario_id

    if datos.productos is not None:
        for p, stock_final in plan_stock.values():
            p.stock = stock_final
            await productos.update(p)
        for cp in enlaces_viejos:
            await join.delete(cp.id)
        for item in datos.productos:
            await join.add(CompraProducto(
                compra_id=id_compra, producto_id=item.producto_id, cantidad=item.cantidad,
            ))
        compra.total_productos = total_nuevo

    await compras.update(compra)
    row = await vista.get_with(id_compra, include=INCLUDE)
    if row is None:
        raise DatabaseException("No se pudo recuperar la compra modificada")
    return await _publica_una(row, productos)


async def eliminar(id_compra: UUID, *, compras: Repository, join: Repository) -> None:
    if not await compras.get(id_compra):
        raise NotFoundException(f"Compra {id_compra} no existe")
    for cp in await join.list_by_fields({"compra_id": id_compra}, limit=None):
        await join.delete(cp.id)
    await compras.delete(id_compra)
