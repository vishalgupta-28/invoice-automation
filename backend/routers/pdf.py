from io import BytesIO
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from utils.pdf_generator import generate_invoice_pdf

router = APIRouter(tags=["PDF"])


class ClientPayload(BaseModel):
    name: str = Field(min_length=1)
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    taxId: Optional[str] = None


class LineItemPayload(BaseModel):
    description: str = Field(min_length=1)
    quantity: int = Field(gt=0)
    unitPrice: float = Field(ge=0)
    amount: float = Field(ge=0)


class InvoicePayload(BaseModel):
    invoiceNumber: str = Field(min_length=1)
    status: str = Field(min_length=1)
    issueDate: str = Field(min_length=1)
    dueDate: str = Field(min_length=1)
    subtotal: float = Field(ge=0)
    tax: float = Field(ge=0)
    discount: float = Field(ge=0)
    total: float
    notes: Optional[str] = None
    currency: str = Field(min_length=1)
    client: ClientPayload
    lineItems: list[LineItemPayload] = Field(min_length=1)


@router.post("/generate-pdf")
def generate_pdf(payload: InvoicePayload) -> StreamingResponse:
    try:
        pdf_bytes = generate_invoice_pdf(payload.model_dump())
        stream = BytesIO(pdf_bytes)
        return StreamingResponse(
            stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="{payload.invoiceNumber}.pdf"'},
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive handler
        raise HTTPException(status_code=500, detail="Failed to generate PDF") from exc
