from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, Session
from backend.models import Producto, CrearProducto, ModificarProducto, ProductoPublico
from backend.db import  get_session


router = APIRouter(prefix="/producto", tags=["productos"])


def calcular_estado(producto: Producto) -> ProductoPublico:
    if producto.stock == 0:
        estado = "agotado"
    elif producto.stock < 30:
        estado = "bajo"
    else:
        estado = "disponible"
    return ProductoPublico(**producto.model_dump(), estado=estado)


@router.post("/", response_model = ProductoPublico)
def crear_producto(*,
     session: Session = Depends(get_session), 
     producto: CrearProducto
     ):
    
    db_producto = Producto.model_validate(producto)
    session.add(db_producto)
        
    try:
        session.commit()
    except IntegrityError:
        raise HTTPException(status_code = 400, detail = "Uno o mas IDs ya existen en la base de datos")

    session.refresh(db_producto)

    return calcular_estado(db_producto)


@router.get("/", response_model = list[ProductoPublico])
def leer_productos(*,
    minimo: int = 0,
    maximo: int = Query(default=100, le=100),
    session: Session = Depends(get_session),
    ):

    productos = session.exec(select(Producto).offset(minimo).limit(maximo)).all()

    return [calcular_estado(p) for p in productos]


@router.get("/buscar_productos/", response_model= list[ProductoPublico])
def buscar_productos(*,
    session: Session = Depends(get_session),
    productos_id: list[int] = Query(default=[])
    ):

    productos = []
    for producto_id in productos_id:
        producto = session.get(Producto, producto_id)

        if not producto:
            raise HTTPException(status_code = 404, detail = f"Producto {producto_id} not found")
        productos.append(calcular_estado(producto))

    return productos


@router.patch("/{producto_id}", response_model = ProductoPublico)
def modificar_producto(
    *,
    session: Session = Depends(get_session),
    producto_id: int,
    producto: ModificarProducto
):
    
    # Validar si se ingresan cambios
    cambios = producto.model_dump(exclude_unset=True)
    if not cambios:
        raise HTTPException(status_code=422, detail="Ingresar al menos un cambio")
    
    # Validar producto
    db_producto = session.get(Producto, producto_id)
    if not db_producto:
        raise HTTPException(status_code = 404, detail = "Producto no encontrado")
    
    #  # Añadir cambios, guardar y refrescar
    producto_data = producto.model_dump(exclude_unset=True)
    db_producto.sqlmodel_update(producto_data)
    session.add(db_producto)
    session.commit()
    session.refresh(db_producto)

    return calcular_estado(db_producto)


@router.delete("/{producto_id}")
def eliminar_producto(*, 
    session: Session = Depends(get_session), 
    producto_id: int
    ):
     
    # Validar producto
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code = 404, detail = "Producto not found")
    
    # Eliminar producto y guardar cambios
    session.delete(producto)
    session.commit()

    return {"ok": True}