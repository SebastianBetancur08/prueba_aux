import importlib
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from persistence_kit.repository_factory import set_registry_initializer
from persistence_kit.api.route_loader import build_api_router
from backend_persistence.persistence import register_for_tests

# módulo interno del factory, para limpiar sus cachés entre tests
_rf = importlib.import_module(set_registry_initializer.__module__)


@pytest.fixture(autouse=True)
def entorno_memoria():
    """Registra todo en memoria y deja el kit limpio antes/después de cada test."""
    set_registry_initializer(register_for_tests)
    _rf._init_registry.cache_clear()
    _rf._repo_cached.cache_clear()
    yield
    _rf._repo_cached.cache_clear()
    _rf._init_registry.cache_clear()


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(build_api_router("backend.web", prefix=""))
    return TestClient(app)


@pytest.fixture
def id_inexistente():
    return str(uuid4())
