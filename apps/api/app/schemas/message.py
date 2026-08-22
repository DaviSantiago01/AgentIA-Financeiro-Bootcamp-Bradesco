from pydantic import BaseModel, ConfigDict, Field


class MessageSchema(BaseModel):
    """Formato padrão para mensagens recebidas e respondidas pelo chat."""

    model_config = ConfigDict(str_strip_whitespace=True)

    message: str = Field(
        min_length=1,
        max_length=1000,
        description="Mensagem enviada ou respondida pelo Finch.",
    )
