import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendEmailSchema = z.object({
  recipientEmail: z.string().email(),
  clientName: z.string().min(1),
  invoiceNumber: z.string().min(1),
  dueDate: z.string().min(1),
  total: z.number().nonnegative(),
  pdfBase64: z.string().min(1)
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const pythonApiUrl = process.env.PYTHON_API_URL?.trim();
    if (!pythonApiUrl) {
      return NextResponse.json({ error: "PYTHON_API_URL is not configured" }, { status: 500 });
    }

    let upstream: Response;
    try {
      upstream = await fetch(`${pythonApiUrl}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        cache: "no-store"
      });
    } catch (error) {
      console.error("POST /api/email upstream unreachable", error);
      return NextResponse.json(
        {
          error: `Python backend unavailable at ${pythonApiUrl}. Start FastAPI (uvicorn main:app --host 0.0.0.0 --port 8000).`
        },
        { status: 503 }
      );
    }

    if (!upstream.ok) {
      const errorPayload = (await upstream.json().catch(() => ({}))) as { error?: string; detail?: string };
      return NextResponse.json(
        { error: errorPayload.error ?? errorPayload.detail ?? "Email service error" },
        { status: upstream.status }
      );
    }

    const result = (await upstream.json()) as { success: boolean };
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/email failed", error);
    return NextResponse.json({ error: "Unable to send email" }, { status: 500 });
  }
}
