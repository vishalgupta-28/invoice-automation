from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from utils.email_sender import send_invoice_email

router = APIRouter(tags=["Email"])


class SendEmailPayload(BaseModel):
    recipientEmail: str = Field(min_length=5)
    clientName: str = Field(min_length=1)
    invoiceNumber: str = Field(min_length=1)
    dueDate: str = Field(min_length=1)
    total: float = Field(ge=0)
    pdfBase64: str = Field(min_length=1)

    @field_validator("recipientEmail")
    @classmethod
    def validate_email(cls, value: str) -> str:
        candidate = value.strip()
        if "@" not in candidate:
            raise ValueError("recipientEmail must be a valid email address")
        local_part, _, domain_part = candidate.partition("@")
        if not local_part or "." not in domain_part:
            raise ValueError("recipientEmail must be a valid email address")
        return candidate


@router.post("/send-email")
def send_email(payload: SendEmailPayload) -> dict[str, bool]:
    try:
        send_invoice_email(
            recipient_email=payload.recipientEmail,
            client_name=payload.clientName,
            invoice_number=payload.invoiceNumber,
            due_date=payload.dueDate,
            total=payload.total,
            pdf_base64=payload.pdfBase64,
        )
        return {"success": True}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive handler
        raise HTTPException(status_code=500, detail="Failed to send email") from exc
