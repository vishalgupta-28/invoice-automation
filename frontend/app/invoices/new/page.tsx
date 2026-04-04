"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceForm } from "@/components/InvoiceForm";
import { api } from "@/lib/api";
import { Client } from "@/lib/types";
import { CreateInvoiceInput } from "@/lib/validations";

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getClients()
      .then((payload) => setClients(payload))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load clients"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(payload: CreateInvoiceInput) {
    const invoice = await api.createInvoice(payload);
    router.push(`/invoices/${invoice.id}`);
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading clients...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Create Invoice</h1>
        <p className="text-sm text-muted-foreground">Build a new invoice with dynamic line items and auto totals.</p>
      </div>
      {error ? <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {clients.length === 0 ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
          Add a client first to create invoices.
        </p>
      ) : (
        <InvoiceForm clients={clients} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
