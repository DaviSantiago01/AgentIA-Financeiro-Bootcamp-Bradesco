from fastapi import APIRouter, HTTPException, status

from app.agent.finch_agent import create_chat_response
from app.schemas.message import MessageSchema
from app.services.ollama_service import (
    OllamaResponseError,
    OllamaTimeoutError,
    OllamaUnavailableError,
)

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=MessageSchema)
async def send_message(payload: MessageSchema) -> MessageSchema:
    try:
        return await create_chat_response(payload)
    except OllamaTimeoutError as error:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="O modelo local demorou mais que o esperado para responder.",
        ) from error
    except OllamaUnavailableError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O serviço de IA local não está disponível no momento.",
        ) from error
    except OllamaResponseError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="O modelo local retornou uma resposta inválida ou incompleta.",
        ) from error
