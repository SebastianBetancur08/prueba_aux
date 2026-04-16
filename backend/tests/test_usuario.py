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
    response = client.post("/usuario/", json=[{
        "nombre": "pruebas",
        "email": "prueba@gmail.com",
        "id": 1034988101,
        "contraseña": "prueba"
    }])
    return response.json()[0]


@pytest.fixture(name = "producto")
def producto_fixture(client: TestClient):
    response = client.post("/producto/", json=[{
        "nombre": "producto prueba",
        "precio": 10000.25,
        "url_de_imagen": "http//prueba"

    }])
    return response.json()[0]


@pytest.fixture(name = "compra")
def compra_fixture(client: TestClient, usuario, producto):
    response = client.post("/compra/", json={
        "usuario_id": usuario["id"],
        "productos": [{"producto_id": producto["id"], "cantidad": 2}]
    })
    return response.json()

    
def test_crear_usuario(client: TestClient, usuario):

    assert usuario["nombre"] == "pruebas"
    assert usuario["email"] == "prueba@gmail.com"
    assert usuario["id"] == 1034988101


def test_crear_usuario_incompleto(client: TestClient):
    response = client.post("/usuario/", json=[{
        "email": "prueba@gmail.com",
        "contraseña": "prueba"
    }])

    assert response.status_code == 422


def test_crear_usuario_duplicado(client: TestClient, usuario):

    response = client.post("/usuario/", json=[{
        "nombre": "prueba",
        "email": "prueba@gmail.com",
        "id": 1034988101,
        "contraseña": "prueba"
    }])

    assert response.status_code == 400


def test_leer_usuario(client: TestClient, usuario):
    response = client.get("/usuario/")

    data = response.json()

    assert response.status_code == 200
    assert len(data) > 0
    assert data[0]["nombre"] == "pruebas"
    assert data[0]["email"] == "prueba@gmail.com"
    assert data[0]["id"] == 1034988101


def test_leer_usuario_paginacion(client: TestClient, usuario):
    response = client.get("/usuario/?minimo=0&maximo=1")

    data = response.json()

    assert response.status_code == 200
    assert len(data) <= 1


def test_leer_usuario_maximo_invalido(client: TestClient):
    response = client.get("/usuario/?maximo=200")

    assert response.status_code == 422


def test_buscar_usuarios(client: TestClient, usuario):
    response = client.get(f"/usuario/buscar_usuarios/?usuarios_id={usuario['id']}")

    data = response.json()

    assert response.status_code == 200
    assert data[0]["nombre"] == "pruebas"
    assert data[0]["email"] == "prueba@gmail.com"
    assert data[0]["id"] == 1034988101


def test_buscar_usuario_no_existe(client: TestClient):
    response = client.get("/usuario/buscar_usuarios/?usuarios_id=25")

    assert response.status_code == 404


def test_obtener_compras_usuario(client: TestClient, usuario, compra):
    response = client.get(f"/usuario/{usuario['id']}")

    data = response.json()

    assert response.status_code == 200
    assert len(data) > 0
    assert data[0]["usuario"]["id"] == usuario["id"]
    assert data[0]["id_compra"] == compra["id_compra"]
    assert data[0]["total_productos"] == compra["total_productos"]
    assert data[0]["productos"][0]["producto_id"] == compra["productos"][0]["producto_id"]
    assert data[0]["productos"][0]["cantidad"] == compra["productos"][0]["cantidad"]


def test_modifcar_usuario(client: TestClient, usuario):
    response = client.patch(f"/usuario/{usuario['id']}", 
                        json = {
                            "nombre": "hola",
                            "email": "nose",
                            "id": 40
                        })
    data = response.json()

    assert data["nombre"] != usuario["nombre"]
    assert data["email"] != usuario["email"]
    assert data["id"] != usuario["id"]


def test_modificar_usuario_no_existe(client: TestClient, usuario):
    response = client.patch("/usuario/40", json = {})

    assert response.status_code == 404


def test_elimiar_usuario(client: TestClient, usuario):
    response = client.delete(f"/usuario/{usuario['id']}")

    assert response.status_code == 200


def test_elimar_usuario_no_existe(client: TestClient):
    response = client.delete("/usuario/25")

    assert response.status_code == 404

