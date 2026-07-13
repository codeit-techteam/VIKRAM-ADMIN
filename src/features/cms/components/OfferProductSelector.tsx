"use client";

import Image from "next/image";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatOfferPrice,
  OFFER_PRODUCT_CATALOG,
} from "@/features/cms/constants/offer.mock";
import type { OfferProduct } from "@/features/cms/types/offer.types";
import { cn } from "@/lib/utils";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

interface OfferProductSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export function OfferProductSelector({
  selectedIds,
  onChange,
  error,
}: OfferProductSelectorProps) {
  const [search, setSearch] = useState("");

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => OFFER_PRODUCT_CATALOG.find((product) => product.id === id))
        .filter((product): product is OfferProduct => Boolean(product)),
    [selectedIds],
  );

  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return OFFER_PRODUCT_CATALOG;
    return OFFER_PRODUCT_CATALOG.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query),
    );
  }, [search]);

  const toggleProduct = (productId: string) => {
    if (selectedIds.includes(productId)) {
      onChange(selectedIds.filter((id) => id !== productId));
      return;
    }
    onChange([...selectedIds, productId]);
  };

  const removeProduct = (productId: string) => {
    onChange(selectedIds.filter((id) => id !== productId));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label className={fieldLabelClassName}>Search Products</Label>
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, SKU, brand..."
              className="h-9 border-gray-200 bg-white pl-9 text-sm"
            />
          </div>
        </div>
        <p className="text-sm font-medium text-[#1A1A1A]">
          {selectedIds.length} product{selectedIds.length === 1 ? "" : "s"}{" "}
          selected
        </p>
      </div>

      {selectedProducts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product) => (
            <span
              key={product.id}
              className="inline-flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 px-2.5 py-1.5 text-sm text-[#1A1A1A]"
            >
              <span className="relative size-6 overflow-hidden rounded bg-white">
                <Image
                  src={product.thumbnailUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </span>
              <span className="max-w-[140px] truncate font-medium">
                {product.name}
              </span>
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Remove ${product.name}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-100">
        {filteredCatalog.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#64748B]">
            No products match your search.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredCatalog.map((product) => {
              const isSelected = selectedIds.includes(product.id);

              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                      isSelected && "bg-orange-50/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white",
                      )}
                      aria-hidden
                    >
                      {isSelected ? (
                        <span className="text-[10px] font-bold">✓</span>
                      ) : null}
                    </span>
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={product.thumbnailUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-[#1A1A1A]">
                        {product.name}
                      </span>
                      <span className="block text-xs text-[#64748B]">
                        {product.sku} · {product.brand} · {product.category}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium text-[#1A1A1A]">
                      {formatOfferPrice(product.price, product.priceUnit)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedProducts.length > 0 ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => onChange([])}
          >
            Clear selection
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
