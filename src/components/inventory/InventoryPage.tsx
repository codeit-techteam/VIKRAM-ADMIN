"use client";

import Link from "next/link";
import { Calendar, Download, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";

import { ConfirmationDialog } from "@/components/allocation/ConfirmationDialog";
import { InventoryAdjustDialog } from "@/components/inventory/InventoryAdjustDialog";
import {
  InventoryAdvancedFilterDialog,
  type InventoryAdvancedFilters,
} from "@/components/inventory/InventoryAdvancedFilterDialog";
import { InventoryDetailSheet } from "@/components/inventory/InventoryDetailSheet";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import {
  InventoryStatsCard,
  type InventoryStatKey,
} from "@/components/inventory/InventoryStatsCard";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateTransferDialog } from "@/components/transfers/CreateTransferDialog";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";
import {
  computeInventoryStats,
  formatInventoryItemsCount,
  getAvailableStock,
  getInventoryStockStatus,
  INVENTORY_PAGE_SIZE,
} from "@/mock/inventory";
import { catalogService } from "@/services/catalog.service";
import { warehouseService } from "@/services/warehouse";
import type {
  InventoryCategoryFilter,
  InventoryItem,
  InventoryStockStatus,
} from "@/types/inventory.types";
import { notify } from "@/utils/notify";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

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

function slugifyCategory(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<
    InventoryCategoryFilter[]
  >([{ id: "all", label: "All Categories", slug: "all" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<InventoryCategoryFilter["slug"]>("all");
  const [activeStat, setActiveStat] = useState<InventoryStatKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const loadInventory = useCallback(async (background = false) => {
    if (background) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const [result, categories] = await Promise.all([
        warehouseService.listInventory({
          page: 1,
          limit: 10000,
        }),
        catalogService.listCategories().catch(() => []),
      ]);
      setInventoryItems(result.data);

      const inventorySlugs = new Set(
        result.data
          .map((item) => item.categorySlug)
          .filter((slug): slug is string => Boolean(slug)),
      );

      const fromCatalog: InventoryCategoryFilter[] = categories
        .filter((category) => category.isVisible !== false)
        .map((category) => {
          const slug =
            category.slug?.trim() ||
            slugifyCategory(category.name) ||
            category.id;
          return {
            id: category.id,
            label: category.name,
            slug,
          };
        })
        .filter((category) => inventorySlugs.has(category.slug))
        .sort((a, b) => a.label.localeCompare(b.label));

      // Fallback: derive tabs from inventory when catalog has no matching slugs
      const fromInventory: InventoryCategoryFilter[] = Array.from(
        result.data.reduce((map, item) => {
          if (!item.categorySlug || map.has(item.categorySlug)) return map;
          map.set(item.categorySlug, {
            id: item.categorySlug,
            label: item.category || item.categorySlug,
            slug: item.categorySlug,
          });
          return map;
        }, new Map<string, InventoryCategoryFilter>()),
      )
        .map(([, filter]) => filter)
        .sort((a, b) => a.label.localeCompare(b.label));

      setCategoryFilters([
        { id: "all", label: "All Categories", slug: "all" },
        ...(fromCatalog.length > 0 ? fromCatalog : fromInventory),
      ]);
      setLoadError(null);
    } catch {
      setLoadError("Unable to load warehouse inventory.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
    const interval = window.setInterval(() => void loadInventory(true), 30000);
    const onFocus = () => void loadInventory(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadInventory]);

  useEffect(() => {
    const status = searchParams.get("status");
    if (searchParams.get("alert") === "low-stock" || status === "LOW_STOCK") {
      setActiveStat("low-stock-alerts");
      setCurrentPage(1);
    } else if (status === "OUT_OF_STOCK") {
      setActiveStat("out-of-stock-items");
      setCurrentPage(1);
    }
  }, [searchParams]);

  const stats = useMemo(
    () => computeInventoryStats(inventoryItems, inventoryItems.length),
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
    const statusFilter = inStockOnly
      ? "in-stock"
      : activeStat
        ? STAT_STATUS_MAP[activeStat]
        : undefined;
    const query = searchQuery.trim().toLowerCase();

    return categoryFilteredItems.filter((item) => {
      const matchesStatus =
        !statusFilter || getInventoryStockStatus(item) === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        item.productName.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [activeStat, categoryFilteredItems, inStockOnly, searchQuery]);

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

  useEffect(() => {
    if (
      activeCategory !== "all" &&
      !categoryFilters.some((category) => category.slug === activeCategory)
    ) {
      setActiveCategory("all");
    }
  }, [activeCategory, categoryFilters]);

  const handleCategoryChange = (slug: InventoryCategoryFilter["slug"]) => {
    setActiveCategory(slug);
    setActiveStat(null);
    setInStockOnly(false);
    setCurrentPage(1);
  };

  const handleStatClick = (statId: InventoryStatKey) => {
    if (!CLICKABLE_STATS.includes(statId)) return;

    setInStockOnly(false);
    if (statId === "inventory-items") {
      setActiveStat(null);
    } else {
      setActiveStat((current) => (current === statId ? null : statId));
    }
    setCurrentPage(1);
  };

  const handleRefresh = () => void loadInventory(true);

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailOpen(false);
    setAdjustOpen(true);
  };

  const handleTransferItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailOpen(false);
    setTransferOpen(true);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };

  const handleAdjustConfirm = async (payload: {
    availableQty: number;
    minimumStock: number;
    remarks: string;
  }) => {
    if (!selectedItem?.productId) {
      notify.error("Unable to update inventory", "Product id is missing.");
      return;
    }

    setIsSaving(true);
    try {
      await warehouseService.adjustInventory({
        productId: selectedItem.productId,
        availableQty: payload.availableQty,
        minimumStock: payload.minimumStock,
        lowStockThreshold: payload.minimumStock,
        remarks: payload.remarks,
      });
      notify.success(
        "Inventory updated",
        `${selectedItem.productName} stock was saved.`,
      );
      setSelectedItem((current) =>
        current
          ? {
              ...current,
              availableStock: payload.availableQty,
              currentStock: payload.availableQty + current.committedStock,
              minimumStock: payload.minimumStock,
            }
          : current,
      );
      setAdjustOpen(false);
      await loadInventory(true);
    } catch (error) {
      notify.error(
        "Unable to update inventory",
        getApiErrorMessage(error, "Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem?.productId) {
      notify.error("Unable to delete SKU", "Product id is missing.");
      return;
    }

    setIsDeleting(true);
    try {
      await catalogService.deleteProduct(selectedItem.productId);
      notify.success(
        "SKU removed",
        `${selectedItem.productName} was deleted from inventory.`,
      );
      setDeleteOpen(false);
      setDetailOpen(false);
      setSelectedItem(null);
      await loadInventory(true);
    } catch (error) {
      notify.error(
        "Unable to delete SKU",
        getApiErrorMessage(error, "Please try again."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const advancedFilters: InventoryAdvancedFilters = {
    search: searchQuery,
    status: inStockOnly
      ? "in-stock"
      : ((activeStat ? STAT_STATUS_MAP[activeStat] : null) ?? "all"),
  };

  const handleApplyAdvancedFilters = (next: InventoryAdvancedFilters) => {
    setSearchQuery(next.search);
    setInStockOnly(next.status === "in-stock");
    if (next.status === "low-stock") {
      setActiveStat("low-stock-alerts");
    } else if (next.status === "out-of-stock") {
      setActiveStat("out-of-stock-items");
    } else {
      setActiveStat(null);
    }
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    inStockOnly ||
    activeStat === "low-stock-alerts" ||
    activeStat === "out-of-stock-items";

  const handleExportCsv = async () => {
    try {
      const blob = await warehouseService.exportInventory();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `central-warehouse-inventory-${Date.now()}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      notify.success("Export started", "Warehouse inventory CSV downloaded.");
    } catch {
      downloadInventoryCsv(filteredItems);
      notify.warning(
        "API export unavailable",
        "Exported the currently loaded inventory instead.",
      );
    }
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
        {loadError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        ) : null}
        <InventoryTable
          items={paginatedItems}
          isLoading={isLoading}
          currentPage={currentPage}
          totalItems={totalFilteredItems}
          pageSize={INVENTORY_PAGE_SIZE}
          onPageChange={setCurrentPage}
          onViewItem={handleViewItem}
          onEditItem={handleEditItem}
          onTransferItem={handleTransferItem}
          onDeleteItem={handleDeleteItem}
          header={
            <InventoryFilters
              categories={categoryFilters}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              onAdvancedFilter={() => setFilterOpen(true)}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              hasActiveFilters={hasActiveFilters}
            />
          }
        />
      </div>

      <InventoryDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedItem}
        onEdit={handleEditItem}
        onTransfer={handleTransferItem}
      />

      <InventoryAdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        item={selectedItem}
        isSubmitting={isSaving}
        onConfirm={(payload) => void handleAdjustConfirm(payload)}
      />

      <InventoryAdvancedFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        value={advancedFilters}
        onApply={handleApplyAdvancedFilters}
      />

      <CreateTransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this SKU?"
        message={
          selectedItem
            ? `“${selectedItem.productName}” will be removed from the catalog and warehouse inventory.`
            : "This SKU will be removed from inventory."
        }
        confirmLabel="Delete"
        isSubmitting={isDeleting}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
}
