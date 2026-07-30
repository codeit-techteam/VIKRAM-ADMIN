"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { DashboardCard } from "@/components/shared/DashboardCard";
import {
  FilterTabs,
  type FilterTabOption,
} from "@/components/shared/FilterTabs";
import { HubOrderDetailDrawer } from "@/components/sub-hub/orders/HubOrderDetailDrawer";
import { HubOrderFiltersBar } from "@/components/sub-hub/orders/HubOrderFiltersBar";
import { HubOrdersTable } from "@/components/sub-hub/orders/HubOrdersTable";
import {
  downloadHubOrdersExport,
  hubOrdersService,
} from "@/services/hubOrders.service";
import {
  EMPTY_HUB_ORDER_FILTERS,
  type HubOrderExportFormat,
  type HubOrderFilters,
  type HubOrderTab,
} from "@/types/hub-orders.types";
import { downloadAdminOrderInvoicePdf } from "@/services/adminOrders";
import { notify } from "@/utils/notify";

const PAGE_SIZE = 15;

const ORDER_TABS: FilterTabOption<HubOrderTab>[] = [
  { label: "All Orders", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Pending Dispatch", value: "pending_dispatch" },
  { label: "Out For Delivery", value: "out_for_delivery" },
];

interface HubCustomerOrdersPanelProps {
  hubId: string;
  hubCode?: string;
  initialTab?: HubOrderTab;
}

export function HubCustomerOrdersPanel({
  hubId,
  hubCode,
  initialTab,
}: HubCustomerOrdersPanelProps) {
  const queryClient = useQueryClient();
  const [draftFilters, setDraftFilters] = useState<HubOrderFilters>({
    ...EMPTY_HUB_ORDER_FILTERS,
    tab: initialTab ?? "all",
  });
  const [appliedFilters, setAppliedFilters] = useState<HubOrderFilters>({
    ...EMPTY_HUB_ORDER_FILTERS,
    tab: initialTab ?? "all",
  });
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const ordersQuery = useQuery({
    queryKey: ["hub-orders", hubId, appliedFilters, page],
    queryFn: () =>
      hubOrdersService.list(hubId, {
        ...appliedFilters,
        page,
        limit: PAGE_SIZE,
      }),
    refetchInterval: 10_000,
  });

  const invalidateHubOrders = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["hub-orders", hubId] });
    void queryClient.invalidateQueries({
      queryKey: ["hub-orders-dashboard", hubId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["hub-orders-analytics", hubId],
    });
  }, [queryClient, hubId]);

  useEffect(() => {
    if (initialTab) {
      setDraftFilters((prev) => ({ ...prev, tab: initialTab }));
      setAppliedFilters((prev) => ({ ...prev, tab: initialTab }));
      setPage(1);
    }
  }, [initialTab]);

  const statusCounts = ordersQuery.data?.statusCounts;

  const tabsWithCounts = useMemo(() => {
    return ORDER_TABS.map((tab) => {
      const count =
        tab.value === "all"
          ? statusCounts?.all
          : statusCounts?.[tab.value as keyof typeof statusCounts];
      return {
        ...tab,
        label: count !== undefined ? `${tab.label} (${count})` : tab.label,
      };
    });
  }, [statusCounts]);

  const handleTabChange = (tab: HubOrderTab) => {
    const next = { ...draftFilters, tab };
    setDraftFilters(next);
    setAppliedFilters(next);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  };

  const handleClearFilters = () => {
    const cleared = { ...EMPTY_HUB_ORDER_FILTERS, tab: draftFilters.tab };
    setDraftFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  };

  const handleExport = async (format: HubOrderExportFormat) => {
    setExporting(true);
    try {
      await downloadHubOrdersExport(hubId, format, appliedFilters);
      notify.success(`Orders exported as ${format.toUpperCase()}`);
    } catch {
      notify.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const openDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailOpen(true);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      await downloadAdminOrderInvoicePdf(orderId);
    } catch {
      notify.error("Failed to download invoice");
    }
  };

  const handlePrintInvoice = async (orderId: string) => {
    try {
      const { blob } = await import("@/services/adminOrders").then((m) =>
        m.adminOrdersService.invoicePdf(orderId),
      );
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      printWindow?.print();
    } catch {
      notify.error("Failed to open invoice for printing");
    }
  };

  return (
    <div className="space-y-5">
      <HubOrderFiltersBar
        filters={draftFilters}
        onChange={(next) => setDraftFilters((prev) => ({ ...prev, ...next }))}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onExport={(format) => void handleExport(format)}
        exporting={exporting}
      />

      <DashboardCard contentClassName="space-y-4">
        <FilterTabs
          options={tabsWithCounts}
          value={appliedFilters.tab}
          onChange={handleTabChange}
        />

        <HubOrdersTable
          orders={ordersQuery.data?.orders ?? []}
          hubCode={hubCode}
          isLoading={ordersQuery.isLoading}
          page={page}
          totalPages={ordersQuery.data?.meta.totalPages ?? 1}
          total={ordersQuery.data?.meta.total ?? 0}
          onPageChange={setPage}
          onView={openDetail}
          onTrack={openDetail}
          onDownloadInvoice={(id) => void handleDownloadInvoice(id)}
          onPrintInvoice={(id) => void handlePrintInvoice(id)}
        />
      </DashboardCard>

      <HubOrderDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedOrderId(null);
            invalidateHubOrders();
          }
        }}
        orderId={selectedOrderId}
      />
    </div>
  );
}
