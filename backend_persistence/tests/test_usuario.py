import pytest


@pytest.fixture
def usuario(client):
    r = client.post("/usuario/", json={
        "nombre": "pruebas", "email": "prueba@gmail.com", "contraseña": "prueba",
    })
    assert r.status_code == 200
    return r.json()


@pytest.fixture
def producto(client):
    return client.post("/producto/", json={
        "nombre": "producto prueba", "precio": 10000.25, "stock": 10,
    }).json()


@pytest.fixture
def compra(client, usuario, producto):
    r = client.post("/compra/", json={
        "usuario_id": usuario["id"],
        "productos": [{"producto_id": producto["id"], "cantidad": 2}],
    })
    assert r.status_code == 200
    return r.json()


def test_crear_usuario(usuario):
    assert usuario["nombre"] == "pruebas"
    assert usuario["email"] == "prueba@gmail.com"
    assert "id" in usuario


def test_crear_usuario_incompleto(client):
    r = client.post("/usuario/", json={"email": "prueba@gmail.com", "contraseña": "prueba"})
    assert r.status_code == 422


def test_leer_usuarios(client, usuario):
    r = client.get("/usuario/")
    assert r.status_code == 200
    assert r.json()[0]["nombre"] == "pruebas"


def test_leer_usuarios_paginacion(client, usuario):
    r = client.get("/usuario/?offset=0&limit=1")
    assert r.status_code == 200
    assert len(r.json()) <= 1


def test_leer_usuarios_limite_invalido(client):
    assert client.get("/usuario/?limit=300").status_code == 422


def test_buscar_usuarios(client, usuario):
    r = client.get(f"/usuario/buscar_usuarios/?usuarios_id={usuario['id']}")
    assert r.status_code == 200
    assert r.json()[0]["nombre"] == "pruebas"


def test_buscar_usuarios_inexistente(client, id_inexistente):
    r = client.get(f"/usuario/buscar_usuarios/?usuarios_id={id_inexistente}")
    assert r.status_code == 404


def test_obtener_compras_usuario(client, usuario, compra):
    r = client.get(f"/usuario/{usuario['id']}")
    assert r.status_code == 200
    data = r.json()
    assert data[0]["usuario"]["id"] == usuario["id"]
    assert data[0]["id_compra"] == compra["id_compra"]
    assert data[0]["productos"][0]["producto_id"] == compra["productos"][0]["producto_id"]
    assert data[0]["productos"][0]["cantidad"] == compra["productos"][0]["cantidad"]


def test_obtener_compras_usuario_inexistente(client, id_inexistente):
    assert client.get(f"/usuario/{id_inexistente}").status_code == 404


def test_modificar_usuario(client, usuario):
    r = client.patch(f"/usuario/{usuario['id']}", json={"nombre": "hola", "email": "nose"})
    assert r.status_code == 200
    data = r.json()
    assert data["nombre"] == "hola"
    assert data["email"] == "nose"
    assert data["id"] == usuario["id"]               # el id NO cambia


def test_modificar_usuario_erroneo(client, usuario, id_inexistente):
    r1 = client.patch(f"/usuario/{usuario['id']}", json={})                 # sin cambios -> 400
    r2 = client.patch(f"/usuario/{id_inexistente}", json={"nombre": "hola"})  # inexistente -> 404
    assert r1.status_code == 400
    assert r2.status_code == 404


def test_eliminar_usuario(client, usuario):
    assert client.delete(f"/usuario/{usuario['id']}").status_code == 200


def test_eliminar_usuario_inexistente(client, id_inexistente):
    assert client.delete(f"/usuario/{id_inexistente}").status_code == 404
