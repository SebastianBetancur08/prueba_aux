from uuid import UUID

from fastapi import APIRouter, Depends, Query

from persistence_kit.contracts.repository import Repository
from persistence_kit.contracts.view_repository import ViewRepository
from persistence_kit.repository_factory import provide_repo, provide_view_repo
from persistence_kit.api.common import pagination_params
from persistence_kit.api.error_handlers import handle_service_errors

from backend_persistence.models import UsuarioPublico, CrearUsuario, ModificarUsuario, CompraPublica
from backend_persistence.services import usuario_service

router = APIRouter(prefix="/usuario", tags=["usuarios"])


@router.post("/", response_model=UsuarioPublico)
@handle_service_errors
async def crear_usuario(
    datos: CrearUsuario,
    repo: Repository = Depends(provide_repo("usuario")),
):
    return await usuario_service.crear(repo, datos)


@router.get("/", response_model=list[UsuarioPublico])
@handle_service_errors
async def leer_usuarios(
    pag: tuple[int, int] = Depends(pagination_params),
    repo: Repository = Depends(provide_repo("usuario")),
):
    offset, limit = pag
    return await usuario_service.listar(repo, offset, limit)


@router.get("/buscar_usuarios/", response_model=list[UsuarioPublico])
@handle_service_errors
async def buscar_usuarios(
    usuarios_id: list[UUID] = Query(default=[]),
    repo: Repository = Depends(provide_repo("usuario")),
):
    return await usuario_service.buscar(repo, usuarios_id)


@router.get("/{usuario_id}", response_model=list[CompraPublica])
@handle_service_errors
async def obtener_compras_usuario(
    usuario_id: UUID,
    usuarios: Repository = Depends(provide_repo("usuario")),
    vista_compra: ViewRepository = Depends(provide_view_repo("compra")),
):
    return await usuario_service.listar_compras(
        usuario_id, usuarios=usuarios, vista_compra=vista_compra,
    )


@router.patch("/{usuario_id}", response_model=UsuarioPublico)
@handle_service_errors
async def modificar_usuario(
    usuario_id: UUID,
    datos: ModificarUsuario,
    repo: Repository = Depends(provide_repo("usuario")),
):
    return await usuario_service.modificar(repo, usuario_id, datos)


@router.delete("/{usuario_id}")
@handle_service_errors
async def eliminar_usuario(
    usuario_id: UUID,
    usuarios: Repository = Depends(provide_repo("usuario")),
    compras: Repository = Depends(provide_repo("compra")),
    join: Repository = Depends(provide_repo("compra_producto")),
):
    await usuario_service.eliminar(usuario_id, usuarios=usuarios, compras=compras, join=join)
    return {"ok": True}
