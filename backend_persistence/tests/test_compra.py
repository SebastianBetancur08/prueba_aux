import pytest


@pytest.fixture
def usuario(client):
    return client.post("/usuario/", json={
        "nombre": "pruebas", "email": "prueba@gmail.com", "contraseña": "prueba",
    }).json()


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


def test_crear_compra(compra, usuario, producto):
    assert compra["usuario"]["nombre"] == usuario["nombre"]
    assert compra["usuario"]["email"] == usuario["email"]
    assert compra["productos"][0]["producto_id"] == producto["id"]
    assert compra["productos"][0]["cantidad"] == 2


def test_crear_compra_erronea(client, usuario, producto, id_inexistente):
    r1 = client.post("/compra/", json={})
    r2 = client.post("/compra/", json={"usuario_id": usuario["id"], "productos": []})
    r3 = client.post("/compra/", json={"usuario_id": id_inexistente,
                                       "productos": [{"producto_id": producto["id"], "cantidad": 2}]})
    r4 = client.post("/compra/", json={"usuario_id": usuario["id"],
                                       "productos": [{"producto_id": producto["id"], "cantidad": 2},
                                                     {"producto_id": producto["id"], "cantidad": 3}]})
    r5 = client.post("/compra/", json={"usuario_id": usuario["id"],
                                       "productos": [{"producto_id": id_inexistente, "cantidad": 2}]})
    assert r1.status_code == 422   # sin cuerpo
    assert r2.status_code == 400   # sin productos
    assert r3.status_code == 404   # usuario no existe
    assert r4.status_code == 400   # productos repetidos
    assert r5.status_code == 404   # producto no existe


def test_obtener_compra(client, usuario, producto, compra):
    r = client.get(f"/compra/{compra['id_compra']}")
    assert r.status_code == 200
    data = r.json()
    assert data["id_compra"] == compra["id_compra"]
    assert data["usuario"]["id"] == usuario["id"]
    assert data["productos"][0]["producto_id"] == producto["id"]
    assert data["productos"][0]["cantidad"] == 2
    assert data["total_productos"] == compra["total_productos"]


def test_obtener_compra_inexistente(client, id_inexistente):
    assert client.get(f"/compra/{id_inexistente}").status_code == 404


def test_modificar_compra(client, compra, usuario, producto):
    r = client.patch(f"/compra/{compra['id_compra']}", json={
        "usuario_id": usuario["id"],
        "productos": [{"producto_id": producto["id"], "cantidad": 5}],
    })
    assert r.status_code == 200
    data = r.json()
    assert data["usuario"]["id"] == usuario["id"]
    assert data["total_productos"] != compra["total_productos"]
    assert data["productos"][0]["cantidad"] == 5


def test_modificar_compra_erronea(client, compra, usuario, producto, id_inexistente):
    r1 = client.patch(f"/compra/{compra['id_compra']}", json={})
    r2 = client.patch(f"/compra/{id_inexistente}",
                      json={"productos": [{"producto_id": producto["id"], "cantidad": 1}]})
    r3 = client.patch(f"/compra/{compra['id_compra']}",
                      json={"usuario_id": id_inexistente,
                            "productos": [{"producto_id": producto["id"], "cantidad": 1}]})
    r4 = client.patch(f"/compra/{compra['id_compra']}",
                      json={"productos": [{"producto_id": producto["id"], "cantidad": 1},
                                          {"producto_id": producto["id"], "cantidad": 2}]})
    r5 = client.patch(f"/compra/{compra['id_compra']}",
                      json={"productos": [{"producto_id": id_inexistente, "cantidad": 1}]})
    assert r1.status_code == 400   # sin cambios
    assert r2.status_code == 404   # compra inexistente
    assert r3.status_code == 404   # usuario inexistente
    assert r4.status_code == 400   # productos repetidos
    assert r5.status_code == 404   # producto inexistente


def test_eliminar_compra(client, compra):
    assert client.delete(f"/compra/{compra['id_compra']}").status_code == 200


def test_eliminar_compra_inexistente(client, id_inexistente):
    assert client.delete(f"/compra/{id_inexistente}").status_code == 404
