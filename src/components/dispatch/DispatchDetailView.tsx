"use client";

import { ArrowRight, MapPin, Package, Play, Truck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatTransferDateTime } from "@/mock/transfers";
import { useTransferListStore } from "@/store/transfer-list-store";
import type { TransferListItem } from "@/types/warehouse.types";
import { canStartLoading } from "@/utils/transfer-actions";
import { notify } from "@/utils/notify";

interface DispatchDetailViewProps {
  transfer: TransferListItem;
}

export function DispatchDetailView({ transfer }: DispatchDetailViewProps) {
  const router = useRouter();
  const startLoading = useTransferListStore((state) => state.startLoading);

  const material =
    transfer.material ?? transfer.materials[0]?.split(" x")[0] ?? "—";
  const qtyLabel = transfer.quantity
    ? `${transfer.quantity.toLocaleString("en-IN")} ${transfer.quantityUnit ?? ""}`
    : "—";
  const weightLabel = transfer.estimatedWeightKg
    ? `${transfer.estimatedWeightKg.toLocaleString("en-IN")} KG`
    : "—";

  const handleStartLoading = () => {
    try {
      startLoading(transfer.transferId);
      notify.success(
        "Loading started",
        `${transfer.transferId} loading initiated.`,
      );
      router.push(
        `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}/loading`,
      );
    } catch (error) {
      notify.error(
        "Action failed",
        error instanceof Error ? error.message : "Unable to start loading.",
      );
    }
  };

  const showStartLoading =
    transfer.status === "TRANSFER_CREATED" && canStartLoading(transfer);
  const showContinueLoading = transfer.status === "LOADING";
  const showDispatchNow = transfer.status === "READY_FOR_DISPATCH";

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          {
            label: "Dispatch Queue",
            href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
          },
          { label: transfer.transferId },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              Dispatch {transfer.transferId}
            </h1>
            <TransferStatusBadge transfer={transfer} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-200"
            render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch`} />}
          >
            Cancel
          </Button>
          {showStartLoading ? (
            <Button className="gap-2" onClick={handleStartLoading}>
              <Play className="size-4" />
              Start Loading
            </Button>
          ) : null}
          {showContinueLoading ? (
            <Button
              className="gap-2"
              render={
                <Link
                  href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}/loading`}
                />
              }
            >
              Loading Confirmation
            </Button>
          ) : null}
          {showDispatchNow ? (
            <Button
              className="gap-2"
              render={
                <Link
                  href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}/confirm`}
                />
              }
            >
              Dispatch Now
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              Transfer Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Transfer ID</p>
                <p className="font-semibold">{transfer.transferId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Allocation ID</p>
                <p className="font-semibold">{transfer.allocationId ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Expected Arrival</p>
                <p className="font-semibold">
                  {formatTransferDateTime(transfer.eta)}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-[#1A1A1A]">Logistics Path</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-primary mt-1 size-2.5 shrink-0 rounded-full" />
                <div>
                  <p className="text-xs text-gray-400">Source</p>
                  <p className="text-sm font-semibold">
                    {transfer.sourceWarehouse}
                  </p>
                </div>
              </div>
              <div className="ml-1 h-6 border-l border-dashed border-gray-200" />
              <div className="flex gap-3">
                <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Destination</p>
                  <p className="text-sm font-semibold">
                    {transfer.destinationHub}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-[#1A1A1A]">Vehicle & Crew</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                <Truck className="text-primary mt-0.5 size-4" />
                <div>
                  <p className="text-sm font-semibold">
                    {transfer.vehicleNumber ?? "Not assigned"}
                  </p>
                  <p className="text-xs text-[#64748B]">Assigned vehicle</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                <User className="text-primary mt-0.5 size-4" />
                <div>
                  <p className="text-sm font-semibold">
                    {transfer.assignedDriver?.name ?? "Not assigned"}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {transfer.assignedDriver?.employeeId ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
            <Package className="text-primary size-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Primary Material: {material}
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Quantity</p>
                <p className="text-lg font-bold">{qtyLabel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Payload Weight</p>
                <p className="text-lg font-bold">{weightLabel}</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-gray-200"
            render={
              <Link
                href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/${transfer.transferId}`}
              />
            }
          >
            Track
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
