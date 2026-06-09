from uuid import UUID

from persistence_kit.contracts.repository import Repository
from persistence_kit.contracts.view_repository import ViewRepository
from persistence_kit.api.exceptions import NotFoundException, ValidationException

from backend_persistence.entities import Usuario
from backend_persistence.models import CrearUsuario, ModificarUsuario, UsuarioPublico, CompraPublica
from backend_persistence.services.compra_service import a_compra_publica, _info_productos


def a_publico(u: Usuario) -> UsuarioPublico:
    return UsuarioPublico(id=u.id, nombre=u.nombre, email=u.email)


async def crear(repo: Repository, datos: CrearUsuario) -> UsuarioPublico:
    usuario = Usuario(nombre=datos.nombre, contraseña=datos.contraseña, email=datos.email)
    await repo.add(usuario)
    return a_publico(usuario)


async def listar(repo: Repository, offset: int, limit: int) -> list[UsuarioPublico]:
    return [a_publico(u) for u in await repo.list(offset=offset, limit=limit)]


async def buscar(repo: Repository, ids: list[UUID]) -> list[UsuarioPublico]:
    out = []
    for uid in ids:
        u = await repo.get(uid)
        if not u:
            raise NotFoundException(f"Usuario {uid} no encontrado")
        out.append(a_publico(u))
    return out


async def listar_compras(usuario_id: UUID, *, usuarios: Repository,
                         productos: Repository,
                         vista_compra: ViewRepository) -> list[CompraPublica]:
    if not await usuarios.get(usuario_id):
        raise NotFoundException(f"Usuario {usuario_id} no encontrado")
    filas = await vista_compra.list_by_fields(
        {"usuario_id": usuario_id}, include=["usuario", "productos"], limit=None,
    )
    info = await _info_productos(productos, filas)
    return [a_compra_publica(f, info) for f in filas]


async def modificar(repo: Repository, usuario_id: UUID, datos: ModificarUsuario) -> UsuarioPublico:
    cambios = datos.model_dump(exclude_unset=True)
    cambios.pop("id", None)
    if not cambios:
        raise ValidationException("Ingresar al menos un cambio")
    u = await repo.get(usuario_id)
    if not u:
        raise NotFoundException("Usuario no encontrado")
    for campo, valor in cambios.items():
        setattr(u, campo, valor)
    await repo.update(u)
    return a_publico(u)


async def eliminar(usuario_id: UUID, *, usuarios: Repository,
                   compras: Repository, join: Repository) -> None:
    if not await usuarios.get(usuario_id):
        raise NotFoundException("Usuario no encontrado")
    for c in await compras.list_by_fields({"usuario_id": usuario_id}, limit=None):
        for cp in await join.list_by_fields({"compra_id": c.id}, limit=None):
            await join.delete(cp.id)
        await compras.delete(c.id)
    await usuarios.delete(usuario_id)
