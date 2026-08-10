"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FilterBar } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { buttonVariants } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ProductTable } from "@/features/catalog/components/ProductTable";
import type { Product } from "@/features/catalog/types/product.types";
import {
  catalogService,
  type CatalogCategory,
  type CatalogProduct,
} from "@/services/catalog.service";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

const PAGE_SIZE = 10;

function mapProduct(row: CatalogProduct): Product {
  const price = Number(row.retailPrice ?? 0);
  const stock = row.stockLeft ?? 0;
  const isLive = row.entityStatus === "ACTIVE" && row.isVisible !== false;
  let status: Product["status"] = "DRAFT";
  if (isLive && stock <= 20 && stock > 0) status = "LOW_STOCK";
  else if (isLive) status = "LIVE";

  const urls = (row.images ?? [])
    .map((img) => img.url?.trim())
    .filter((url): url is string => Boolean(url) && url.startsWith("http"));
  const primary =
    row.images?.find((img) => img.isPrimary && img.url?.startsWith("http"))
      ?.url ||
    urls.find((url) => url.includes("r2.dev")) ||
    urls[0] ||
    "";

  return {
    id: row.id,
    thumbnailUrl: primary,
    name: row.name,
    sku: row.sku || "—",
    brand: row.brand || "—",
    category: row.category?.name || "Uncategorized",
    price,
    priceUnit: row.unit || "Bag",
    stockUnits: stock,
    status,
    isLive,
  };
}

export function CatalogPageContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [appliedCategory, setAppliedCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [productPage, cats] = await Promise.all([
        catalogService.listProducts({
          page: currentPage,
          limit: PAGE_SIZE,
          search: appliedSearch || undefined,
          categoryId: appliedCategory !== "all" ? appliedCategory : undefined,
        }),
        catalogService.listCategories(),
      ]);
      setCategories(cats);
      let mapped = productPage.data.map(mapProduct);
      if (availability === "in-stock") {
        mapped = mapped.filter((p) => p.stockUnits > 20);
      } else if (availability === "low-stock") {
        mapped = mapped.filter((p) => p.stockUnits > 0 && p.stockUnits <= 20);
      } else if (availability === "out-of-stock") {
        mapped = mapped.filter((p) => p.stockUnits === 0);
      }
      setProducts(mapped);
      setTotalItems(productPage.meta.total);
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to load products",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, appliedCategory, availability, currentPage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const categoryOptions = useMemo(
    () => [
      { label: "All Categories", value: "all" },
      ...categories.map((c) => ({ label: c.name, value: c.id })),
    ],
    [categories],
  );

  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedCategory(category);
    setCurrentPage(1);
  };

  const handleLiveToggle = async (productId: string, isLive: boolean) => {
    try {
      await catalogService.updateProduct(productId, {
        entityStatus: isLive ? "ACTIVE" : "INACTIVE",
        isVisible: isLive,
      });
      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                isLive,
                status: isLive
                  ? product.stockUnits <= 20
                    ? "LOW_STOCK"
                    : "LIVE"
                  : "DRAFT",
              }
            : product,
        ),
      );
      notify.success(isLive ? "Product published" : "Product unpublished");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to update product",
      );
    }
  };

  const handleEdit = (productId: string) => {
    router.push(`/customer-app-cms/catalog/${productId}/edit`);
  };

  const handleDelete = async (productId: string) => {
    const product = products.find((item) => item.id === productId);
    const confirmed = window.confirm(
      `Delete “${product?.name ?? "this product"}”? It will be removed from the Customer App.`,
    );
    if (!confirmed) return;

    try {
      await catalogService.deleteProduct(productId);
      notify.success("Product deleted");
      await refresh();
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Categories"
        titleClassName="text-primary"
        subtitle="Manage inventory, pricing, and distribution across regional hubs."
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms/catalog")}
        actions={
          <Link
            href="/customer-app-cms/catalog/new"
            className={cn(buttonVariants({ size: "lg" }), "h-10 gap-2 px-4")}
          >
            <Plus className="size-4" />
            Add New Product
          </Link>
        }
      />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            label: "CATEGORY",
            options: categoryOptions,
            value: category,
            onChange: setCategory,
          },
          {
            label: "AVAILABILITY",
            options: [
              { label: "All", value: "all" },
              { label: "In Stock", value: "in-stock" },
              { label: "Low Stock", value: "low-stock" },
              { label: "Out of Stock", value: "out-of-stock" },
            ],
            value: availability,
            onChange: setAvailability,
          },
        ]}
        onApply={handleApplyFilters}
      />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <p className="text-muted-foreground p-6 text-sm">Loading products…</p>
        ) : (
          <ProductTable
            products={products}
            onLiveToggle={(id, live) => void handleLiveToggle(id, live)}
            onEdit={handleEdit}
            onDelete={(id) => void handleDelete(id)}
          />
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(totalItems / PAGE_SIZE))}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
