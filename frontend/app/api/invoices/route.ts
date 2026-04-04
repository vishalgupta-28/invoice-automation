import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/api-errors";
import { getPrismaClient } from "@/lib/prisma";
import { createInvoiceSchema } from "@/lib/validations";
import { generateInvoiceNumber, serializeInvoice } from "@/lib/server-utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const invoices = await prisma.invoice.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(invoices.map((invoice) => serializeInvoice(invoice)));
  } catch (error) {
    console.error("GET /api/invoices failed", error);
    const dbResponse = handleDatabaseError(error, "Unable to fetch invoices");
    if (dbResponse) return dbResponse;
    return NextResponse.json({ error: "Unable to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const body: unknown = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid invoice payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const year = new Date(payload.issueDate).getUTCFullYear();
    const prefix = `INV-${year}-`;

    const latest = await prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true }
    });

    const invoiceNumber = generateInvoiceNumber(year, latest?.invoiceNumber ?? null);
    const subtotal = Number(
      payload.lineItems.reduce((acc, item) => acc + Number(item.amount.toFixed(2)), 0).toFixed(2)
    );
    const total = Number((subtotal + payload.tax - payload.discount).toFixed(2));

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        status: payload.status,
        issueDate: new Date(payload.issueDate),
        dueDate: new Date(payload.dueDate),
        subtotal,
        tax: payload.tax,
        discount: payload.discount,
        total,
        notes: payload.notes?.trim() ? payload.notes.trim() : null,
        currency: payload.currency,
        clientId: payload.clientId,
        lineItems: {
          create: payload.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount
          }))
        }
      },
      include: {
        client: true,
        lineItems: true,
        payments: true
      }
    });

    return NextResponse.json(serializeInvoice(invoice), { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices failed", error);
    const dbResponse = handleDatabaseError(error, "Unable to create invoice");
    if (dbResponse) return dbResponse;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Invoice creation failed due to database constraints" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create invoice" }, { status: 500 });
  }
}
