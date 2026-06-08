from uuid import UUID

from fastapi import APIRouter, Depends, Query

from persistence_kit.contracts.repository import Repository
from persistence_kit.repository_factory import provide_repo
from persistence_kit.api.common import pagination_params
from persistence_kit.api.error_handlers import handle_service_errors

from backend_persistence.models import ProductoPublico, CrearProducto, ModificarProducto
from backend_persistence.services import producto_service

router = APIRouter(prefix="/producto", tags=["productos"])


@router.post("/", response_model=ProductoPublico)
@handle_service_errors
async def crear_producto(
    datos: CrearProducto,
    repo: Repository = Depends(provide_repo("producto")),
):
    return await producto_service.crear(repo, datos)


@router.get("/", response_model=list[ProductoPublico])
@handle_service_errors
async def leer_productos(
    pag: tuple[int, int] = Depends(pagination_params),
    repo: Repository = Depends(provide_repo("producto")),
):
    offset, limit = pag
    return await producto_service.listar(repo, offset, limit)


@router.get("/buscar_productos/", response_model=list[ProductoPublico])
@handle_service_errors
async def buscar_productos(
    productos_id: list[UUID] = Query(default=[]),
    repo: Repository = Depends(provide_repo("producto")),
):
    return await producto_service.buscar(repo, productos_id)


@router.patch("/{producto_id}", response_model=ProductoPublico)
@handle_service_errors
async def modificar_producto(
    producto_id: UUID,
    datos: ModificarProducto,
    repo: Repository = Depends(provide_repo("producto")),
):
    return await producto_service.modificar(repo, producto_id, datos)


@router.delete("/{producto_id}")
@handle_service_errors
async def eliminar_producto(
    producto_id: UUID,
    repo: Repository = Depends(provide_repo("producto")),
):
    await producto_service.eliminar(repo, producto_id)
    return {"ok": True}
