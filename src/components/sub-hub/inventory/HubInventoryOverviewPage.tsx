"use client";

import { Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";

import { HubContextSelector } from "@/components/sub-hub/HubContextSelector";
import { HubInventoryDetailSheet } from "@/components/sub-hub/inventory/HubInventoryDetailSheet";
import { HubInventoryFilters } from "@/components/sub-hub/inventory/HubInventoryFilters";
import {
  HubInventoryStatsCard,
  type HubInventoryStatKey,
} from "@/components/sub-hub/inventory/HubInventoryStatsCard";
import { HubInventoryTable } from "@/components/sub-hub/inventory/HubInventoryTable";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { HUB_INVENTORY_PAGE_SIZE } from "@/constants/sub-hub-ops.constants";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { hubsService } from "@/services/hubs.service";
import { useSelectedHubStore } from "@/store/selected-hub-store";
import {
  sortNetworkInventoryRows,
  type HubInventoryOverviewFilters,
  type HubInventorySortDirection,
  type HubInventorySortKey,
  type HubNetworkInventoryRow,
} from "@/utils/hub-inventory-overview";
import {
  getRaiseRequisitionHref,
  getRaiseTransferHref,
} from "@/utils/hub-profile-metrics";
import { formatHubStockValue } from "@/utils/sub-hub-metrics";

function isLowStockRow(row: HubNetworkInventoryRow) {
  return row.availableQty <= row.reorderLevel || row.status === "low-stock";
}

const DEFAULT_FILTERS: HubInventoryOverviewFilters = {
  hubId: "all",
  category: "all",
  skuSearch: "",
  supplier: "all",
  materialType: "all",
};

function downloadCsv(rows: HubNetworkInventoryRow[]) {
  const header = [
    "Hub",
    "Material",
    "SKU",
    "Category",
    "Available",
    "Reserved",
    "Free",
    "Reorder Level",
    "Status",
    "Unit",
    "Inventory Value",
    "Last Updated",
  ];

  const lines = rows.map((row) =>
    [
      row.hubName,
      row.materialName,
      row.sku,
      row.category,
      row.availableQty,
      row.reservedQty,
      row.freeQty,
      row.reorderLevel,
      row.status,
      row.unit,
      row.inventoryValue,
      row.lastUpdated ?? "",
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(","),
  );

  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hub-inventory-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function mapStatus(status: string): HubNetworkInventoryRow["status"] {
  const upper = status.toUpperCase();
  if (upper === "OUT_OF_STOCK") return "out-of-stock";
  if (upper === "LOW_STOCK") return "low-stock";
  return "healthy";
}

export function HubInventoryOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedHubId = useSelectedHubStore((s) => s.selectedHubId);
  const selectedHubName = useSelectedHubStore((s) => s.selectedHubName);
  const setSelectedHub = useSelectedHubStore((s) => s.setSelectedHub);

  const hubFromQuery =
    searchParams.get("hubId") || searchParams.get("hub") || null;

  const [filters, setFilters] = useState<HubInventoryOverviewFilters>(() => ({
    ...DEFAULT_FILTERS,
    hubId: hubFromQuery || selectedHubId || "all",
  }));
  const [activeStat, setActiveStat] = useState<HubInventoryStatKey | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<HubInventorySortKey>("materialName");
  const [sortDirection, setSortDirection] =
    useState<HubInventorySortDirection>("asc");
  const [selectedRow, setSelectedRow] = useState<HubNetworkInventoryRow | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusHistory, setFocusHistory] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const nextHubId = hubFromQuery || selectedHubId || "all";
    setFilters((prev) =>
      prev.hubId === nextHubId ? prev : { ...prev, hubId: nextHubId },
    );
  }, [hubFromQuery, selectedHubId]);

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs", "inventory-page"],
    queryFn: () => hubsService.list({ page: 1, limit: 100 }),
  });

  const hubs = hubsQuery.data?.data ?? [];

  const scopedHubId =
    filters.hubId !== "all" ? filters.hubId : undefined;

  const inventoryQuery = useQuery({
    queryKey: [
      "hub-inventory",
      scopedHubId ?? "all",
      filters.skuSearch,
      filters.category,
      currentPage,
    ],
    queryFn: () =>
      hubsService.listInventory({
        hubId: scopedHubId,
        page: currentPage,
        limit: HUB_INVENTORY_PAGE_SIZE,
        search: filters.skuSearch || undefined,
        category:
          filters.category !== "all" ? filters.category : undefined,
      }),
    refetchInterval: 15000,
  });

  const allRows: HubNetworkInventoryRow[] = useMemo(() => {
    const items = inventoryQuery.data?.data ?? [];
    return items.map((item) => {
      const availableQty = item.availableQty ?? 0;
      const reservedQty = item.reservedQty ?? 0;
      const freeQty = item.freeQty ?? Math.max(0, availableQty - reservedQty);
      const unitPrice = item.unitPrice ?? 0;
      const inventoryValue =
        item.inventoryValue ?? availableQty * unitPrice;
      return {
        hubId: item.hubId,
        hubName: item.hubName || selectedHubName || "Hub",
        materialId: item.productId,
        materialName: item.productName,
        sku: item.sku || item.productId.slice(0, 8),
        category: item.category || "Catalog",
        availableQty,
        reservedQty,
        freeQty,
        incomingQty: 0,
        outgoingQty: 0,
        reorderLevel: item.reorderLevel ?? 0,
        safetyStock: item.minimumStock ?? item.reorderLevel ?? 0,
        unit: item.unit || "unit",
        unitPrice,
        inventoryValue,
        status: mapStatus(item.status),
        lastUpdated: item.lastUpdated,
        recommendedQty: Math.max(0, (item.reorderLevel ?? 0) - freeQty),
        supplier: "—",
        materialType: item.category || "Catalog",
        materialTypeSlug: (item.category || "catalog")
          .toLowerCase()
          .replace(/\s+/g, "-"),
        maxStock: item.maximumStock ?? 0,
        entryKey: `${item.hubId}:${item.productId}`,
        imageUrl: item.imageUrl,
      } as HubNetworkInventoryRow & { imageUrl?: string | null };
    });
  }, [inventoryQuery.data, selectedHubName]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(allRows.map((row) => row.category).filter(Boolean)),
      ).sort(),
    [allRows],
  );

  const displayRows = useMemo(() => {
    if (activeStat === "low-stock") {
      return allRows.filter(isLowStockRow);
    }
    return allRows;
  }, [allRows, activeStat]);

  const sortedRows = useMemo(
    () => sortNetworkInventoryRows(displayRows, sortKey, sortDirection),
    [displayRows, sortKey, sortDirection],
  );

  const apiStats = inventoryQuery.data?.stats;
  const stats = useMemo(() => {
    const totalUnits = apiStats?.totalInventoryUnits ?? 0;
    const reserved = apiStats?.reservedInventory ?? 0;
    const lowStockItems = apiStats?.lowStockItems ?? 0;
    const inventoryValue = apiStats?.inventoryValue ?? 0;
    return {
      totalInventoryUnits: totalUnits,
      totalInventoryLabel: totalUnits.toLocaleString("en-IN"),
      lowStockItems,
      inventoryValue,
      inventoryValueLabel: formatHubStockValue(inventoryValue),
      reservedInventory: reserved,
      reservedInventoryLabel: reserved.toLocaleString("en-IN"),
    };
  }, [apiStats]);

  const totalItems = inventoryQuery.data?.meta.total ?? 0;
  const pageCount = Math.max(
    1,
    Math.ceil(totalItems / HUB_INVENTORY_PAGE_SIZE),
  );

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  const handleFilterChange = (next: Partial<HubInventoryOverviewFilters>) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...next }));
      if (next.hubId !== undefined) {
        if (next.hubId === "all") {
          setSelectedHub(null, null);
        } else {
          const hub = hubs.find((h) => h.id === next.hubId);
          setSelectedHub(next.hubId, hub?.name ?? null);
        }
      }
      setActiveStat(null);
      setCurrentPage(1);
    });
  };

  const handleClearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSelectedHub(null, null);
    setActiveStat(null);
    setCurrentPage(1);
  };

  const handleStatClick = (statId: HubInventoryStatKey) => {
    if (statId !== "low-stock") return;
    setActiveStat((current) => (current === statId ? null : statId));
    setCurrentPage(1);
  };

  const handleSort = (key: HubInventorySortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const openDetail = (row: HubNetworkInventoryRow, history = false) => {
    setSelectedRow(row);
    setFocusHistory(history);
    setDetailOpen(true);
  };

  const isLoading = hubsQuery.isLoading || inventoryQuery.isLoading;
  const isRefreshing = inventoryQuery.isFetching && !inventoryQuery.isLoading;
  const hubLabel =
    scopedHubId == null
      ? "all hubs"
      : selectedHubName ||
        hubs.find((h) => h.id === scopedHubId)?.name ||
        "this hub";

  const statCards = [
    {
      id: "total-inventory" as const,
      label: "Total Inventory",
      value: stats.totalInventoryLabel,
      subtitle: `Available qty at ${hubLabel}`,
      variant: "default" as const,
    },
    {
      id: "reserved-inventory" as const,
      label: "Reserved Inventory",
      value: stats.reservedInventoryLabel,
      subtitle: "Held for open orders",
      variant: "default" as const,
    },
    {
      id: "low-stock" as const,
      label: "Low Stock Items",
      value: String(stats.lowStockItems),
      subtitle: "Available ≤ reorder level",
      variant:
        stats.lowStockItems > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      id: "inventory-value" as const,
      label: "Inventory Value",
      value: stats.inventoryValueLabel,
      subtitle: "On-hand × unit price",
      variant: "default" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hub Inventory Overview"
        subtitle="Monitor real-time stock levels and inventory health for the selected hub."
        breadcrumbs={getNavBreadcrumbsFromPath("/sub-hub-network/inventory")}
        actions={
          <>
            <HubContextSelector className="mr-2" allowAll allLabel="All Hubs" />
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-4"
              onClick={() => downloadCsv(sortedRows)}
              disabled={sortedRows.length === 0}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </>
        }
      />

      {inventoryQuery.isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load inventory
          {scopedHubId ? ` for ${hubLabel}` : ""}.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void inventoryQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <HubInventoryStatsCard
            key={stat.id}
            stat={stat}
            index={index}
            isLoading={isLoading}
            isActive={activeStat === stat.id}
            onClick={() => handleStatClick(stat.id)}
          />
        ))}
      </div>

      <HubInventoryFilters
        filters={filters}
        hubs={hubs.map((h) => ({
          id: h.id,
          name: h.name,
          nodeId: h.code,
          city: h.city,
          region: h.state,
          isActive: h.isActive,
          managerName: h.manager?.fullName || "Unassigned",
          managerPhone: h.manager?.phone || "",
          managerEmail: h.manager?.email || "",
          lastInventorySync: h.updatedAt,
        }))}
        categories={categories}
        suppliers={[]}
        materialTypes={categories}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <HubInventoryTable
        rows={sortedRows}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={HUB_INVENTORY_PAGE_SIZE}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onPageChange={setCurrentPage}
        onRefresh={() => void inventoryQuery.refetch()}
        onView={(row) => openDetail(row)}
        onAdjust={() => undefined}
        onRaiseRequisition={(row) => {
          router.push(getRaiseRequisitionHref(row.hubId, row.materialId));
        }}
        onTransfer={(row) => {
          router.push(getRaiseTransferHref(row.hubId));
        }}
        onHistory={(row) => openDetail(row, true)}
      />

      {!isLoading && !inventoryQuery.isError && sortedRows.length === 0 ? (
        <p className="text-center text-sm text-[#64748B]">
          {scopedHubId
            ? `No inventory available for ${hubLabel}.`
            : "No inventory available."}
        </p>
      ) : null}

      <HubInventoryDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        row={selectedRow}
        focusHistory={focusHistory}
        history={[]}
        incomingTransfers={[]}
        outgoingDispatches={[]}
      />
    </div>
  );
}
