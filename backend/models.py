from sqlmodel import Field, Relationship, SQLModel
from decimal import Decimal


#########################
#--------USUARIO--------#
#########################

class UsuarioBase(SQLModel):
    nombre: str = Field(index = True)
    email: str | None = Field(default = None)


class Usuario(UsuarioBase, table = True):
    id: int | None = Field(default = None, primary_key = True)
    contraseña: str
    compras: list["Compra"] = Relationship(back_populates = "usuario", cascade_delete = True)


class UsuarioPublico(UsuarioBase):
    id: int


class CrearUsuario(UsuarioBase):
    contraseña: str
    id: int


class ModificarUsuario(SQLModel):
    nombre: str | None = None
    email: str | None = None
    contraseña: str | None = None


##########################
#----Tabla Intermedia----#
##########################


class CompraProducto(SQLModel, table = True):
    compra_id: int | None = Field(default= None, foreign_key = "compra.id_compra", primary_key = True)
    producto_id: int | None = Field(default= None, foreign_key = "producto.id", primary_key = True)
    compra: "Compra" = Relationship(back_populates = "producto_link")
    producto: "Producto" = Relationship(back_populates = "compra_link")
    cantidad: int = Field(default = 1)


class CompraProductoPublica(SQLModel):
    producto_id: int
    cantidad: int


##########################
#--------PRODUCTO--------#
##########################


class ProductoBase(SQLModel):
    nombre: str = Field(index = True)
    precio: Decimal = Field(default = 0, max_digits = 10, decimal_places = 3)
    url_de_imagen: str | None = Field(default=None)


class Producto(ProductoBase, table = True):
    id: int | None = Field(default = None, primary_key = True)
    compra_link: list[CompraProducto] = Relationship(back_populates = "producto", cascade_delete = True)


class CrearProducto(ProductoBase):
    pass


class ModificarProducto(SQLModel):
    nombre: str | None = None
    precio: Decimal | None = None
    url_de_imagen: str | None = None


###########################
#---------COMPRA----------#
###########################


class CompraBase(SQLModel):
    total_productos: int = Field(default = 1)
    usuario_id: int = Field(foreign_key="usuario.id")


class Compra(CompraBase, table = True):
    id_compra: int | None = Field(default = None, primary_key = True)
    usuario: "Usuario" = Relationship(back_populates = "compras")
    producto_link: list[CompraProducto] = Relationship(back_populates = "compra", cascade_delete = True)


class CompraPublica(CompraBase):
    id_compra: int
    usuario: "UsuarioBase"
    productos: list[CompraProductoPublica]


class CompraItem(SQLModel):
    producto_id: int
    cantidad: int = Field(default = 1)


class CrearCompra(SQLModel):
    usuario_id: int
    productos: list[CompraItem]


class ModificarCompra(SQLModel):
    usuario_id: int | None = None
    productos: list[CompraItem] | None = None