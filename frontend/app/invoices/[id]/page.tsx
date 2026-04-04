"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PDFPreviewModal } from "@/components/PDFPreviewModal";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Invoice } from "@/lib/types";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mode = searchParams.get("mode");

  async function loadInvoice() {
    try {
      setLoading(true);
      const payload = await api.getInvoice(params.id);
      setInvoice(payload);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInvoice();
  }, [params.id]);

  const paidAmount = useMemo(
    () =>
      Number(
        (invoice?.payments?.reduce((sum, payment) => sum + payment.amount, 0) ?? 0).toFixed(2)
      ),
    [invoice?.payments]
  );

  async function handleMarkPaid() {
    if (!invoice) return;
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      try {
        const updated = await api.updateInvoice(invoice.id, { status: "PAID" });
        setInvoice(updated);
        setActionSuccess("Invoice marked as PAID.");
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Failed to update invoice");
      }
    });
  }

  async function handleSendEmail() {
    if (!invoice?.client) return;
    const currentInvoice = invoice;
    const currentClient = invoice.client;
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      try {
        const blob = await api.getPdfBlob(currentInvoice);
        const base64 = toBase64(new Uint8Array(await blob.arrayBuffer()));
        await api.sendInvoiceEmail({
          recipientEmail: currentClient.email,
          clientName: currentClient.name,
          invoiceNumber: currentInvoice.invoiceNumber,
          dueDate: currentInvoice.dueDate,
          total: currentInvoice.total,
          pdfBase64: base64
        });
        const updated = await api.updateInvoice(currentInvoice.id, {
          status: currentInvoice.status === "PAID" ? "PAID" : "SENT"
        });
        setInvoice(updated);
        setActionSuccess("Invoice email sent successfully.");
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Failed to send invoice email");
      }
    });
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading invoice...</p>;
  }

  if (!invoice) {
    return (
      <div className="space-y-3">
        <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">Invoice not found.</p>
        <Button onClick={() => router.push("/invoices")} variant="secondary">
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">Invoice details and follow-up actions.</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {mode === "edit" ? (
        <p className="rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-700">
          Edit mode note: Update support is available via API; this page currently focuses on actions and review.
        </p>
      ) : null}

      {actionError ? <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{actionError}</p> : null}
      {actionSuccess ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">{actionSuccess}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice, invoice.currency)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount, invoice.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client</span>
              <span>{invoice.client?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issue Date</span>
              <span>{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(invoice.tax, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrency(invoice.discount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span>{formatCurrency(paidAmount, invoice.currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setPreviewOpen(true)} variant="secondary">
            PDF Preview
          </Button>
          <Button disabled={isPending} onClick={handleSendEmail}>
            Send Email
          </Button>
          <Button disabled={isPending || invoice.status === "PAID"} onClick={handleMarkPaid} variant="outline">
            Mark as Paid
          </Button>
        </CardContent>
      </Card>

      <PDFPreviewModal invoice={invoice} onClose={() => setPreviewOpen(false)} open={previewOpen} />
    </div>
  );
}
