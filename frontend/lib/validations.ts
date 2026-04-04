import { z } from "zod";

export const currencySchema = z.enum(["USD", "INR", "EUR"]);
export const invoiceStatusSchema = z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]);

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive("Quantity should be at least 1"),
  unitPrice: z.number().nonnegative("Unit price cannot be negative"),
  amount: z.number().nonnegative()
});

export const createClientSchema = z.object({
  name: z.string().min(2, "Client name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  taxId: z.string().trim().optional().or(z.literal(""))
});

const invoiceBaseSchema = z.object({
  status: invoiceStatusSchema.default("DRAFT"),
  issueDate: z.string().datetime({ offset: true }),
  dueDate: z.string().datetime({ offset: true }),
  tax: z.number().min(0),
  discount: z.number().min(0),
  notes: z.string().trim().optional().or(z.literal("")),
  currency: currencySchema.default("USD"),
  clientId: z.string().min(1, "Client is required"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required")
});

function validateInvoiceAmounts(
  payload: { issueDate?: string; dueDate?: string; lineItems?: z.infer<typeof lineItemSchema>[] },
  ctx: z.RefinementCtx
) {
  if (payload.issueDate && payload.dueDate) {
    const issue = new Date(payload.issueDate);
    const due = new Date(payload.dueDate);

    if (Number.isNaN(issue.getTime()) || Number.isNaN(due.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Issue and due date must be valid dates"
      });
    } else if (due < issue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date must be on or after issue date",
        path: ["dueDate"]
      });
    }
  }

  if (payload.lineItems && payload.lineItems.length > 0) {
    const hasInvalidAmount = payload.lineItems.some(
      (item) => Number((item.quantity * item.unitPrice).toFixed(2)) !== Number(item.amount.toFixed(2))
    );

    if (hasInvalidAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Line item amount must equal quantity * unit price",
        path: ["lineItems"]
      });
    }
  }
}

export const createInvoiceSchema = invoiceBaseSchema.superRefine((payload, ctx) => {
  validateInvoiceAmounts(payload, ctx);
});

export const updateInvoiceSchema = invoiceBaseSchema
  .partial()
  .extend({
    status: invoiceStatusSchema.optional(),
    currency: currencySchema.optional(),
    issueDate: z.string().datetime({ offset: true }).optional(),
    dueDate: z.string().datetime({ offset: true }).optional(),
    lineItems: z.array(lineItemSchema).min(1).optional()
  })
  .superRefine((payload, ctx) => {
    validateInvoiceAmounts(payload, ctx);
  });

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
