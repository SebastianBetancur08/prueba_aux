from uuid import UUID

from fastapi import APIRouter, Depends

from persistence_kit.contracts.repository import Repository
from persistence_kit.contracts.view_repository import ViewRepository
from persistence_kit.repository_factory import provide_repo, provide_view_repo
from persistence_kit.api.common import pagination_params
from persistence_kit.api.error_handlers import handle_service_errors

from backend_persistence.models import CrearCompra, ModificarCompra, CompraPublica
from backend_persistence.services import compra_service

router = APIRouter(prefix="/compra", tags=["compras"])


@router.post("/", response_model=CompraPublica)
@handle_service_errors
async def crear_compra(
    datos: CrearCompra,
    compras: Repository = Depends(provide_repo("compra")),
    productos: Repository = Depends(provide_repo("producto")),
    usuarios: Repository = Depends(provide_repo("usuario")),
    join: Repository = Depends(provide_repo("compra_producto")),
    vista: ViewRepository = Depends(provide_view_repo("compra")),
):
    return await compra_service.crear(
        datos=datos, compras=compras, productos=productos,
        usuarios=usuarios, join=join, vista=vista,
    )


@router.get("/", response_model=list[CompraPublica])
@handle_service_errors
async def historial_compras(
    pag: tuple[int, int] = Depends(pagination_params),
    vista: ViewRepository = Depends(provide_view_repo("compra")),
):
    offset, limit = pag
    return await compra_service.historial(vista=vista, offset=offset, limit=limit)


@router.get("/{id_compra}", response_model=CompraPublica)
@handle_service_errors
async def obtener_compra(
    id_compra: UUID,
    vista: ViewRepository = Depends(provide_view_repo("compra")),
):
    return await compra_service.obtener(id_compra, vista=vista)


@router.patch("/{id_compra}", response_model=CompraPublica)
@handle_service_errors
async def modificar_compra(
    id_compra: UUID,
    datos: ModificarCompra,
    compras: Repository = Depends(provide_repo("compra")),
    productos: Repository = Depends(provide_repo("producto")),
    usuarios: Repository = Depends(provide_repo("usuario")),
    join: Repository = Depends(provide_repo("compra_producto")),
    vista: ViewRepository = Depends(provide_view_repo("compra")),
):
    return await compra_service.modificar(
        id_compra, datos=datos, compras=compras, productos=productos,
        usuarios=usuarios, join=join, vista=vista,
    )


@router.delete("/{id_compra}")
@handle_service_errors
async def eliminar_compra(
    id_compra: UUID,
    compras: Repository = Depends(provide_repo("compra")),
    join: Repository = Depends(provide_repo("compra_producto")),
):
    await compra_service.eliminar(id_compra, compras=compras, join=join)
    return {"ok": True}
