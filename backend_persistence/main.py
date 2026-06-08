import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from persistence_kit.settings.repo_settings import RepoSettings
from persistence_kit.bootstrap.startup import run_startup_bootstrap
from persistence_kit.repository_factory import set_registry_initializer, get_repo
from persistence_kit.api.route_loader import build_api_router

from backend_persistence.persistence import register_defaults

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prueba_aux")

ENTIDADES = ("usuario", "producto", "compra", "compra_producto")


@asynccontextmanager
async def lifespan(app: FastAPI):
    set_registry_initializer(register_defaults)
    settings = RepoSettings()

    async def _bootstrap() -> None:
        for key in ENTIDADES:
            repo = get_repo(key)
            init = getattr(repo, "init_indexes", None)
            if init is not None:
                await init()

    await run_startup_bootstrap(settings, logger, _bootstrap)
    yield


app = FastAPI(lifespan=lifespan, title="prueba_aux")

_settings = RepoSettings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# prefix="" conserva tus rutas /usuario /producto /compra. Usa "/api" si lo prefieres.
app.include_router(build_api_router("backend.web", prefix=""))
