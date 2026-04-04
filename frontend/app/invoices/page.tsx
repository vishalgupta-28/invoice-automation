"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { InvoiceTable } from "@/components/InvoiceTable";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Invoice, InvoiceStatus } from "@/lib/types";

type FilterStatus = InvoiceStatus | "ALL";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search);

  async function loadInvoices() {
    setLoading(true);
    setError(null);
    try {
      const payload = await api.getInvoices();
      setInvoices(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesStatus = statusFilter === "ALL" ? true : invoice.status === statusFilter;
      const text = `${invoice.invoiceNumber} ${invoice.client?.name ?? ""} ${invoice.client?.email ?? ""}`.toLowerCase();
      const matchesSearch = text.includes(deferredSearch.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [deferredSearch, invoices, statusFilter]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this invoice permanently?")) return;
    try {
      await api.deleteInvoice(id);
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invoice");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Search, filter, and manage invoice lifecycle.</p>
        </div>
        <Link className={buttonVariants({ variant: "default" })} href="/invoices/new">
          Create Invoice
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input onChange={(event) => setSearch(event.target.value)} placeholder="Search by invoice number or client" value={search} />
        <select
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
          value={statusFilter}
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="SENT">SENT</option>
          <option value="PAID">PAID</option>
          <option value="OVERDUE">OVERDUE</option>
        </select>
      </div>

      {error ? <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading invoices...</p>
      ) : (
        <InvoiceTable invoices={filteredInvoices} onDelete={handleDelete} />
      )}
    </div>
  );
}
