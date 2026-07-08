"use client";

import { Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants/routes";
import { useTransferListStore } from "@/store/transfer-list-store";
import type {
  LoadingChecklist,
  TransferListItem,
} from "@/types/warehouse.types";
import {
  DEFAULT_LOADING_CHECKLIST,
  isLoadingChecklistComplete,
} from "@/utils/transfer-actions";
import { notify } from "@/utils/notify";

const CHECKLIST_ITEMS: Array<{
  key: keyof LoadingChecklist;
  label: string;
}> = [
  { key: "materialPicked", label: "Material Picked" },
  { key: "quantityVerified", label: "Quantity Verified" },
  { key: "vehicleReady", label: "Vehicle Ready" },
  { key: "driverPresent", label: "Driver Present" },
  { key: "documentsAttached", label: "Documents Attached" },
  { key: "gatePassGenerated", label: "Gate Pass Generated" },
];

const UPLOAD_ZONES = [
  { label: "INVOICE", hint: "PDF, JPG (Max 5MB)" },
  { label: "CHALLAN", hint: "Signed Copy Required" },
  { label: "GATE PASS", hint: "Digital Gate Pass Image" },
] as const;

interface LoadingConfirmationViewProps {
  transfer: TransferListItem;
}

export function LoadingConfirmationView({
  transfer,
}: LoadingConfirmationViewProps) {
  const router = useRouter();
  const updateLoadingChecklist = useTransferListStore(
    (state) => state.updateLoadingChecklist,
  );
  const completeLoading = useTransferListStore(
    (state) => state.completeLoading,
  );

  const checklist = useMemo(
    () => ({
      ...DEFAULT_LOADING_CHECKLIST,
      ...transfer.loadingChecklist,
    }),
    [transfer.loadingChecklist],
  );

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progress = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  const toggleItem = useCallback(
    (key: keyof LoadingChecklist, checked: boolean) => {
      updateLoadingChecklist(transfer.transferId, { [key]: checked });
    },
    [transfer.transferId, updateLoadingChecklist],
  );

  const handleComplete = () => {
    try {
      completeLoading(transfer.transferId);
      notify.success(
        "Loading completed",
        `${transfer.transferId} is ready for dispatch.`,
      );
      router.push(
        `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}/confirm`,
      );
    } catch (error) {
      notify.error(
        "Action failed",
        error instanceof Error ? error.message : "Unable to complete loading.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Transfers", href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers` },
          { label: transfer.transferId },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              Loading Confirmation
            </h1>
            <TransferStatusBadge transfer={transfer} />
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Status will update to &apos;Ready to Dispatch&apos; on completion.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#1A1A1A]">
            Loading Phase Step 2 of 3
          </span>
          <span className="text-[#64748B]">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#1A1A1A]">
            Verification Checklist
          </h2>
          <div className="mt-4 space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 hover:bg-gray-50/80"
              >
                <Checkbox
                  checked={checklist[item.key]}
                  onCheckedChange={(checked) =>
                    toggleItem(item.key, checked === true)
                  }
                />
                <span className="text-sm font-medium text-[#1A1A1A]">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[#1A1A1A]">Document Upload</h2>
          <div className="mt-4 space-y-3">
            {UPLOAD_ZONES.map((zone) => (
              <div
                key={zone.label}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center"
              >
                <Upload className="mb-2 size-6 text-gray-400" />
                <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  {zone.label}
                </p>
                <p className="mt-1 text-xs text-[#64748B]">{zone.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
        <Button
          variant="outline"
          className="border-gray-200"
          render={
            <Link
              href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}`}
            />
          }
        >
          Save Draft
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!isLoadingChecklistComplete(checklist)}
        >
          Complete Loading
        </Button>
      </div>
    </div>
  );
}
