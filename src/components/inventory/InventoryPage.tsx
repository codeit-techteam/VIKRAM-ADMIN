"use client";

import Link from "next/link";
import { Calendar, Download, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { InventoryDetailSheet } from "@/components/inventory/InventoryDetailSheet";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import {
  InventoryStatsCard,
  type InventoryStatKey,
} from "@/components/inventory/InventoryStatsCard";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";
import {
  computeInventoryStats,
  formatInventoryItemsCount,
  getAvailableStock,
  getInventoryStockStatus,
  INVENTORY_CATEGORY_FILTERS,
  INVENTORY_PAGE_SIZE,
} from "@/mock/inventory";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type {
  InventoryCategoryFilter,
  InventoryItem,
  InventoryStockStatus,
} from "@/types/inventory.types";
import { notify } from "@/utils/notify";

const CLICKABLE_STATS: InventoryStatKey[] = [
  "inventory-items",
  "low-stock-alerts",
  "out-of-stock-items",
];

const STAT_STATUS_MAP: Partial<
  Record<InventoryStatKey, InventoryStockStatus | null>
> = {
  "inventory-items": null,
  "low-stock-alerts": "low-stock",
  "out-of-stock-items": "out-of-stock",
};

function downloadInventoryCsv(items: InventoryItem[]) {
  const header = [
    "Product Name",
    "SKU",
    "Category",
    "Current Stock",
    "Reserved",
    "Available",
    "Minimum Stock",
    "Unit",
    "Purchase Price",
    "Status",
  ];

  const lines = items.map((item) => {
    const available = getAvailableStock(item);
    const status = getInventoryStockStatus(item);

    return [
      item.productName,
      item.sku,
      item.category,
      item.currentStock,
      item.committedStock,
      available,
      item.minimumStock,
      item.unit,
      item.purchasePrice,
      status,
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(",");
  });

  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `central-warehouse-inventory-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function InventoryPage() {
  const searchParams = useSearchParams();
  const inventoryItems = useWarehouseErpStore((state) => state.inventory);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<InventoryCategoryFilter["slug"]>("all");
  const [activeStat, setActiveStat] = useState<InventoryStatKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchParams.get("alert") === "low-stock") {
      setActiveStat("low-stock-alerts");
      setCurrentPage(1);
    }
  }, [searchParams]);

  const stats = useMemo(
    () => computeInventoryStats(inventoryItems),
    [inventoryItems],
  );

  const statCards = useMemo(
    () => [
      {
        id: "inventory-items" as const,
        label: "Inventory Items",
        value: formatInventoryItemsCount(stats.inventoryItems),
        subtitle: "Total active inventory products",
        variant: "default" as const,
      },
      {
        id: "low-stock-alerts" as const,
        label: "Low Stock Alerts",
        value: String(stats.lowStockAlerts).padStart(2, "0"),
        variant: "warning" as const,
      },
      {
        id: "out-of-stock-items" as const,
        label: "Out of Stock Items",
        value: String(stats.outOfStockItems).padStart(2, "0"),
        variant: "warning" as const,
      },
      {
        id: "total-stock-value" as const,
        label: "Total Stock Value",
        value: stats.totalStockValue,
        variant: "default" as const,
      },
    ],
    [stats],
  );

  const categoryFilteredItems = useMemo(() => {
    if (activeCategory === "all") {
      return inventoryItems;
    }

    return inventoryItems.filter(
      (item) => item.categorySlug === activeCategory,
    );
  }, [activeCategory, inventoryItems]);

  const filteredItems = useMemo(() => {
    const statusFilter = activeStat ? STAT_STATUS_MAP[activeStat] : undefined;

    if (!statusFilter) {
      return categoryFilteredItems;
    }

    return categoryFilteredItems.filter(
      (item) => getInventoryStockStatus(item) === statusFilter,
    );
  }, [activeStat, categoryFilteredItems]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * INVENTORY_PAGE_SIZE;
    return filteredItems.slice(start, start + INVENTORY_PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const totalFilteredItems = filteredItems.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredItems / INVENTORY_PAGE_SIZE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleCategoryChange = (slug: InventoryCategoryFilter["slug"]) => {
    setActiveCategory(slug);
    setActiveStat(null);
    setCurrentPage(1);
  };

  const handleStatClick = (statId: InventoryStatKey) => {
    if (!CLICKABLE_STATS.includes(statId)) return;

    if (statId === "inventory-items") {
      setActiveStat(null);
    } else {
      setActiveStat((current) => (current === statId ? null : statId));
    }
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExportCsv = () => {
    downloadInventoryCsv(filteredItems);
    notify.success(
      "Export started",
      `${filteredItems.length} inventory item${filteredItems.length === 1 ? "" : "s"} exported as CSV.`,
    );
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    void item;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory Management - Central Warehouse"
        breadcrumbs={getNavBreadcrumbsFromPath("/central-warehouse/inventory")}
        actions={
          <>
            <Button variant="outline" className="h-10 gap-2 px-4">
              <Calendar className="size-4" />
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-4"
              onClick={handleExportCsv}
              disabled={filteredItems.length === 0}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button
              className="h-10 gap-2 px-4"
              render={
                <Link
                  href={`${ROUTES.CENTRAL_WAREHOUSE}/inventory/add-material`}
                />
              }
            >
              <Plus className="size-4" />
              Add New Material
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <InventoryStatsCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            isActive={activeStat === stat.id}
            onClick={
              CLICKABLE_STATS.includes(stat.id)
                ? () => handleStatClick(stat.id)
                : undefined
            }
          />
        ))}
      </div>

      <div className="space-y-4">
        <InventoryTable
          items={paginatedItems}
          isLoading={isLoading}
          currentPage={currentPage}
          totalItems={totalFilteredItems}
          pageSize={INVENTORY_PAGE_SIZE}
          onPageChange={setCurrentPage}
          onViewItem={handleViewItem}
          onEditItem={handleEditItem}
          header={
            <InventoryFilters
              categories={INVENTORY_CATEGORY_FILTERS}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              onAdvancedFilter={() => {}}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          }
        />
      </div>

      <InventoryDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedItem}
      />
    </div>
  );
}
