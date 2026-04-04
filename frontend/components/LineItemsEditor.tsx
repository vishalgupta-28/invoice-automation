"use client";

import type { FieldArrayWithId, FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove, UseFormRegister } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { InvoiceFormValues } from "@/lib/form-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LineItemsEditorProps {
  fields: FieldArrayWithId<InvoiceFormValues, "lineItems", "id">[];
  register: UseFormRegister<InvoiceFormValues>;
  remove: UseFieldArrayRemove;
  append: UseFieldArrayAppend<InvoiceFormValues, "lineItems">;
  lineItems: InvoiceFormValues["lineItems"];
  errors: FieldErrors<InvoiceFormValues>;
}

export function LineItemsEditor({ fields, register, remove, append, lineItems, errors }: LineItemsEditorProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[680px] border-collapse">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit Price</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
              <th className="w-16 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr className="border-t border-border" key={field.id}>
                <td className="p-2">
                  <Input {...register(`lineItems.${index}.description` as const)} placeholder="Service / product description" />
                  {errors.lineItems?.[index]?.description ? (
                    <p className="mt-1 text-xs text-red-600">{errors.lineItems[index]?.description?.message}</p>
                  ) : null}
                </td>
                <td className="p-2">
                  <Input
                    {...register(`lineItems.${index}.quantity` as const, { valueAsNumber: true })}
                    className="text-right"
                    min={1}
                    step={1}
                    type="number"
                  />
                  {errors.lineItems?.[index]?.quantity ? (
                    <p className="mt-1 text-xs text-red-600">{errors.lineItems[index]?.quantity?.message}</p>
                  ) : null}
                </td>
                <td className="p-2">
                  <Input
                    {...register(`lineItems.${index}.unitPrice` as const, { valueAsNumber: true })}
                    className="text-right"
                    min={0}
                    step={0.01}
                    type="number"
                  />
                  {errors.lineItems?.[index]?.unitPrice ? (
                    <p className="mt-1 text-xs text-red-600">{errors.lineItems[index]?.unitPrice?.message}</p>
                  ) : null}
                </td>
                <td className="p-2">
                  <Input
                    {...register(`lineItems.${index}.amount` as const, { valueAsNumber: true })}
                    className="text-right font-medium"
                    readOnly
                    type="number"
                  />
                </td>
                <td className="p-2 text-right">
                  <Button
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{lineItems.length} line item(s)</p>
        <Button
          onClick={() => append({ description: "", quantity: 1, unitPrice: 0, amount: 0 })}
          type="button"
          variant="secondary"
        >
          Add Line Item
        </Button>
      </div>
    </div>
  );
}
