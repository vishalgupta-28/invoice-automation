from datetime import datetime
from io import BytesIO
import os
import platform
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

HTML = None
enable_weasyprint = os.getenv("ENABLE_WEASYPRINT", "").lower() in {"1", "true", "yes"}
if enable_weasyprint and platform.system().lower() != "windows":
    try:
        from weasyprint import HTML
    except Exception:
        HTML = None

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


def format_display_date(value: str) -> str:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.strftime("%d %b %Y")
    except ValueError:
        return value


def format_money(amount: float, currency: str) -> str:
    symbols = {"USD": "$", "INR": "INR ", "EUR": "EUR "}
    symbol = symbols.get(currency, f"{currency} ")
    return f"{symbol}{amount:,.2f}"


def generate_invoice_pdf(invoice_payload: dict[str, Any]) -> bytes:
    if not invoice_payload.get("lineItems"):
        raise ValueError("At least one line item is required for PDF generation")

    template = jinja_env.get_template("invoice.html")
    currency = str(invoice_payload.get("currency", "USD"))
    rendered_html = template.render(
        company_name="Acme Billing Solutions",
        company_email="billing@acme.example",
        company_phone="+1 (555) 123-4567",
        company_address="425 Market Street, Suite 300, San Francisco, CA",
        invoice=invoice_payload,
        issue_date_display=format_display_date(str(invoice_payload.get("issueDate", ""))),
        due_date_display=format_display_date(str(invoice_payload.get("dueDate", ""))),
        subtotal_display=format_money(float(invoice_payload.get("subtotal", 0)), currency),
        tax_display=format_money(float(invoice_payload.get("tax", 0)), currency),
        discount_display=format_money(float(invoice_payload.get("discount", 0)), currency),
        total_display=format_money(float(invoice_payload.get("total", 0)), currency),
        format_money=lambda amount: format_money(float(amount), currency),
    )
    if HTML is not None:
        return HTML(string=rendered_html, base_url=str(TEMPLATE_DIR)).write_pdf()

    return generate_invoice_pdf_fallback(invoice_payload)


def generate_invoice_pdf_fallback(invoice_payload: dict[str, Any]) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 40

    currency = str(invoice_payload.get("currency", "USD"))
    client = invoice_payload.get("client", {})
    line_items = invoice_payload.get("lineItems", [])

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(40, y, "INVOICE")
    y -= 30

    pdf.setFont("Helvetica", 10)
    pdf.drawString(40, y, f"Invoice #: {invoice_payload.get('invoiceNumber', '-')}")
    y -= 15
    pdf.drawString(40, y, f"Issue Date: {format_display_date(str(invoice_payload.get('issueDate', '-')))}")
    y -= 15
    pdf.drawString(40, y, f"Due Date: {format_display_date(str(invoice_payload.get('dueDate', '-')))}")
    y -= 25

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(40, y, "Bill To")
    y -= 15
    pdf.setFont("Helvetica", 10)
    pdf.drawString(40, y, str(client.get("name", "-")))
    y -= 15
    pdf.drawString(40, y, str(client.get("email", "-")))
    y -= 20

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(40, y, "Description")
    pdf.drawString(300, y, "Qty")
    pdf.drawString(350, y, "Unit Price")
    pdf.drawString(450, y, "Amount")
    y -= 12
    pdf.line(40, y, 550, y)
    y -= 15

    pdf.setFont("Helvetica", 9)
    for item in line_items:
        if y < 120:
            pdf.showPage()
            y = height - 40
            pdf.setFont("Helvetica", 9)
        pdf.drawString(40, y, str(item.get("description", ""))[:55])
        pdf.drawString(300, y, str(item.get("quantity", 0)))
        pdf.drawString(350, y, format_money(float(item.get("unitPrice", 0)), currency))
        pdf.drawString(450, y, format_money(float(item.get("amount", 0)), currency))
        y -= 14

    y -= 10
    pdf.line(320, y, 550, y)
    y -= 16
    pdf.drawString(350, y, f"Subtotal: {format_money(float(invoice_payload.get('subtotal', 0)), currency)}")
    y -= 14
    pdf.drawString(350, y, f"Tax: {format_money(float(invoice_payload.get('tax', 0)), currency)}")
    y -= 14
    pdf.drawString(350, y, f"Discount: {format_money(float(invoice_payload.get('discount', 0)), currency)}")
    y -= 16
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(350, y, f"Total: {format_money(float(invoice_payload.get('total', 0)), currency)}")

    notes = str(invoice_payload.get("notes") or "").strip()
    if notes:
        y -= 26
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(40, y, "Notes:")
        y -= 14
        pdf.setFont("Helvetica", 9)
        pdf.drawString(40, y, notes[:100])

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer.getvalue()
