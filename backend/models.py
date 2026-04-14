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
    compras: list["Compra"] = Relationship(back_populates = "usuario")


class UsuarioPublico(UsuarioBase):
    id: int


class CrearUsuario(UsuarioBase):
    contraseña: str
    id: int


class LeerUsuario(UsuarioBase):
    id: int


class ModificarUsuario(SQLModel):
    nombre: str | None = None
    email: str | None = None
    contraseña: str | None = None


##########################
#--------PRODUCTO--------#
##########################


class ProductoBase(SQLModel):
    nombre: str = Field(index = True)
    precio: Decimal = Field(default = 0, max_digits = 10, decimal_places = 3)
    url_de_imagen: str | None = Field(default=None)


class Producto(ProductoBase, table = True):
    id: int | None = Field(default = None, primary_key = True)


class CrearProducto(ProductoBase):
    pass


class LeerProducto(ProductoBase):
    id: int


class ModificarProducto(SQLModel):
    nombre: str | None = None
    precio: Decimal | None = None
    url_de_imagen: str | None = None


###########################
#---------COMPRA----------#
###########################


class CompraBase(SQLModel):
    total_productos: Decimal = Field(default = 0, max_digits = 10, decimal_places = 3)
    usuario_id: int = Field(foreign_key="usuario.id")


class Compra(CompraBase, table = True):
    id_compra: int | None = Field(default = None, primary_key = True)
    usuario: "Usuario" = Relationship(back_populates = "compras")