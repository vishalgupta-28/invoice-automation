"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SortKey = "invoiceNumber" | "client" | "dueDate" | "status" | "total";
type SortDirection = "asc" | "desc";

interface InvoiceTableProps {
  invoices: Invoice[];
  onDelete?: (id: string) => Promise<void> | void;
}

export function InvoiceTable({ invoices, onDelete }: InvoiceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const sortedInvoices = useMemo(() => {
    const copy = [...invoices];
    copy.sort((a, b) => {
      let left: string | number = "";
      let right: string | number = "";

      switch (sortKey) {
        case "invoiceNumber":
          left = a.invoiceNumber;
          right = b.invoiceNumber;
          break;
        case "client":
          left = a.client?.name ?? "";
          right = b.client?.name ?? "";
          break;
        case "dueDate":
          left = new Date(a.dueDate).getTime();
          right = new Date(b.dueDate).getTime();
          break;
        case "status":
          left = a.status;
          right = b.status;
          break;
        case "total":
          left = a.total;
          right = b.total;
          break;
      }

      if (left === right) return 0;
      const result = left > right ? 1 : -1;
      return direction === "asc" ? result : -result;
    });
    return copy;
  }, [direction, invoices, sortKey]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setDirection("asc");
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button className="flex items-center gap-2" onClick={() => toggleSort("invoiceNumber")} type="button">
                Invoice <ArrowDownUp className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>
              <button className="flex items-center gap-2" onClick={() => toggleSort("client")} type="button">
                Client <ArrowDownUp className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <button className="flex items-center gap-2" onClick={() => toggleSort("dueDate")} type="button">
                Due Date <ArrowDownUp className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button className="ml-auto flex items-center gap-2" onClick={() => toggleSort("total")} type="button">
                Amount <ArrowDownUp className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.length === 0 ? (
            <TableRow>
              <TableCell className="py-8 text-center text-muted-foreground" colSpan={6}>
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            sortedInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.client?.name ?? "Unknown Client"}</TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.total, invoice.currency)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link className={buttonVariants({ size: "sm", variant: "secondary" })} href={`/invoices/${invoice.id}`}>
                      View
                    </Link>
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={`/invoices/${invoice.id}?mode=edit`}>
                      Edit
                    </Link>
                    {onDelete ? (
                      <Button onClick={() => onDelete(invoice.id)} size="sm" variant="destructive">
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
