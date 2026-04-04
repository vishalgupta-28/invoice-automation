import base64
import os
import smtplib
from email.message import EmailMessage


def _require_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise ValueError(f"Missing required environment variable: {var_name}")
    return value


def send_invoice_email(
    recipient_email: str,
    client_name: str,
    invoice_number: str,
    due_date: str,
    total: float,
    pdf_base64: str,
) -> None:
    smtp_host = _require_env("SMTP_HOST")
    smtp_port = int(_require_env("SMTP_PORT"))
    smtp_user = _require_env("SMTP_USER")
    smtp_pass = _require_env("SMTP_PASS")

    try:
        pdf_bytes = base64.b64decode(pdf_base64, validate=True)
    except Exception as exc:  # pragma: no cover - defensive parsing branch
        raise ValueError("Invalid pdfBase64 payload") from exc

    message = EmailMessage()
    message["From"] = smtp_user
    message["To"] = recipient_email
    message["Subject"] = f"Invoice {invoice_number} from Acme Billing Solutions"
    message.set_content(
        "\n".join(
            [
                f"Hello {client_name},",
                "",
                f"Please find attached invoice {invoice_number}.",
                f"Due Date: {due_date}",
                f"Total Amount: {total:.2f}",
                "",
                "Thank you for your business.",
                "Acme Billing Solutions",
            ]
        )
    )
    message.add_attachment(
        pdf_bytes,
        maintype="application",
        subtype="pdf",
        filename=f"{invoice_number}.pdf",
    )

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(message)
