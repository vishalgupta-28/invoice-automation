"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Invoice } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface PDFPreviewModalProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
}

export function PDFPreviewModal({ invoice, open, onClose }: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .getPdfBlob(invoice)
      .then((blob) => {
        if (!isMounted) return;
        const objectUrl = URL.createObjectURL(blob);
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to preview PDF");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [invoice, open]);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl]
  );

  return (
    <Modal className="max-w-5xl" onClose={onClose} open={open} title={`Invoice PDF - ${invoice.invoiceNumber}`}>
      <div className="space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Generating PDF preview...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {pdfUrl && !loading ? (
          <iframe className="h-[72vh] w-full rounded-md border border-border" src={pdfUrl} title="Invoice PDF Preview" />
        ) : null}
        <div className="flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
