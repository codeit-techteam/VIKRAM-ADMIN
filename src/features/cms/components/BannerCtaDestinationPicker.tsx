"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATALOG_HOME_PATH,
  type BannerCtaDestination,
} from "@/features/cms/schema/banner-form.schema";
import { getOfferProductsCatalog } from "@/features/cms/services/offer.mock-api";
import type { OfferProduct } from "@/features/cms/types/offer.types";
import { cn } from "@/lib/utils";
import {
  catalogService,
  type CatalogCategory,
} from "@/services/catalog.service";
import { notify } from "@/utils/notify";

export interface BannerCtaValue {
  ctaDestination: BannerCtaDestination;
  linkType: string;
  ctaPath: string;
  ctaTargetLabel?: string;
}

interface BannerCtaDestinationPickerProps {
  value: BannerCtaValue;
  onChange: (next: BannerCtaValue) => void;
  error?: string;
}

const DESTINATION_OPTIONS: Array<{
  value: BannerCtaDestination;
  label: string;
  hint: string;
}> = [
  {
    value: "CATALOG",
    label: "Catalog home",
    hint: "Opens the main Catalog tab",
  },
  {
    value: "CATEGORY",
    label: "Category",
    hint: "Opens a product category listing",
  },
  {
    value: "PRODUCT",
    label: "Product",
    hint: "Opens a specific product page",
  },
  {
    value: "CUSTOM",
    label: "Custom path",
    hint: "Advanced — only if you know the app route",
  },
];

function categoryTarget(category: CatalogCategory): string {
  return (category.slug || category.id).trim();
}

export function BannerCtaDestinationPicker({
  value,
  onChange,
  error,
}: BannerCtaDestinationPickerProps) {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<OfferProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingCategories(true);
    catalogService
      .listCategories()
      .then((items) => {
        if (!cancelled) {
          setCategories(
            items
              .filter((c) => c.isVisible !== false && c.status !== "INACTIVE")
              .sort(
                (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
              ),
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          notify.error(
            err instanceof Error ? err.message : "Failed to load categories",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (value.ctaDestination !== "PRODUCT") return;
    let cancelled = false;
    setLoadingProducts(true);
    getOfferProductsCatalog()
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch((err) => {
        if (!cancelled) {
          notify.error(
            err instanceof Error ? err.message : "Failed to load products",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProducts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [value.ctaDestination]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query),
    );
  }, [productSearch, products]);

  const selectedProduct = useMemo(
    () =>
      products.find(
        (p) =>
          p.id === value.ctaPath ||
          (p.slug && p.slug === value.ctaPath),
      ) ?? null,
    [products, value.ctaPath],
  );

  const productTarget = (product: OfferProduct) =>
    (product.slug || product.id).trim();

  const applyDestination = (destination: BannerCtaDestination) => {
    if (destination === "CATALOG") {
      onChange({
        ctaDestination: "CATALOG",
        linkType: "ROUTE",
        ctaPath: CATALOG_HOME_PATH,
        ctaTargetLabel: "Catalog",
      });
      return;
    }
    if (destination === "CATEGORY") {
      onChange({
        ctaDestination: "CATEGORY",
        linkType: "CATEGORY",
        ctaPath: "",
        ctaTargetLabel: "",
      });
      return;
    }
    if (destination === "PRODUCT") {
      onChange({
        ctaDestination: "PRODUCT",
        linkType: "PRODUCT",
        ctaPath: "",
        ctaTargetLabel: "",
      });
      return;
    }
    onChange({
      ctaDestination: "CUSTOM",
      linkType: "ROUTE",
      ctaPath: value.ctaPath.startsWith("/") ? value.ctaPath : "",
      ctaTargetLabel: "",
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Shop Now goes to</Label>
        <Select
          value={value.ctaDestination}
          onValueChange={(next) => {
            if (!next) return;
            applyDestination(next as BannerCtaDestination);
          }}
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Choose destination" />
          </SelectTrigger>
          <SelectContent>
            {DESTINATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {
            DESTINATION_OPTIONS.find((o) => o.value === value.ctaDestination)
              ?.hint
          }
        </p>
      </div>

      {value.ctaDestination === "CATALOG" ? (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-900">
          Customers will open the Catalog tab when they tap Shop Now.
        </div>
      ) : null}

      {value.ctaDestination === "CATEGORY" ? (
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={value.ctaPath || undefined}
            onValueChange={(next) => {
              if (!next) return;
              const category = categories.find(
                (c) => categoryTarget(c) === next || c.id === next,
              );
              const target = category ? categoryTarget(category) : next;
              onChange({
                ctaDestination: "CATEGORY",
                linkType: "CATEGORY",
                ctaPath: target,
                ctaTargetLabel: category?.name || target,
              });
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue
                placeholder={
                  loadingCategories ? "Loading categories…" : "Select category"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={categoryTarget(category)}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {value.ctaDestination === "PRODUCT" ? (
        <div className="space-y-2">
          <Label>Product</Label>
          {selectedProduct ? (
            <div className="flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-white">
                <Image
                  src={selectedProduct.thumbnailUrl}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1A1A1A]">
                  {selectedProduct.name}
                </p>
                <p className="truncate text-xs text-[#64748B]">
                  {selectedProduct.sku} · {selectedProduct.brand}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-orange-700 hover:underline"
                onClick={() =>
                  onChange({
                    ctaDestination: "PRODUCT",
                    linkType: "PRODUCT",
                    ctaPath: "",
                    ctaTargetLabel: "",
                  })
                }
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products by name or SKU…"
                  className="h-9 pl-9"
                />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100">
                {loadingProducts ? (
                  <p className="px-4 py-6 text-center text-sm text-[#64748B]">
                    Loading products…
                  </p>
                ) : filteredProducts.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-[#64748B]">
                    No products found.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filteredProducts.slice(0, 40).map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() =>
                            onChange({
                              ctaDestination: "PRODUCT",
                              linkType: "PRODUCT",
                              ctaPath: productTarget(product),
                              ctaTargetLabel: product.name,
                            })
                          }
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50",
                          )}
                        >
                          <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={product.thumbnailUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-[#1A1A1A]">
                              {product.name}
                            </span>
                            <span className="block truncate text-xs text-[#64748B]">
                              {product.sku} · {product.category}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}

      {value.ctaDestination === "CUSTOM" ? (
        <div className="space-y-1.5">
          <Label htmlFor="banner-custom-path">Custom app path</Label>
          <Input
            id="banner-custom-path"
            value={value.ctaPath}
            onChange={(event) =>
              onChange({
                ctaDestination: "CUSTOM",
                linkType: "ROUTE",
                ctaPath: event.target.value,
                ctaTargetLabel: "",
              })
            }
            placeholder="/(tabs)/catalog"
          />
          <p className="text-xs text-muted-foreground">
            Examples: /(tabs)/catalog, /membership, /bulk-procurement
          </p>
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
