"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterBar } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { buttonVariants } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ProductTable } from "@/features/catalog/components/ProductTable";
import {
  CATALOG_FILTER_OPTIONS,
  MOCK_PRODUCTS,
} from "@/features/catalog/constants/product.mock";
import type { Product } from "@/features/catalog/types/product.types";
import { cn } from "@/lib/utils";

const TOTAL_MOCK_ITEMS = 124;
const PAGE_SIZE = 4;

export function CatalogPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [appliedCategory, setAppliedCategory] = useState("all");
  const [appliedBrand, setAppliedBrand] = useState("all");
  const [appliedAvailability, setAppliedAvailability] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        appliedSearch === "" ||
        product.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(appliedSearch.toLowerCase());

      const matchesCategory =
        appliedCategory === "all" ||
        product.category.toLowerCase() === appliedCategory;

      const matchesBrand =
        appliedBrand === "all" ||
        product.brand.toLowerCase().replace(/\s+/g, "-") === appliedBrand;

      const matchesAvailability =
        appliedAvailability === "all" ||
        (appliedAvailability === "in-stock" && product.stockUnits > 20) ||
        (appliedAvailability === "low-stock" &&
          product.stockUnits > 0 &&
          product.stockUnits <= 20) ||
        (appliedAvailability === "out-of-stock" && product.stockUnits === 0);

      return (
        matchesSearch && matchesCategory && matchesBrand && matchesAvailability
      );
    });
  }, [
    products,
    appliedSearch,
    appliedCategory,
    appliedBrand,
    appliedAvailability,
  ]);

  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedCategory(category);
    setAppliedBrand(brand);
    setAppliedAvailability(availability);
    setCurrentPage(1);
  };

  const handleLiveToggle = (productId: string, isLive: boolean) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, isLive } : product,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
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
            options: [...CATALOG_FILTER_OPTIONS.categories],
            value: category,
            onChange: setCategory,
          },
          {
            label: "BRAND",
            options: [...CATALOG_FILTER_OPTIONS.brands],
            value: brand,
            onChange: setBrand,
          },
          {
            label: "AVAILABILITY",
            options: [...CATALOG_FILTER_OPTIONS.availability],
            value: availability,
            onChange: setAvailability,
          },
        ]}
        onApply={handleApplyFilters}
      />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <ProductTable
          products={filteredProducts}
          onLiveToggle={handleLiveToggle}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(TOTAL_MOCK_ITEMS / PAGE_SIZE)}
          pageSize={PAGE_SIZE}
          totalItems={TOTAL_MOCK_ITEMS}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
