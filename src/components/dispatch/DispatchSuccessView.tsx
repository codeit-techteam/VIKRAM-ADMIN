"use client";

import {
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatTransferTime } from "@/mock/transfers";
import type { TransferListItem } from "@/types/warehouse.types";
import { notify } from "@/utils/notify";

interface DispatchSuccessViewProps {
  transfer: TransferListItem;
}

export function DispatchSuccessView({ transfer }: DispatchSuccessViewProps) {
  const material =
    transfer.material ?? transfer.materials[0]?.split(" x")[0] ?? "Material";
  const qtyLabel = transfer.quantity
    ? `${transfer.quantity} ${transfer.quantityUnit ?? ""} ${material}`
    : material;
  const dispatchTime = transfer.dispatchAt
    ? formatTransferTime(transfer.dispatchAt)
    : formatTransferTime(new Date().toISOString());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      notify.success(
        "Inventory stocks auto-updated",
        `Warehouse ${transfer.sourceWarehouse} inventory deducted.`,
      );
    }, 800);
    return () => window.clearTimeout(timer);
  }, [transfer.sourceWarehouse]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4 text-center">
      <div className="relative mx-auto h-48 max-w-lg overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-white shadow-lg">
            <CheckCircle2 className="size-10 text-amber-700" />
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Dispatch Completed Successfully
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          The inventory has been logged and the vehicle has departed the
          facility.
        </p>
      </div>

      <div className="grid gap-4 text-left sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Logistics Details
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400">Transfer ID</p>
              <p className="font-bold">{transfer.transferId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Vehicle</p>
              <p className="font-bold">{transfer.vehicleNumber ?? "—"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Personnel & Destination
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400">Driver</p>
              <p className="font-bold">
                {transfer.assignedDriver?.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Destination</p>
              <p className="font-bold">{transfer.destinationHub}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Payload & Timestamp
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400">Material</p>
              <p className="font-bold">{qtyLabel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Time (IST)</p>
              <p className="font-bold">{dispatchTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          className="h-11 gap-2 px-6"
          render={
            <Link
              href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/${transfer.transferId}`}
            />
          }
        >
          <MapPin className="size-4" />
          Track Transfer
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-2 border-gray-200 px-6"
          render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers`} />}
        >
          <ClipboardList className="size-4" />
          Transfer Management
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-2 border-gray-200 px-6"
          render={<Link href={ROUTES.CENTRAL_WAREHOUSE} />}
        >
          <LayoutDashboard className="size-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
