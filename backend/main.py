from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.email import router as email_router
from routers.pdf import router as pdf_router

load_dotenv()

app = FastAPI(
    title="Invoice Automation Backend",
    version="1.0.0",
    description="FastAPI backend for PDF generation and invoice email dispatch",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf_router)
app.include_router(email_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
