from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, Session
from backend.models import Usuario, UsuarioPublico, CrearUsuario, ModificarUsuario, Compra, CompraPublica, CompraProductoPublica
from backend.db import get_session
from backend.mongo import get_compra_productos_collection

router = APIRouter(prefix="/usuario", tags=["usuarios"] )


@router.post("/", response_model = UsuarioPublico)
def crear_usuario(*,
     session: Session = Depends(get_session), 
     usuario: CrearUsuario
     ):
    
    db_usuario = Usuario.model_validate(usuario)
    session.add(db_usuario)
    
    try:
        session.commit()
    except IntegrityError:
        raise HTTPException(status_code = 400, detail = "Uno o mas IDs ya existen en la base de datos")

    session.refresh(db_usuario)

    return db_usuario


@router.get("/", response_model = list[UsuarioPublico])
def leer_usuarios(*, 
    minimo: int = 0, 
    maximo: int = Query(default=100, le=100), 
    session: Session = Depends(get_session), 
    ):

    usuarios=session.exec(select(Usuario).offset(minimo).limit(maximo)).all()

    return usuarios


@router.get("/buscar_usuarios/", response_model = list[UsuarioPublico])
def buscar_usuarios(*,
    session: Session = Depends(get_session),
    usuarios_id: list[int] = Query(default=[])
):
    
    # Buscar usuarios
    usuarios = []
    for usuario_id in usuarios_id:
        usuario = session.get(Usuario, usuario_id)

        # Validar usuario
        if not usuario:
            raise HTTPException(status_code = 404, detail = f"Usuario {usuario_id} not found")
        usuarios.append(usuario)

    return usuarios


@router.get("/{usuario_id}", response_model = list[CompraPublica] )
async def obtener_compras_usuario(*,
    session: Session = Depends(get_session),
    usuario_id: int
    ):

    # Validar usuario
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code = 404, detail = f"Usuario {usuario_id} not found")

    # Encontrar compras
    collection = get_compra_productos_collection()
    compras = []
    for compra in usuario.compras:
        docs = await collection.find({"compra_id": compra.id_compra}).to_list()
        compras.append(CompraPublica(
            total_productos = compra.total_productos,
            id_compra = compra.id_compra,
            usuario = compra.usuario,
            productos = [CompraProductoPublica(producto_id=d["producto_id"], cantidad=d["cantidad"]) for d in docs]
        ))

    return compras


@router.patch("/{usuario_id}", response_model = UsuarioPublico)
def modificar_usuario( *,
    session: Session = Depends(get_session),
    usuario_id: int,
    usuario: ModificarUsuario
):
    
    # Validar si se ingresan cambios
    cambios = usuario.model_dump(exclude_unset=True)
    if not cambios:
        raise HTTPException(status_code=422, detail="Ingresar al menos un cambio")

    # Validar usuario
    db_usuario = session.get(Usuario, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code = 404, detail = "Usuario no encontrado")
 
    # Añadir cambios, guardar y refrescar
    usuario_data = usuario.model_dump(exclude_unset=True)
    db_usuario.sqlmodel_update(usuario_data)
    session.add(db_usuario)
    session.commit()
    session.refresh(db_usuario)

    return db_usuario


@router.delete("/{usuario_id}")
def eliminar_usuario(*, 
    session: Session = Depends(get_session), 
    usuario_id: int
    ):
    
    # Validar usuario
    usuario=session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code = 404, detail = "Usuario not found")
    
    # Eliminar usuario y guardar cambios
    session.delete(usuario)
    session.commit()

    return {"ok": True}
    