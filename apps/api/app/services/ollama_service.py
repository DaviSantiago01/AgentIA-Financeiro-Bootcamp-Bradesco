import logging
from typing import TypedDict

import httpx

from app.core.config import get_settings


logger = logging.getLogger(__name__)


class ChatMessage(TypedDict):
    role: str
    content: str


class OllamaServiceError(Exception):
    """Erro controlado na comunicação com o Ollama local."""


class OllamaTimeoutError(OllamaServiceError):
    """O modelo excedeu o tempo limite configurado."""


class OllamaUnavailableError(OllamaServiceError):
    """O serviço local não pôde ser acessado."""


class OllamaResponseError(OllamaServiceError):
    """O serviço respondeu com erro ou conteúdo inválido."""


def _build_payload(model: str, messages: list[ChatMessage]) -> dict[str, object]:
    """Monta os parâmetros enviados ao modelo local."""

    return {
        "model": model,
        "messages": messages,
        "stream": False,
        "think": False,
        "options": {
            "num_ctx": 8192,
            "num_predict": 320,
            "temperature": 0.2,
        },
    }


async def _request_ollama(
    base_url: str,
    timeout_seconds: float,
    payload: dict[str, object],
) -> httpx.Response:
    """Realiza a chamada HTTP e classifica falhas de comunicação."""

    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.post(f"{base_url}/api/chat", json=payload)
            response.raise_for_status()
            return response
    except httpx.TimeoutException as error:
        raise OllamaTimeoutError(
            "O Ollama demorou mais que o tempo esperado."
        ) from error
    except httpx.RequestError as error:
        raise OllamaUnavailableError(
            "Não foi possível conectar ao Ollama local."
        ) from error
    except httpx.HTTPStatusError as error:
        logger.warning(
            "Ollama respondeu com status HTTP %s.",
            error.response.status_code,
        )
        raise OllamaResponseError(
            "O Ollama não conseguiu processar a solicitação."
        ) from error


def _extract_content(response: httpx.Response) -> str:
    """Valida a estrutura da resposta e extrai o texto gerado."""

    try:
        response_data = response.json()
    except ValueError as error:
        logger.warning("Ollama retornou uma resposta que não é JSON.")
        raise OllamaResponseError("O Ollama retornou uma resposta inválida.") from error

    if not isinstance(response_data, dict):
        logger.warning("Ollama retornou um JSON com estrutura inesperada.")
        raise OllamaResponseError("O Ollama retornou uma resposta inválida.")

    message = response_data.get("message")
    if not isinstance(message, dict):
        logger.warning("Resposta do Ollama não contém o objeto message.")
        raise OllamaResponseError("O Ollama retornou uma resposta inválida.")

    content = message.get("content")
    done_reason = response_data.get("done_reason")

    logger.debug(
        "Resposta do Ollama: done_reason=%s, eval_count=%s, content_length=%s, "
        "has_thinking=%s",
        done_reason,
        response_data.get("eval_count"),
        len(content) if isinstance(content, str) else 0,
        bool(message.get("thinking")),
    )

    if not isinstance(content, str) or not content.strip():
        raise OllamaResponseError("O Ollama retornou uma resposta vazia.")

    if done_reason == "length":
        raise OllamaResponseError(
            "O Ollama interrompeu a resposta antes de concluí-la."
        )

    return content.strip()


async def generate_response(messages: list[ChatMessage]) -> str:
    """Envia mensagens ao Ollama e devolve apenas o texto da resposta."""

    settings = get_settings()
    payload = _build_payload(settings.ollama_model, messages)
    response = await _request_ollama(
        settings.ollama_base_url,
        settings.ollama_timeout_seconds,
        payload,
    )

    return _extract_content(response)
