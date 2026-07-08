"use client";

import { FileSpreadsheet, Filter, PackagePlus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { FormSectionCard } from "@/components/shared/FormSectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HubFormSchema } from "@/schema/hub-form.schema";
import { useHubDraftStore } from "@/store/hub-draft-store";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

const CATEGORY_COLORS: Record<string, string> = {
  "Cementing Materials": "bg-blue-50 text-blue-700",
  "Structural Steel": "bg-amber-50 text-amber-800",
  "Masonry & Blockwork": "bg-purple-50 text-purple-700",
  "Paints & Coatings": "bg-rose-50 text-rose-700",
  Electricals: "bg-teal-50 text-teal-700",
};

export function HubInventoryStep() {
  const { control, setValue } = useFormContext<HubFormSchema>();
  const updateInventory = useHubDraftStore((s) => s.updateInventory);
  const skus = useWatch({ control, name: "inventory.skus" }) ?? [];
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return skus;
    return skus.filter(
      (sku) =>
        sku.sku.toLowerCase().includes(query) ||
        sku.productName.toLowerCase().includes(query) ||
        sku.category.toLowerCase().includes(query),
    );
  }, [skus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateSku = (id: string, patch: Partial<(typeof skus)[number]>) => {
    const next = skus.map((sku) =>
      sku.id === id ? { ...sku, ...patch } : sku,
    );
    setValue("inventory.skus", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
    updateInventory({ skus: next });
  };

  const selectedCount = skus.filter((sku) => sku.selected).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Inventory Allocation
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Configure your regional hub stock levels and vendor logistics
            sourcing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2"
            onClick={() =>
              notify.info(
                "Import queued",
                "Excel import will sync SKUs into this draft.",
              )
            }
          >
            <FileSpreadsheet className="size-4" />
            Import Excel
          </Button>
          <Button
            type="button"
            className="h-10 gap-2"
            onClick={() =>
              notify.success(
                "SKU picker",
                "Select rows below or import from catalog.",
              )
            }
          >
            <PackagePlus className="size-4" />
            Add SKU
          </Button>
        </div>
      </div>

      <FormSectionCard
        icon={PackagePlus}
        title="SKU Configuration"
        headerAction={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                const next = skus.map((sku) => ({ ...sku, selected: false }));
                setValue("inventory.skus", next);
                updateInventory({ skus: next });
              }}
            >
              <Trash2 className="size-4 text-gray-400" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm">
              <Filter className="size-4 text-gray-400" />
            </Button>
          </div>
        }
      >
        <div className="mb-4">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search SKU, product, or category..."
            className="h-10 max-w-md"
          />
          <p className="mt-2 text-xs text-gray-500">
            {selectedCount} selected · Creates hub inventory rows on publish
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs tracking-wider text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-3"> </th>
                <th className="px-3 py-3">SKU ID</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Product Name</th>
                <th className="px-3 py-3">Variant</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Reorder</th>
                <th className="px-3 py-3">Min Stock</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((sku) => {
                const isCritical = sku.openingStock < sku.safetyStock;
                return (
                  <tr
                    key={sku.id}
                    className={cn(
                      "border-t border-gray-100",
                      isCritical && "bg-rose-50/70",
                    )}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={sku.selected}
                        onChange={(event) =>
                          updateSku(sku.id, { selected: event.target.checked })
                        }
                        className="accent-primary size-4"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-[#1A1A1A]">
                      {sku.sku}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          CATEGORY_COLORS[sku.category] ??
                            "bg-gray-100 text-gray-700",
                        )}
                      >
                        {sku.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#1A1A1A]">
                      {sku.productName}
                    </td>
                    <td className="px-3 py-3 text-gray-500">{sku.variant}</td>
                    <td className="px-3 py-3 text-gray-500">{sku.unit}</td>
                    <td className="px-3 py-3">
                      <Input
                        type="number"
                        className={cn(
                          "h-8 w-20",
                          isCritical && "font-semibold text-rose-600",
                        )}
                        value={sku.openingStock}
                        onChange={(event) =>
                          updateSku(sku.id, {
                            openingStock: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Input
                        type="number"
                        className="h-8 w-20"
                        value={sku.reorderLevel}
                        onChange={(event) =>
                          updateSku(sku.id, {
                            reorderLevel: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Input
                        type="number"
                        className="h-8 w-20"
                        value={sku.safetyStock}
                        onChange={(event) =>
                          updateSku(sku.id, {
                            safetyStock: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing {pageRows.length} of {filtered.length} SKU records
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(1)}
            >
              First
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="text-sm font-medium">{page}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              Last
            </Button>
          </div>
        </div>
      </FormSectionCard>
    </div>
  );
}
