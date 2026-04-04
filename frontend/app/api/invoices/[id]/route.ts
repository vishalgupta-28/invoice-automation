import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { handleDatabaseError } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { serializeInvoice } from "@/lib/server-utils";
import { updateInvoiceSchema } from "@/lib/validations";

export const runtime = "nodejs";

interface RouteContext {
  params: { id: string };
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        lineItems: true,
        payments: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(serializeInvoice(invoice));
  } catch (error) {
    console.error(`GET /api/invoices/${params.id} failed`, error);
    const dbResponse = handleDatabaseError(error, "Unable to fetch invoice");
    if (dbResponse) return dbResponse;
    return NextResponse.json({ error: "Unable to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = updateInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid invoice payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const subtotal = payload.lineItems
      ? Number(payload.lineItems.reduce((acc, item) => acc + item.amount, 0).toFixed(2))
      : Number(existing.subtotal);
    const tax = payload.tax ?? Number(existing.tax);
    const discount = payload.discount ?? Number(existing.discount);
    const total = Number((subtotal + tax - discount).toFixed(2));

    const updateData: Prisma.InvoiceUpdateInput = {
      status: payload.status,
      issueDate: payload.issueDate ? new Date(payload.issueDate) : undefined,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      subtotal,
      tax,
      discount,
      total,
      notes: payload.notes !== undefined ? (payload.notes.trim() ? payload.notes.trim() : null) : undefined,
      currency: payload.currency,
      client: payload.clientId ? { connect: { id: payload.clientId } } : undefined
    };

    if (payload.lineItems) {
      updateData.lineItems = {
        deleteMany: { invoiceId: params.id },
        create: payload.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount
        }))
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        lineItems: true,
        payments: true
      }
    });

    return NextResponse.json(serializeInvoice(invoice));
  } catch (error) {
    console.error(`PUT /api/invoices/${params.id} failed`, error);
    const dbResponse = handleDatabaseError(error, "Unable to update invoice");
    if (dbResponse) return dbResponse;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Unable to update invoice" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    await prisma.invoice.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/invoices/${params.id} failed`, error);
    const dbResponse = handleDatabaseError(error, "Unable to delete invoice");
    if (dbResponse) return dbResponse;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Unable to delete invoice" }, { status: 500 });
  }
}
