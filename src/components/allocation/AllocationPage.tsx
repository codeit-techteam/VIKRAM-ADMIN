"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AllocationDrawer } from "@/components/allocation/AllocationDrawer";
import {
  AllocationSummaryCard,
  buildAllocationSummaryCards,
} from "@/components/allocation/AllocationSummaryCard";
import { ConfirmationDialog } from "@/components/allocation/ConfirmationDialog";
import { MaterialAllocationTable } from "@/components/allocation/MaterialAllocationTable";
import { useAuth } from "@/hooks/use-auth";
import {
  allocateMaterial,
  ALLOCATION_LIST,
  ALLOCATION_PAGE_SIZE,
  fetchAllocations,
  getMaterialAvailableForAllocation,
} from "@/mock/allocations";
import { INVENTORY_ITEMS } from "@/mock/inventory";
import type { MaterialAllocationItem } from "@/types/warehouse.types";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface PendingAllocationFormValues {
  warehouseSourceId: string;
  allocationQty: number;
  remarks?: string;
}

export function AllocationPage() {
  const { user } = useAuth();
  const [allocations, setAllocations] =
    useState<MaterialAllocationItem[]>(ALLOCATION_LIST);
  const [inventory, setInventory] = useState(INVENTORY_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] =
    useState<MaterialAllocationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingFormValues, setPendingFormValues] =
    useState<PendingAllocationFormValues | null>(null);

  useEffect(() => {
    // TODO: Replace simulated loading with allocation API fetch
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const queryResult = useMemo(
    () =>
      fetchAllocations(allocations, {
        page: currentPage,
        limit: ALLOCATION_PAGE_SIZE,
      }),
    [allocations, currentPage],
  );

  useEffect(() => {
    if (
      queryResult.meta.total > 0 &&
      currentPage > queryResult.meta.totalPages
    ) {
      setCurrentPage(queryResult.meta.totalPages);
    }
  }, [currentPage, queryResult.meta.total, queryResult.meta.totalPages]);

  const summaryCards = useMemo(
    () => buildAllocationSummaryCards(queryResult.stats),
    [queryResult.stats],
  );

  const drawerItem = useMemo(() => {
    if (!selectedItem) return null;
    return (
      allocations.find((item) => item.id === selectedItem.id) ?? selectedItem
    );
  }, [allocations, selectedItem]);

  const drawerAvailableQty = useMemo(() => {
    if (!drawerItem) return 0;
    const stock = getMaterialAvailableForAllocation(
      drawerItem.materialId,
      undefined,
      drawerItem.id,
    );
    return stock?.available ?? 0;
  }, [drawerItem]);

  const handleAllocate = useCallback((item: MaterialAllocationItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  }, []);

  const handleView = useCallback((item: MaterialAllocationItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedItem(null);
    setPendingFormValues(null);
    setIsConfirmOpen(false);
  }, []);

  const handleFormSubmit = useCallback(
    (values: PendingAllocationFormValues) => {
      setPendingFormValues(values);
      setIsConfirmOpen(true);
    },
    [],
  );

  const handleConfirmAllocation = useCallback(async () => {
    if (!drawerItem || !pendingFormValues) return;

    setIsSubmitting(true);

    try {
      // TODO: Replace with material allocation API
      await new Promise((resolve) => window.setTimeout(resolve, 400));

      const result = allocateMaterial(allocations, inventory, {
        allocationId: drawerItem.id,
        warehouseSourceId: pendingFormValues.warehouseSourceId,
        allocationQty: pendingFormValues.allocationQty,
        remarks: pendingFormValues.remarks,
        adminName: user?.name ?? "Super Admin",
      });

      setAllocations(result.allocations);
      setInventory(result.inventory);
      setIsConfirmOpen(false);
      setIsDrawerOpen(false);
      setSelectedItem(null);
      setPendingFormValues(null);
      notify.success("Material Allocated Successfully");
    } catch (error) {
      notify.error(
        "Allocation failed",
        error instanceof Error
          ? error.message
          : "Unable to allocate material. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [allocations, drawerItem, inventory, pendingFormValues, user?.name]);

  const handleOpenAllocateFromHeader = useCallback(() => {
    const firstPending = allocations.find(
      (item) => item.status !== "ALLOCATED",
    );
    if (firstPending) {
      handleAllocate(firstPending);
      return;
    }
    notify.info(
      "No pending allocations",
      "All requisitions have been fully allocated.",
    );
  }, [allocations, handleAllocate]);

  useEffect(() => {
    const handleOpenEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ allocationId?: string }>;
      const allocationId = customEvent.detail?.allocationId;

      if (allocationId) {
        const item = allocations.find((entry) => entry.id === allocationId);
        if (item) {
          handleAllocate(item);
          return;
        }
      }

      handleOpenAllocateFromHeader();
    };

    window.addEventListener("allocation:open", handleOpenEvent);
    return () => window.removeEventListener("allocation:open", handleOpenEvent);
  }, [allocations, handleAllocate, handleOpenAllocateFromHeader]);

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-5 transition-all duration-300 lg:flex-row",
          isDrawerOpen ? "lg:gap-4" : "",
        )}
      >
        <div
          className={cn(
            "min-w-0 space-y-5 transition-all duration-300",
            isDrawerOpen ? "lg:w-[72%]" : "w-full",
          )}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((stat) => (
              <AllocationSummaryCard
                key={stat.id}
                stat={stat}
                isLoading={isLoading}
              />
            ))}
          </div>

          <MaterialAllocationTable
            items={queryResult.data}
            isLoading={isLoading}
            currentPage={queryResult.meta.page}
            totalItems={queryResult.meta.total}
            pageSize={ALLOCATION_PAGE_SIZE}
            onPageChange={setCurrentPage}
            onView={handleView}
            onAllocate={handleAllocate}
          />
        </div>

        <AllocationDrawer
          open={isDrawerOpen}
          item={drawerItem}
          availableQty={drawerAvailableQty}
          isSubmitting={isSubmitting}
          onClose={handleDrawerClose}
          onSubmit={handleFormSubmit}
        />
      </div>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmAllocation}
      />
    </>
  );
}
