from app.schemas.message import MessageSchema


def create_temporary_response(user_message: MessageSchema) -> MessageSchema:
    """Gera uma resposta temporária até a integração do agente Finch."""

    return MessageSchema(
        message=(
            "Recebi sua pergunta. Na próxima etapa, o Finch vai usar a base de "
            "conhecimento para responder de forma educacional."
        )
    )
