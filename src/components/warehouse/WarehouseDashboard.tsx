"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { RequisitionDetailDrawer } from "@/components/requisitions/RequisitionDetailDrawer";
import { CriticalRequisitionTable } from "@/components/warehouse/CriticalRequisitionTable";
import { InventoryActivityTable } from "@/components/warehouse/InventoryActivityTable";
import { QuickActions } from "@/components/warehouse/QuickActions";
import { WarehouseStatsCard } from "@/components/warehouse/WarehouseStatsCard";
import { ROUTES } from "@/constants/routes";
import { quickActions } from "@/mock/warehouse-dashboard";
import { adminRequisitionsService } from "@/services/adminRequisitions";
import {
  warehouseService,
  type WarehouseDashboardResponse,
} from "@/services/warehouse";
import type { RequisitionListItem } from "@/types/warehouse.types";
import { notify } from "@/utils/notify";

export function WarehouseDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<WarehouseDashboardResponse>({
    stats: [],
    criticalRequisitions: [],
    lowStockAlerts: [],
    activities: [],
    counters: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequisition, setSelectedRequisition] =
    useState<RequisitionListItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [drawerInitialAction, setDrawerInitialAction] = useState<
    "approve" | "reject" | null
  >(null);

  const loadDashboard = useCallback(async () => {
    try {
      setDashboard(await warehouseService.getDashboard());
    } catch {
      notify.error("Dashboard unavailable", "Unable to load warehouse data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
    const interval = window.setInterval(() => void loadDashboard(), 30000);
    return () => window.clearInterval(interval);
  }, [loadDashboard]);

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
        const detail = await adminRequisitionsService.getById(
          selectedRequisition.id,
        );
        await adminRequisitionsService.approve(selectedRequisition.id, {
          items: detail.materials.map((item) => ({
            itemId: item.id,
            approvedQty: item.requestedQty,
          })),
          comment: remarks || undefined,
        });
        setIsDetailDrawerOpen(false);
        setSelectedRequisition(null);
        await loadDashboard();
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
    [selectedRequisition, loadDashboard],
  );

  const handleDrawerReject = useCallback(
    async (remarks: string) => {
      if (!selectedRequisition) return;

      setIsSubmitting(true);
      try {
        await adminRequisitionsService.reject(selectedRequisition.id, {
          reason: remarks,
        });
        setIsDetailDrawerOpen(false);
        setSelectedRequisition(null);
        await loadDashboard();
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
    [selectedRequisition, loadDashboard],
  );

  const drawerRequisition = useMemo(() => {
    if (!selectedRequisition) return null;
    return selectedRequisition;
  }, [selectedRequisition]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <WarehouseStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <CriticalRequisitionTable
          requisitions={dashboard.criticalRequisitions}
          isLoading={isLoading}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          onAllocate={handleAllocate}
        />
        <QuickActions
          actions={quickActions}
          alerts={dashboard.lowStockAlerts}
          isLoading={isLoading}
        />
      </div>

      <InventoryActivityTable
        activities={dashboard.activities}
        isLoading={isLoading}
      />

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
