import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload: unknown = await request.json();
    const pythonApiUrl = process.env.PYTHON_API_URL?.trim();

    if (!pythonApiUrl) {
      return NextResponse.json({ error: "PYTHON_API_URL is not configured" }, { status: 500 });
    }

    let upstream: Response;
    try {
      upstream = await fetch(`${pythonApiUrl}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store"
      });
    } catch (error) {
      console.error("POST /api/pdf upstream unreachable", error);
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
        { error: errorPayload.error ?? errorPayload.detail ?? "PDF service error" },
        { status: upstream.status }
      );
    }

    const pdfBuffer = await upstream.arrayBuffer();
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="invoice.pdf"'
      }
    });
  } catch (error) {
    console.error("POST /api/pdf failed", error);
    return NextResponse.json({ error: "Unable to generate PDF" }, { status: 500 });
  }
}
