"use client";

import { Package, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { TransferPage } from "@/components/transfers/TransferPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { formatWorkflowQuantity } from "@/mock/allocation-workflow";
import { ROUTES } from "@/constants/routes";
import { useTransferListStore } from "@/store/transfer-list-store";
import type { AllocationWorkflowResult } from "@/types/warehouse.types";
import type { TransferListItem } from "@/types/warehouse.types";
import { readAllocationForTransfer } from "@/utils/allocation-transfer-bridge";

function formatOperationalDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PendingAllocationState {
  allocation: AllocationWorkflowResult;
  existingDraft: TransferListItem | null;
}

export function TransferPageContent() {
  const transfers = useTransferListStore((state) => state.transfers);
  const [pendingAllocation, setPendingAllocation] =
    useState<PendingAllocationState | null>(null);

  useEffect(() => {
    const allocation = readAllocationForTransfer();
    if (!allocation) {
      setPendingAllocation(null);
      return;
    }

    const existingTransfer = transfers.find(
      (transfer) => transfer.allocationId === allocation.allocationId,
    );

    if (existingTransfer && existingTransfer.status !== "DRAFT") {
      setPendingAllocation(null);
      return;
    }

    setPendingAllocation({
      allocation,
      existingDraft:
        existingTransfer?.status === "DRAFT" ? existingTransfer : null,
    });
  }, [transfers]);

  const createTransferLabel = pendingAllocation?.existingDraft
    ? "Continue Transfer"
    : "Create Transfer";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transfer Management"
        subtitle="Monitor inter-warehouse and hub-to-hub stock transfers across the network."
        actions={
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
                Operational Status
              </p>
              <p className="text-primary mt-0.5 text-lg font-bold">
                {formatOperationalDate(new Date())}
              </p>
            </div>
            <Button
              className="h-10 gap-2 px-4"
              disabled={!pendingAllocation}
              render={
                pendingAllocation ? (
                  <Link href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/new`} />
                ) : undefined
              }
            >
              <Truck className="size-4" />
              {createTransferLabel}
            </Button>
          </div>
        }
      />

      {pendingAllocation ? (
        <div className="flex flex-col gap-4 rounded-xl border border-orange-200 bg-orange-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
              <Package className="text-primary size-5" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">
                Allocation ready for transfer
              </p>
              <p className="mt-0.5 text-sm text-[#64748B]">
                {pendingAllocation.allocation.allocationId} ·{" "}
                {pendingAllocation.allocation.material} ·{" "}
                {formatWorkflowQuantity(
                  pendingAllocation.allocation.quantity,
                  pendingAllocation.allocation.unit,
                )}{" "}
                → {pendingAllocation.allocation.destinationHub}
              </p>
              {pendingAllocation.existingDraft ? (
                <p className="text-primary mt-1 text-xs font-semibold">
                  Draft {pendingAllocation.existingDraft.transferId} in progress
                </p>
              ) : null}
            </div>
          </div>
          <Button
            className="h-10 shrink-0 gap-2"
            render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/new`} />}
          >
            <Truck className="size-4" />
            {createTransferLabel}
          </Button>
        </div>
      ) : null}

      <TransferPage />
    </div>
  );
}
