"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { RequisitionDetailDrawer } from "@/components/requisitions/RequisitionDetailDrawer";
import { CriticalRequisitionTable } from "@/components/warehouse/CriticalRequisitionTable";
import { InventoryActivityTable } from "@/components/warehouse/InventoryActivityTable";
import { QuickActions } from "@/components/warehouse/QuickActions";
import { WarehouseStatsCard } from "@/components/warehouse/WarehouseStatsCard";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { getAvailableStock } from "@/mock/inventory";
import { quickActions } from "@/mock/warehouse-dashboard";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type {
  LowStockItem,
  RequisitionListItem,
} from "@/types/warehouse.types";
import { notify } from "@/utils/notify";

export function WarehouseDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequisition, setSelectedRequisition] =
    useState<RequisitionListItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [drawerInitialAction, setDrawerInitialAction] = useState<
    "approve" | "reject" | null
  >(null);

  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const transfers = useWarehouseErpStore((state) => state.transfers);
  const inventory = useWarehouseErpStore((state) => state.inventory);
  const approveRequisition = useWarehouseErpStore(
    (state) => state.approveRequisition,
  );
  const rejectRequisition = useWarehouseErpStore(
    (state) => state.rejectRequisition,
  );

  const stats = useMemo(
    () => useWarehouseErpStore.getState().getDashboardStats(),
    [requisitions, transfers, inventory],
  );

  const activities = useMemo(
    () => useWarehouseErpStore.getState().getInventoryActivities(),
    [transfers],
  );

  const criticalRequisitions = useMemo(
    () => useWarehouseErpStore.getState().getCriticalRequisitions(),
    [requisitions],
  );

  const lowStockAlerts = useMemo((): LowStockItem[] => {
    return inventory
      .filter((item) => getAvailableStock(item) <= item.minimumStock)
      .map((item) => {
        const available = getAvailableStock(item);
        const isCritical =
          available === 0 || available <= item.minimumStock * 0.5;

        return {
          id: item.id,
          productName: item.productName,
          currentStock: `${available} ${item.unit}`,
          minimumStock: `${item.minimumStock} ${item.unit}`,
          severity: isCritical ? ("critical" as const) : ("warning" as const),
        };
      });
  }, [inventory]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const handleView = useCallback((item: RequisitionListItem) => {
    setSelectedRequisition(item);
    setDrawerInitialAction(null);
    setIsDetailDrawerOpen(true);
  }, []);

  const handleApprove = useCallback((item: RequisitionListItem) => {
    if (item.status !== "PENDING") return;
    setSelectedRequisition(item);
    setDrawerInitialAction("approve");
    setIsDetailDrawerOpen(true);
  }, []);

  const handleReject = useCallback((item: RequisitionListItem) => {
    if (item.status !== "PENDING") return;
    setSelectedRequisition(item);
    setDrawerInitialAction("reject");
    setIsDetailDrawerOpen(true);
  }, []);

  const handleAllocate = useCallback(
    (item: RequisitionListItem) => {
      if (item.status === "PENDING") {
        setSelectedRequisition(item);
        setDrawerInitialAction("approve");
        setIsDetailDrawerOpen(true);
        notify.info(
          "Approve first",
          "Approve this requisition to continue into allocation.",
        );
        return;
      }

      if (item.allocationId) {
        router.push(
          `${ROUTES.CENTRAL_WAREHOUSE}/allocate/workflow?allocationId=${encodeURIComponent(item.allocationId)}`,
        );
        return;
      }

      router.push(`${ROUTES.CENTRAL_WAREHOUSE}/allocate`);
    },
    [router],
  );

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setIsDetailDrawerOpen(open);
    if (!open) {
      setSelectedRequisition(null);
      setDrawerInitialAction(null);
    }
  }, []);

  const handleDrawerApprove = useCallback(
    async (remarks: string) => {
      if (!selectedRequisition) return;

      setIsSubmitting(true);
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        approveRequisition(selectedRequisition.id, {
          adminName: user?.name ?? "Super Admin",
          remarks: remarks || undefined,
        });
        setIsDetailDrawerOpen(false);
        setSelectedRequisition(null);
        notify.success("Requisition Approved Successfully.");
      } catch {
        notify.error(
          "Approval failed",
          "Unable to approve the requisition. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedRequisition, user?.name, approveRequisition],
  );

  const handleDrawerReject = useCallback(
    async (remarks: string) => {
      if (!selectedRequisition) return;

      setIsSubmitting(true);
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        rejectRequisition(selectedRequisition.id, {
          adminName: user?.name ?? "Super Admin",
          remarks,
        });
        setIsDetailDrawerOpen(false);
        setSelectedRequisition(null);
        notify.success("Requisition Rejected Successfully.");
      } catch {
        notify.error(
          "Rejection failed",
          "Unable to reject the requisition. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedRequisition, user?.name, rejectRequisition],
  );

  const drawerRequisition = useMemo(() => {
    if (!selectedRequisition) return null;
    return (
      requisitions.find((item) => item.id === selectedRequisition.id) ??
      selectedRequisition
    );
  }, [requisitions, selectedRequisition]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <WarehouseStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <CriticalRequisitionTable
          requisitions={criticalRequisitions}
          isLoading={isLoading}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          onAllocate={handleAllocate}
        />
        <QuickActions
          actions={quickActions}
          alerts={lowStockAlerts}
          isLoading={isLoading}
        />
      </div>

      <InventoryActivityTable activities={activities} isLoading={isLoading} />

      <RequisitionDetailDrawer
        open={isDetailDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        requisition={drawerRequisition}
        isSubmitting={isSubmitting}
        initialAction={drawerInitialAction}
        onApprove={handleDrawerApprove}
        onReject={handleDrawerReject}
      />
    </div>
  );
}
