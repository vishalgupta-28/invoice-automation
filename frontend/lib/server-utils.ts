import { Invoice, Prisma } from "@prisma/client";

type DecimalLike = Prisma.Decimal | number | string;

const toNumber = (value: DecimalLike): number => Number(value);

type ClientLike = {
  createdAt: Date;
} & Record<string, unknown>;

type LineItemLike = {
  unitPrice: DecimalLike;
  amount: DecimalLike;
} & Record<string, unknown>;

type PaymentLike = {
  amount: DecimalLike;
  paidAt: Date;
} & Record<string, unknown>;

type InvoiceWithRelations = Invoice & {
  client?: ClientLike | null;
  lineItems?: LineItemLike[];
  payments?: PaymentLike[];
};

export function generateInvoiceNumber(year: number, lastInvoiceNumber: string | null): string {
  if (!lastInvoiceNumber) {
    return `INV-${year}-0001`;
  }

  const segments = lastInvoiceNumber.split("-");
  const rawSequence = segments[2];
  const parsedSequence = Number.parseInt(rawSequence, 10);
  const next = Number.isNaN(parsedSequence) ? 1 : parsedSequence + 1;
  return `INV-${year}-${String(next).padStart(4, "0")}`;
}

export function serializeInvoice(invoice: InvoiceWithRelations) {
  return {
    ...invoice,
    subtotal: toNumber(invoice.subtotal),
    tax: toNumber(invoice.tax),
    discount: toNumber(invoice.discount),
    total: toNumber(invoice.total),
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    lineItems: invoice.lineItems
      ? invoice.lineItems.map((item) => ({
          ...item,
          unitPrice: toNumber(item.unitPrice),
          amount: toNumber(item.amount)
        }))
      : undefined,
    payments: invoice.payments
      ? invoice.payments.map((payment) => ({
          ...payment,
          amount: toNumber(payment.amount),
          paidAt: payment.paidAt.toISOString()
        }))
      : undefined,
    client: invoice.client
      ? {
          ...invoice.client,
          createdAt: invoice.client.createdAt.toISOString()
        }
      : undefined
  };
}

export function serializeClient<T extends { createdAt: Date }>(client: T) {
  return {
    ...client,
    createdAt: client.createdAt.toISOString()
  };
}
