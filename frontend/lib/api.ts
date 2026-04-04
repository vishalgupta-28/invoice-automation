import type {
  Client,
  Invoice,
  SendEmailPayload
} from "@/lib/types";
import type { CreateClientInput, CreateInvoiceInput, UpdateInvoiceInput } from "@/lib/validations";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? "Request failed");
  }
  return (await response.json()) as T;
}

export const api = {
  async getInvoices(): Promise<Invoice[]> {
    const response = await fetch("/api/invoices", { cache: "no-store" });
    return parseResponse<Invoice[]>(response);
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await fetch(`/api/invoices/${id}`, { cache: "no-store" });
    return parseResponse<Invoice>(response);
  },

  async createInvoice(payload: CreateInvoiceInput): Promise<Invoice> {
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse<Invoice>(response);
  },

  async updateInvoice(id: string, payload: UpdateInvoiceInput): Promise<Invoice> {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse<Invoice>(response);
  },

  async deleteInvoice(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    return parseResponse<{ success: boolean }>(response);
  },

  async getClients(): Promise<Client[]> {
    const response = await fetch("/api/clients", { cache: "no-store" });
    return parseResponse<Client[]>(response);
  },

  async createClient(payload: CreateClientInput): Promise<Client> {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse<Client>(response);
  },

  async getPdfBlob(invoice: Invoice): Promise<Blob> {
    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice)
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Failed to generate PDF");
    }

    return response.blob();
  },

  async sendInvoiceEmail(payload: SendEmailPayload): Promise<{ success: boolean }> {
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse<{ success: boolean }>(response);
  }
};
