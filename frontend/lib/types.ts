export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";
export type Currency = "USD" | "INR" | "EUR";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  invoiceId?: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
  currency: Currency;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  lineItems?: LineItem[];
  payments?: Payment[];
}

export interface DashboardSummary {
  totalRevenue: number;
  unpaid: number;
  overdue: number;
  drafts: number;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface SendEmailPayload {
  recipientEmail: string;
  clientName: string;
  invoiceNumber: string;
  dueDate: string;
  total: number;
  pdfBase64: string;
}
