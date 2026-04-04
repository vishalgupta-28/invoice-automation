"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Client } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ClientSelectorProps {
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
  error?: string;
}

export function ClientSelector({ clients, value, onChange, error }: ClientSelectorProps) {
  const [query, setQuery] = useState("");

  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return clients;
    return clients.filter((client) =>
      [client.name, client.email, client.phone ?? "", client.taxId ?? ""].join(" ").toLowerCase().includes(normalized)
    );
  }, [clients, query]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients by name, email, phone"
          value={query}
        />
      </div>
      <div className={cn("max-h-56 overflow-auto rounded-lg border border-border bg-white", error ? "border-red-400" : "")}>
        {filteredClients.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">No matching clients found.</p>
        ) : (
          filteredClients.map((client) => {
            const selected = client.id === value;
            return (
              <button
                className={cn(
                  "flex w-full items-center justify-between border-b border-border/60 px-3 py-2 text-left transition hover:bg-muted/50",
                  selected ? "bg-accent" : "",
                  "last:border-b-0"
                )}
                key={client.id}
                onClick={() => onChange(client.id)}
                type="button"
              >
                <div>
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.email}</p>
                </div>
                {selected ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
            );
          })
        )}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
