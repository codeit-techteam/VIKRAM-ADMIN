"use client";

import { Upload, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterBar } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { SubModuleTabs } from "@/components/shared/SubModuleTabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductTable } from "@/features/catalog/components/ProductTable";
import {
  CATALOG_FILTER_OPTIONS,
  CATALOG_STAT_CARDS,
  CATALOG_SUB_MODULE_TABS,
  MOCK_PRODUCTS,
} from "@/features/catalog/constants/product.mock";
import type { Product } from "@/features/catalog/types/product.types";
import { cn } from "@/lib/utils";

const TOTAL_MOCK_ITEMS = 124;
const PAGE_SIZE = 4;

export function CatalogPageContent() {
  const [activeTab, setActiveTab] = useState("inventory");
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
    <div className="-mx-6 -mt-6 space-y-6">
      <div className="border-b border-gray-100 bg-white px-6 pt-4">
        <SubModuleTabs
          backHref="/customer-app-cms"
          backLabel="Construction CMS"
          tabs={CATALOG_SUB_MODULE_TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="space-y-6 px-6 pb-6">
        <PageHeader
          title="Product Catalog"
          titleClassName="text-primary"
          subtitle="Manage inventory, pricing, and distribution across regional hubs."
          actions={
            <>
              <Button variant="outline" size="lg" className="h-10 gap-2 px-4">
                <Upload className="size-4" />
                Export Catalog
              </Button>
              <Link
                href="/customer-app-cms/catalog/new"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-10 gap-2 px-4",
                )}
              >
                <Plus className="size-4" />
                Add New Product
              </Link>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Active SKUs"
            value={CATALOG_STAT_CARDS.totalActiveSkus}
          />
          <StatCard
            label="Low Stock Items"
            value={CATALOG_STAT_CARDS.lowStockItems}
            valueVariant="warning"
          />
          <StatCard
            label="Pending Pricing"
            value={CATALOG_STAT_CARDS.pendingPricing}
            subtext="Needs review"
          />
          <StatCard
            label="Top Category"
            value={CATALOG_STAT_CARDS.topCategory}
          />
        </div>

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
    </div>
  );
}
