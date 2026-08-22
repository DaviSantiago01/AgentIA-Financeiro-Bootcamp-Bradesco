import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def get_required_environment_variable(name: str) -> str:
    """Obtém uma configuração obrigatória sem assumir valores padrão."""

    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"A variável de ambiente obrigatória {name} não foi configurada.")

    return value


@dataclass(frozen=True)
class Settings:
    """Configurações do backend obtidas pelas variáveis de ambiente."""

    ollama_base_url: str
    ollama_model: str
    ollama_timeout_seconds: float


@lru_cache
def get_settings() -> Settings:
    return Settings(
        ollama_base_url=get_required_environment_variable("OLLAMA_BASE_URL").rstrip("/"),
        ollama_model=get_required_environment_variable("OLLAMA_MODEL"),
        ollama_timeout_seconds=float(
            get_required_environment_variable("OLLAMA_TIMEOUT_SECONDS")
        ),
    )
