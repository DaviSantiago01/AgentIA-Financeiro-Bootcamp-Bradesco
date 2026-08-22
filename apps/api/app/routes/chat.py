from fastapi import APIRouter

from app.schemas.message import MessageSchema
from app.services.chat_service import create_temporary_response

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=MessageSchema)
async def send_message(payload: MessageSchema) -> MessageSchema:
    return create_temporary_response(payload)
