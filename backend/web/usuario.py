from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, Session
from backend.models import Usuario, UsuarioPublico, CrearUsuario, ModificarUsuario
from backend.db import  get_session

router = APIRouter(prefix="/usuario")


@router.post("/", response_model = list[UsuarioPublico])
def crear_usuarios(*,
     session: Session = Depends(get_session), 
     usuarios: list[CrearUsuario]
     ):
    
    db_usuarios = []
    for usuario in usuarios:
        db_usuario = Usuario.model_validate(usuario)
        session.add(db_usuario)
        db_usuarios.append(db_usuario)

    try:
        session.commit()
    except IntegrityError:
        raise HTTPException(status_code = 400, detail = "Uno o mas IDs ya existen en la base de datos")

    for usuario in db_usuarios:
        session.refresh(usuario)

    return db_usuarios


@router.get("/", response_model = list[UsuarioPublico])
def leer_usuarios(*, 
    minimo: int = 0, 
    maximo: int = Query(default=100, le=100), 
    session: Session = Depends(get_session), 
    ):

    usuarios=session.exec(select(Usuario).offset(minimo).limit(maximo)).all()

    return usuarios


@router.get("/buscar_usuarios/", response_model = list[UsuarioPublico])
def buscar_usuarios(
    *,
    session: Session = Depends(get_session),
    usuarios_id: list[int] = Query(default=[])
):
    usuarios = []
    for usuario_id in usuarios_id:
        usuario = session.get(Usuario, usuario_id)
        if not usuario:
            raise HTTPException(status_code = 404, detail = f"Usuario {usuario_id} not found")
        usuarios.append(usuario)

    return usuarios


@router.patch("/{usuario_id}", response_model = UsuarioPublico)
def modificar_usuario( *,
    session: Session = Depends(get_session),
    usuario_id: int,
    usuario: ModificarUsuario
):
    db_usuario = session.get(Usuario, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code = 404, detail = "Usuario no encontrado")

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

    usuario=session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code = 404, detail = "Usuario not found")
    
    session.delete(usuario)
    session.commit()

    return {"ok": True}
    