import { Currency, InvoiceStatus } from "@/lib/types";

export interface InvoiceFormLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceFormValues {
  clientId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  tax: number;
  discount: number;
  notes: string;
  currency: Currency;
  lineItems: InvoiceFormLineItem[];
}
