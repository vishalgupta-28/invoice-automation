import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/api-errors";
import { getPrismaClient } from "@/lib/prisma";
import { serializeClient } from "@/lib/server-utils";
import { createClientSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(clients.map((client) => serializeClient(client)));
  } catch (error) {
    console.error("GET /api/clients failed", error);
    const dbResponse = handleDatabaseError(error, "Unable to fetch clients");
    if (dbResponse) return dbResponse;
    return NextResponse.json({ error: "Unable to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const body: unknown = await request.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid client payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    const client = await prisma.client.create({
      data: {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone?.trim() || null,
        address: payload.address?.trim() || null,
        taxId: payload.taxId?.trim() || null
      }
    });

    return NextResponse.json(serializeClient(client), { status: 201 });
  } catch (error) {
    console.error("POST /api/clients failed", error);
    const dbResponse = handleDatabaseError(error, "Unable to create client");
    if (dbResponse) return dbResponse;
    return NextResponse.json({ error: "Unable to create client" }, { status: 500 });
  }
}
