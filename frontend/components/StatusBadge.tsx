import { InvoiceStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: InvoiceStatus;
}

const statusVariant: Record<InvoiceStatus, "secondary" | "warning" | "success" | "danger"> = {
  DRAFT: "secondary",
  SENT: "warning",
  PAID: "success",
  OVERDUE: "danger"
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
