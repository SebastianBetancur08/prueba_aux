from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
import pytest
from backend.db import get_session
from sqlmodel.pool import StaticPool
from backend.main import app


@pytest.fixture(name = "session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args ={"check_same_thread": False}, poolclass = StaticPool )
    
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name = "client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override

    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name = "usuario")
def usuario_fixture(client: TestClient):
    response = client.post("/usuario/", 
                            json=[{
                                "nombre": "pruebas",
                                "email": "prueba@gmail.com",
                                "id": 1034988101,
                                "contraseña": "prueba"
                                }])

    return response.json()[0]


@pytest.fixture(name = "producto")
def producto_fixture(client: TestClient):
    response = client.post("/producto/", 
                            json = [{
                                "nombre": "producto prueba",
                                "precio": 10000.25,
                                "url_de_imagen": "http//prueba"
                                }])
    
    return response.json()[0]


@pytest.fixture(name = "compra")
def compra_fixture(client: TestClient, usuario, producto):
    response = client.post("/compra/", 
                            json = {
                                "usuario_id": usuario["id"],
                                "productos": [{"producto_id": producto["id"], 
                                               "cantidad": 2
                                            }]})

    return response.json()


def test_crear_compra(client: TestClient, compra, usuario, producto):
    
    assert compra["usuario"]["nombre"] == usuario["nombre"]
    assert compra["usuario"]["email"] == usuario["email"]
    assert compra["productos"][0]["producto_id"] == producto["id"]
    assert compra["productos"][0]["cantidad"] == 2


def test_crear_compra_erronea(client: TestClient, usuario, producto):

    # sin cuerpo
    response_1 = client.post("/compra/", 
                            json = {})
    
    # Sin productos
    response_2 = client.post("/compra/",
                            json = {"usuario_id": usuario["id"],
                                    "productos": []})
    
    # Usuario no existe
    response_3 = client.post("/compra/", 
                            json={"usuario_id": 9999,
                                  "productos": [{"producto_id": producto["id"], 
                                                 "cantidad": 2
                                                }]})
    
    # Productos repetidos
    response_4 = client.post("/compra/",
                            json = {"usuario_id": usuario["id"],
                                    "productos": [{"producto_id": producto["id"],
                                                    "cantidad": 2
                                                    },
                                                    {"producto_id": producto["id"],
                                                    "cantidad" : 3
                                                    }]})

    # Producto no existe
    response_5 = client.post("/compra/",
                            json = {"usuario_id" : usuario["id"],
                                    "productos" : [{"producto_id" :3,
                                                    "cantidad" : 2
                                                    }]})

    assert response_1.status_code == 422
    assert response_2.status_code == 400
    assert response_3.status_code == 404
    assert response_4.status_code == 400
    assert response_5.status_code == 404


def test_obtener_compra(client: TestClient, usuario, producto, compra):
    response = client.get(f"/compra/{compra['id_compra']}")

    data = response.json()

    assert response.status_code == 200
    assert data["id_compra"] == compra["id_compra"]
    assert data["usuario"]["id"] == usuario["id"]
    assert data["usuario"]["nombre"] == usuario["nombre"]
    assert data["usuario"]["email"] == usuario["email"]
    assert data["productos"][0]["producto_id"] == producto["id"]
    assert data["productos"][0]["cantidad"] == 2  
    assert data["total_productos"] == compra["total_productos"]

def test_obtener_compra_inexistente(client : TestClient):
    response = client.get(f"/compra/90")

    assert response.status_code == 404


def test_modificar_compra(client : TestClient, compra, usuario):
    response = client.patch(f"/compra/{compra['id_compra']}", 
                            json = {"usuario_id": usuario["id"],
                                    "productos": [{"producto_id": 1,
                                                  "cantidad":10
                                                }]})
    
    data = response.json()
    
    assert response.status_code == 200
    assert data["usuario"]["id"] == usuario["id"]
    assert data["usuario"]["nombre"] == usuario["nombre"]
    assert data["usuario"]["email"] == usuario["email"]
    assert data["total_productos"] != compra["total_productos"]
    assert data["productos"][0]["producto_id"] == compra["productos"][0]["producto_id"]
    assert data["productos"][0]["cantidad"] != compra["productos"][0]["cantidad"]

def test_modificar_compra_erronea(client: TestClient, compra, usuario):

    # Sin cambios
    response_1 = client.patch(f"/compra/{compra['id_compra']}", 
                            json = {})

    # Compra inexistente
    response_2 = client.patch(f"/compra/30", 
                            json = {"usuario_id": usuario["id"],
                                    "productos": [{"producto_id": 1,
                                                  "cantidad":10
                                                }]})

    # Usuario inexistente
    response_3 = client.patch(f"/compra/{compra['id_compra']}", 
                            json = {"usuario_id": 20,
                                    "productos": [{"producto_id": 1,
                                                  "cantidad":10
                                                }]})
    
    # Producto repetidos
    response_4 = client.patch(f"/compra/{compra['id_compra']}", 
                            json = {"usuario_id": usuario["id"],
                                    "productos": [{"producto_id": 30,
                                                  "cantidad":10
                                                },
                                                {"producto_id": 30,
                                                  "cantidad":20
                                                }]})

    # Producto inexistente
    response_5 = client.patch(f"/compra/{compra['id_compra']}", 
                            json = {"usuario_id": usuario["id"],
                                    "productos": [{"producto_id": 30,
                                                  "cantidad":10
                                                }]})
    
    assert response_1.status_code == 422
    assert response_2.status_code == 404
    assert response_3.status_code == 404
    assert response_4.status_code == 400
    assert response_5.status_code == 404

def test_eliminar_compra(client: TestClient, compra):
    response = client.delete(f"/compra/{compra["id_compra"]}")

    assert response.status_code == 200

def test_eliminar_compra_inexistente(client: TestClient):
    response = client.delete("/compra/25")

    assert response.status_code == 404