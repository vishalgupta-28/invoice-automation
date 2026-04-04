"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ClientSelector } from "@/components/ClientSelector";
import { LineItemsEditor } from "@/components/LineItemsEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceFormValues } from "@/lib/form-types";
import { formatCurrency } from "@/lib/format";
import { Client, Currency, InvoiceStatus } from "@/lib/types";
import { CreateInvoiceInput } from "@/lib/validations";

const invoiceFormSchema = z
  .object({
    clientId: z.string().min(1, "Client is required"),
    status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    tax: z.number().min(0),
    discount: z.number().min(0),
    notes: z.string(),
    currency: z.enum(["USD", "INR", "EUR"]),
    lineItems: z
      .array(
        z.object({
          description: z.string().min(1, "Description is required"),
          quantity: z.number().int().positive("Qty must be > 0"),
          unitPrice: z.number().min(0),
          amount: z.number().min(0)
        })
      )
      .min(1, "At least one line item is required")
  })
  .superRefine((value, ctx) => {
    if (new Date(value.dueDate) < new Date(value.issueDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be before issue date",
        path: ["dueDate"]
      });
    }
  });

interface InvoiceFormProps {
  clients: Client[];
  initialValues?: Partial<InvoiceFormValues>;
  submitLabel?: string;
  onSubmit: (payload: CreateInvoiceInput) => Promise<void>;
}

const statusOptions: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE"];
const currencyOptions: Currency[] = ["USD", "INR", "EUR"];

export function InvoiceForm({ clients, initialValues, submitLabel = "Create Invoice", onSubmit }: InvoiceFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: initialValues?.clientId ?? "",
      status: initialValues?.status ?? "DRAFT",
      issueDate: initialValues?.issueDate ?? new Date().toISOString().slice(0, 10),
      dueDate: initialValues?.dueDate ?? new Date().toISOString().slice(0, 10),
      tax: initialValues?.tax ?? 0,
      discount: initialValues?.discount ?? 0,
      notes: initialValues?.notes ?? "",
      currency: initialValues?.currency ?? "USD",
      lineItems: initialValues?.lineItems?.length
        ? initialValues.lineItems
        : [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }]
    }
  });

  const { control, formState, handleSubmit, register, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const lineItems = useWatch({ control, name: "lineItems" }) ?? [];
  const clientId = useWatch({ control, name: "clientId" });
  const selectedCurrency = useWatch({ control, name: "currency" }) ?? "USD";
  const tax = useWatch({ control, name: "tax" });
  const discount = useWatch({ control, name: "discount" });
  const safeTax = Number.isFinite(tax) ? tax : 0;
  const safeDiscount = Number.isFinite(discount) ? discount : 0;

  useEffect(() => {
    lineItems.forEach((item, index) => {
      const computed = Number((item.quantity * item.unitPrice).toFixed(2));
      if (Number.isFinite(computed) && computed !== item.amount) {
        setValue(`lineItems.${index}.amount` as const, computed, { shouldValidate: true });
      }
    });
  }, [lineItems, setValue]);

  const subtotal = useMemo(() => {
    return Number(
      lineItems.reduce((acc, item) => acc + (Number.isFinite(item.amount) ? item.amount : 0), 0).toFixed(2)
    );
  }, [lineItems]);
  const total = useMemo(() => Number((subtotal + safeTax - safeDiscount).toFixed(2)), [safeDiscount, safeTax, subtotal]);

  const submitForm = handleSubmit((values) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const payload: CreateInvoiceInput = {
          ...values,
          issueDate: new Date(`${values.issueDate}T00:00:00.000Z`).toISOString(),
          dueDate: new Date(`${values.dueDate}T00:00:00.000Z`).toISOString(),
          tax: Number((Number.isFinite(values.tax) ? values.tax : 0).toFixed(2)),
          discount: Number((Number.isFinite(values.discount) ? values.discount : 0).toFixed(2)),
          lineItems: values.lineItems.map((item) => ({
            ...item,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice.toFixed(2)),
            amount: Number(item.amount.toFixed(2))
          }))
        };
        await onSubmit(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save invoice";
        setSubmitError(message);
      }
    });
  });

  return (
    <form className="space-y-6" onSubmit={submitForm}>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                id="status"
                {...register("status")}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
                id="currency"
                {...register("currency")}
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input id="issueDate" type="date" {...register("issueDate")} />
              {formState.errors.issueDate ? <p className="text-xs text-red-600">{formState.errors.issueDate.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {formState.errors.dueDate ? <p className="text-xs text-red-600">{formState.errors.dueDate.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <ClientSelector
              clients={clients}
              error={formState.errors.clientId?.message}
              onChange={(clientId) => setValue("clientId", clientId, { shouldValidate: true })}
              value={clientId ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Line Items</Label>
            <LineItemsEditor
              append={append}
              errors={formState.errors}
              fields={fields}
              lineItems={lineItems}
              register={register}
              remove={remove}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tax">Tax</Label>
              <Input id="tax" step={0.01} type="number" {...register("tax", { valueAsNumber: true })} />
              {formState.errors.tax ? <p className="text-xs text-red-600">{formState.errors.tax.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input id="discount" step={0.01} type="number" {...register("discount", { valueAsNumber: true })} />
              {formState.errors.discount ? <p className="text-xs text-red-600">{formState.errors.discount.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Payment terms, remarks, bank details..." {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal, selectedCurrency)}</span>
          </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(safeTax, selectedCurrency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrency(safeDiscount, selectedCurrency)}</span>
            </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total, selectedCurrency)}</span>
          </div>
        </CardContent>
      </Card>

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
