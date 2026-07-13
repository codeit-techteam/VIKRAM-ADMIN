"use client";

import { ClipboardCheck, Download, ShoppingCart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { HubInventoryAdjustDialog } from "@/components/sub-hub/inventory/HubInventoryAdjustDialog";
import { HubInventoryDetailSheet } from "@/components/sub-hub/inventory/HubInventoryDetailSheet";
import { HubInventoryFilters } from "@/components/sub-hub/inventory/HubInventoryFilters";
import {
  HubInventoryStatsCard,
  type HubInventoryStatKey,
} from "@/components/sub-hub/inventory/HubInventoryStatsCard";
import { HubInventoryTable } from "@/components/sub-hub/inventory/HubInventoryTable";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { normalizeHubInventory, resolveSubHubs } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import {
  collectFilterOptions,
  computeHubInventoryOverviewStats,
  filterNetworkInventoryRows,
  getIncomingTransfersForMaterial,
  getOutgoingDispatchesForMaterial,
  HUB_INVENTORY_PAGE_SIZE,
  buildNetworkInventoryRows,
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

function isLowStockRow(row: HubNetworkInventoryRow) {
  return row.availableQty <= row.reorderLevel;
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

export function HubInventoryOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hubFromQuery = searchParams.get("hub");

  const subHubs = useWarehouseErpStore((state) => state.subHubs);
  const hubInventory = useWarehouseErpStore((state) => state.hubInventory);
  const transfers = useWarehouseErpStore((state) => state.transfers);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const allocations = useWarehouseErpStore((state) => state.allocations);
  const dispatches = useWarehouseErpStore((state) => state.dispatches);
  const activityLogs = useWarehouseErpStore((state) => state.activityLogs);
  const adjustHubInventory = useWarehouseErpStore(
    (state) => state.adjustHubInventory,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<HubInventoryOverviewFilters>(() => ({
    ...DEFAULT_FILTERS,
    hubId: hubFromQuery ?? "all",
  }));
  const [activeStat, setActiveStat] = useState<HubInventoryStatKey | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<HubInventorySortKey>("hubName");
  const [sortDirection, setSortDirection] =
    useState<HubInventorySortDirection>("asc");
  const [selectedRow, setSelectedRow] = useState<HubNetworkInventoryRow | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusHistory, setFocusHistory] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 550);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hubFromQuery) {
      setFilters((prev) => ({ ...prev, hubId: hubFromQuery }));
    }
  }, [hubFromQuery]);

  const resolvedSubHubs = useMemo(() => resolveSubHubs(subHubs), [subHubs]);
  const resolvedHubInventory = useMemo(
    () => normalizeHubInventory(hubInventory),
    [hubInventory],
  );

  const allRows = useMemo(
    () =>
      buildNetworkInventoryRows(
        resolvedSubHubs,
        resolvedHubInventory,
        transfers,
        requisitions,
        allocations ?? [],
        dispatches ?? [],
      ),
    [
      resolvedSubHubs,
      resolvedHubInventory,
      transfers,
      requisitions,
      allocations,
      dispatches,
    ],
  );

  const filterOptions = useMemo(() => collectFilterOptions(allRows), [allRows]);

  const filteredRows = useMemo(
    () => filterNetworkInventoryRows(allRows, filters),
    [allRows, filters],
  );

  const displayRows = useMemo(() => {
    if (activeStat === "low-stock") {
      return filteredRows.filter(isLowStockRow);
    }
    return filteredRows;
  }, [filteredRows, activeStat]);

  const sortedRows = useMemo(
    () => sortNetworkInventoryRows(displayRows, sortKey, sortDirection),
    [displayRows, sortKey, sortDirection],
  );

  const stats = useMemo(
    () => computeHubInventoryOverviewStats(filteredRows),
    [filteredRows],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(sortedRows.length / HUB_INVENTORY_PAGE_SIZE),
  );

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * HUB_INVENTORY_PAGE_SIZE;
    return sortedRows.slice(start, start + HUB_INVENTORY_PAGE_SIZE);
  }, [sortedRows, currentPage]);

  const lowStockRows = useMemo(() => allRows.filter(isLowStockRow), [allRows]);

  const selectedHistory = useMemo(() => {
    if (!selectedRow) return [];
    return activityLogs
      .filter((log) => {
        const remarks = log.remarks?.toLowerCase() ?? "";
        const entity = log.entityId ?? "";
        return (
          entity.includes(selectedRow.hubId) ||
          entity.includes(selectedRow.materialId) ||
          remarks.includes(selectedRow.materialName.toLowerCase()) ||
          remarks.includes(selectedRow.sku.toLowerCase()) ||
          remarks.includes(selectedRow.hubName.toLowerCase())
        );
      })
      .slice(0, 20);
  }, [activityLogs, selectedRow]);

  const incomingTransfers = useMemo(() => {
    if (!selectedRow) return [];
    return getIncomingTransfersForMaterial(
      transfers,
      selectedRow.hubId,
      selectedRow.sku,
      selectedRow.materialName,
    );
  }, [selectedRow, transfers]);

  const outgoingDispatches = useMemo(() => {
    if (!selectedRow) return [];
    return getOutgoingDispatchesForMaterial(
      dispatches ?? [],
      selectedRow.hubName,
      selectedRow.materialId,
    );
  }, [dispatches, selectedRow]);

  const handleFilterChange = (next: Partial<HubInventoryOverviewFilters>) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...next }));
      setActiveStat(null);
      setCurrentPage(1);
    });
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
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

  const openAdjust = (row: HubNetworkInventoryRow) => {
    setSelectedRow(row);
    setAdjustOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 700);
  };

  const statCards = [
    {
      id: "total-inventory" as const,
      label: "Total Inventory",
      value: stats.totalInventoryLabel,
      subtitle: "Available qty across hubs",
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
      subtitle: "Available × unit price",
      variant: "default" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hub Inventory Overview"
        subtitle="Monitor real-time stock levels and inventory health across all regional sub-hubs."
        breadcrumbs={getNavBreadcrumbsFromPath("/sub-hub-network/inventory")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-4"
              onClick={() => downloadCsv(sortedRows)}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-4"
              disabled={allRows.length === 0}
              onClick={() => {
                const auditRow = lowStockRows[0] ?? allRows[0];
                if (!auditRow) return;
                openDetail(auditRow, true);
              }}
            >
              <ClipboardCheck className="size-4" />
              Inventory Audit
            </Button>
            <Button
              type="button"
              className="h-10 gap-2 px-4"
              disabled={lowStockRows.length === 0}
              onClick={() => {
                const first = lowStockRows[0];
                if (!first) return;
                router.push(
                  getRaiseRequisitionHref(first.hubId, first.materialId),
                );
              }}
            >
              <ShoppingCart className="size-4" />
              Reorder All Low Stock
              {lowStockRows.length > 0 ? (
                <span className="rounded-full bg-white/20 px-1.5 text-xs">
                  {lowStockRows.length}
                </span>
              ) : null}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <HubInventoryStatsCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            index={index}
            isActive={activeStat === stat.id}
            onClick={
              stat.id === "low-stock"
                ? () => handleStatClick(stat.id)
                : undefined
            }
          />
        ))}
      </div>

      <HubInventoryFilters
        filters={filters}
        hubs={resolvedSubHubs}
        categories={filterOptions.categories}
        suppliers={filterOptions.suppliers}
        materialTypes={filterOptions.materialTypes}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        hasStatFilter={activeStat !== null}
      />

      <HubInventoryTable
        rows={paginatedRows}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        currentPage={currentPage}
        totalItems={sortedRows.length}
        pageSize={HUB_INVENTORY_PAGE_SIZE}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onPageChange={setCurrentPage}
        onRefresh={handleRefresh}
        onView={(row) => openDetail(row, false)}
        onAdjust={openAdjust}
        onRaiseRequisition={(row) =>
          router.push(getRaiseRequisitionHref(row.hubId, row.materialId))
        }
        onTransfer={(row) => router.push(getRaiseTransferHref(row.hubId))}
        onHistory={(row) => openDetail(row, true)}
      />

      <HubInventoryDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        row={selectedRow}
        incomingTransfers={incomingTransfers}
        outgoingDispatches={outgoingDispatches}
        history={selectedHistory}
        focusHistory={focusHistory}
      />

      <HubInventoryAdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        row={selectedRow}
        onConfirm={({ newQuantity, reason }) => {
          if (!selectedRow) return;
          adjustHubInventory({
            hubId: selectedRow.hubId,
            materialId: selectedRow.materialId,
            newQuantity,
            reason,
            adminName: "Super Admin",
          });
        }}
      />
    </div>
  );
}
