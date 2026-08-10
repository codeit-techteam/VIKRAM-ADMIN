"use client";

import { Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants/routes";
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
  const [checklist, setChecklist] = useState<LoadingChecklist>({
    ...DEFAULT_LOADING_CHECKLIST,
    ...transfer.loadingChecklist,
  });

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progress = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);
  const canComplete = useMemo(
    () => isLoadingChecklistComplete(checklist),
    [checklist],
  );

  const handleComplete = () => {
    if (!canComplete) {
      notify.error(
        "Checklist incomplete",
        "Complete all loading checks before continuing.",
      );
      return;
    }
    notify.success(
      "Loading completed",
      `${transfer.transferId} is ready for dispatch.`,
    );
    router.push(
      `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.id}/confirm`,
    );
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Transfers", href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers` },
          {
            label: "Dispatch Queue",
            href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
          },
          { label: transfer.transferId },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Loading Confirmation
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Verify load checklist for {transfer.transferId} before dispatch.
          </p>
        </div>
        <TransferStatusBadge transfer={transfer} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            Checklist Progress
          </p>
          <p className="text-sm text-[#64748B]">{progress}%</p>
        </div>
        <Progress value={progress} className="h-2" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {CHECKLIST_ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 px-4 py-3"
            >
              <Checkbox
                checked={Boolean(checklist[item.key])}
                onCheckedChange={(checked) => {
                  setChecklist((current) => ({
                    ...current,
                    [item.key]: Boolean(checked),
                  }));
                }}
              />
              <span className="text-sm font-medium text-[#1A1A1A]">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Document Upload</h3>
        <p className="mt-1 text-sm text-[#64748B]">
          Optional supporting documents for gate clearance.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {UPLOAD_ZONES.map((zone) => (
            <div
              key={zone.label}
              className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 text-center"
            >
              <Upload className="text-primary size-5" />
              <p className="mt-2 text-xs font-bold tracking-wider text-[#1A1A1A]">
                {zone.label}
              </p>
              <p className="mt-1 text-[11px] text-[#64748B]">{zone.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="border-gray-200"
          render={
            <Link href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.id}`} />
          }
        >
          Back
        </Button>
        <Button onClick={handleComplete} disabled={!canComplete}>
          Complete Loading & Continue
        </Button>
      </div>
    </div>
  );
}
