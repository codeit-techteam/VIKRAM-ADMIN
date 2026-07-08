"use client";

import { AlertTriangle, CheckCircle2, MapPin, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatTransferTime } from "@/mock/transfers";
import { useTransferListStore } from "@/store/transfer-list-store";
import type { TransferListItem } from "@/types/warehouse.types";
import { notify } from "@/utils/notify";

interface DispatchConfirmViewProps {
  transfer: TransferListItem;
}

const PREREQUISITES = [
  "Inventory Reserved",
  "Vehicle Assigned",
  "Driver Assigned",
  "Loading Completed",
] as const;

export function DispatchConfirmView({ transfer }: DispatchConfirmViewProps) {
  const router = useRouter();
  const confirmDispatch = useTransferListStore(
    (state) => state.confirmDispatch,
  );

  const material =
    transfer.material ?? transfer.materials[0]?.split(" x")[0] ?? "Material";
  const qtyLabel = transfer.quantity
    ? `${transfer.quantity} ${transfer.quantityUnit ?? ""}`
    : "—";
  const weightLabel = transfer.estimatedWeightKg
    ? `${transfer.estimatedWeightKg.toLocaleString("en-IN")} KG`
    : "";

  const handleDispatch = () => {
    try {
      confirmDispatch(transfer.transferId);
      notify.success(
        "Dispatch confirmed",
        `${transfer.transferId} is now in transit.`,
      );
      router.push(
        `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}/success`,
      );
    } catch (error) {
      notify.error(
        "Dispatch failed",
        error instanceof Error ? error.message : "Unable to confirm dispatch.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Transfers", href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers` },
          {
            label: "Dispatch Queue",
            href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
          },
          { label: `Confirm Dispatch ${transfer.transferId}` },
        ]}
      />

      <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
        <AlertTriangle className="text-primary mt-0.5 size-5 shrink-0" />
        <p className="text-sm text-[#1A1A1A]">
          <span className="font-semibold">
            Important Security & Inventory Notice:
          </span>{" "}
          Dispatching will immediately deduct {weightLabel || qtyLabel} from{" "}
          {transfer.sourceWarehouse} inventory and initiate In-Transit tracking.
          This action is irreversible once confirmed.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs text-gray-400">Transaction ID</p>
            <p className="text-lg font-bold text-[#1A1A1A]">
              {transfer.transferId}
            </p>
          </div>
          <TransferStatusBadge transfer={transfer} />
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1A1A1A]">
              Logistics Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Vehicle Number</p>
                <p className="font-semibold">{transfer.vehicleNumber ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Assigned Driver</p>
                <p className="font-semibold">
                  {transfer.assignedDriver?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Consignment Weight</p>
                <p className="font-semibold">
                  {qtyLabel} {material}
                  {weightLabel ? ` (${weightLabel})` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1A1A1A]">
              Route & Timeline
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Source</p>
                <p className="font-semibold">{transfer.sourceWarehouse}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Destination</p>
                <p className="font-semibold">{transfer.destinationHub}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Estimated Arrival</p>
                <p className="text-primary font-bold">
                  {formatTransferTime(transfer.eta)}
                </p>
              </div>
            </div>
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
              <div className="text-center">
                <MapPin className="text-primary mx-auto size-6" />
                <p className="mt-2 text-xs text-[#64748B]">
                  {transfer.sourceWarehouse} → {transfer.destinationHub}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:grid-cols-4">
          {PREREQUISITES.map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="size-4 shrink-0 text-green-600" />
              <span className="font-medium text-[#1A1A1A]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="border-gray-200"
          render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch`} />}
        >
          Back to Queue
        </Button>
        <Button className="gap-2" onClick={handleDispatch}>
          <Rocket className="size-4" />
          Dispatch Now
        </Button>
      </div>
    </div>
  );
}
