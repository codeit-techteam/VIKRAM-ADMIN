"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  AddRemarksDialog,
  ReportDelayDialog,
  UpdateEtaDialog,
} from "@/components/transfers/TransferActionDialogs";
import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  formatTransferDateTime,
  formatTransferTime,
  getTransferEtaLabel,
} from "@/mock/transfers";
import { useTransferListStore } from "@/store/transfer-list-store";
import type {
  TransferListItem,
  TransferTimelineEventType,
} from "@/types/warehouse.types";
import {
  canCompleteLoading,
  canDispatchNow,
  canStartLoading,
  getPriorityLabel,
  getPriorityStyles,
  WORKFLOW_TIMELINE_STEPS,
} from "@/utils/transfer-actions";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

const TIMELINE_LABELS: Record<TransferTimelineEventType, string> = {
  TRANSFER_CREATED: "Pending Dispatch",
  VEHICLE_ASSIGNED: "Vehicle Assigned",
  DRIVER_ASSIGNED: "Driver Assigned",
  LOADING_STARTED: "Loading Started",
  LOADING_COMPLETED: "Loading Completed",
  READY_FOR_DISPATCH: "Ready to Dispatch",
  DISPATCH_STARTED: "Dispatch Started",
  IN_TRANSIT: "In Transit",
  REACHED_HUB: "Reached Hub",
  REACHED_DESTINATION: "Reached Destination",
  DELIVERED: "Delivered",
  HUB_RECEIVED: "Hub Received",
  DELAY_RECORDED: "Delay Recorded",
  COMPLETED: "Completed",
};

function TimelineStep({
  label,
  timestamp,
  actor,
  remarks,
  isCompleted,
  isLast,
}: {
  label: string;
  timestamp?: string;
  actor?: string;
  remarks?: string;
  isCompleted: boolean;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-6">
      {!isLast ? (
        <span
          className={cn(
            "absolute top-6 left-[11px] h-[calc(100%-8px)] w-px",
            isCompleted ? "bg-primary/30" : "bg-gray-200",
          )}
        />
      ) : null}
      <div className="relative z-10 mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="text-primary size-[22px]" />
        ) : (
          <Circle className="size-[22px] text-gray-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            isCompleted ? "text-[#1A1A1A]" : "text-[#64748B]",
          )}
        >
          {label}
        </p>
        {timestamp ? (
          <p className="text-xs text-[#64748B]">
            {formatTransferDateTime(timestamp)}
          </p>
        ) : (
          <p className="text-xs text-gray-400">Pending</p>
        )}
        {actor ? (
          <p className="mt-1 text-xs text-[#64748B]">
            <span className="font-medium text-[#1A1A1A]">{actor}</span>
          </p>
        ) : null}
        {remarks ? (
          <p className="mt-0.5 text-xs text-[#64748B]">{remarks}</p>
        ) : null}
      </div>
    </div>
  );
}

interface TransferDetailPageProps {
  transfer: TransferListItem;
}

export function TransferDetailPage({ transfer }: TransferDetailPageProps) {
  const router = useRouter();
  const updateEta = useTransferListStore((state) => state.updateEta);
  const addRemarks = useTransferListStore((state) => state.addRemarks);
  const reportDelay = useTransferListStore((state) => state.reportDelay);
  const markReachedHub = useTransferListStore((state) => state.markReachedHub);
  const startLoading = useTransferListStore((state) => state.startLoading);
  const receiveAtHub = useTransferListStore((state) => state.receiveAtHub);

  const [etaDialogOpen, setEtaDialogOpen] = useState(false);
  const [delayDialogOpen, setDelayDialogOpen] = useState(false);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);

  const isInTransit = transfer.status === "IN_TRANSIT";
  const isViewOnly =
    transfer.status === "DELIVERED" || transfer.status === "CANCELLED";

  const material =
    transfer.material ?? transfer.materials[0]?.split(" x")[0] ?? "—";
  const etaLabel = getTransferEtaLabel(transfer);

  const timelineSteps = useMemo(() => {
    return WORKFLOW_TIMELINE_STEPS.map((type) => {
      const event = transfer.timeline.find((e) => e.type === type);
      return {
        type,
        label: TIMELINE_LABELS[type],
        timestamp: event?.timestamp,
        actor: event?.actor,
        remarks: event?.remarks ?? event?.description,
        isCompleted: Boolean(event),
      };
    });
  }, [transfer.timeline]);

  const handleUpdateEta = (newEta: string, remarks?: string) => {
    try {
      updateEta(transfer.transferId, newEta, remarks);
      notify.success("ETA updated", "Estimated arrival time revised.");
    } catch (error) {
      notify.error(
        "Update failed",
        error instanceof Error ? error.message : "Unable to update ETA.",
      );
    }
  };

  const handleReportDelay = (newEta: string, reason: string) => {
    try {
      reportDelay(transfer.transferId, newEta, reason);
      notify.warning("Delay recorded", reason);
    } catch (error) {
      notify.error(
        "Action failed",
        error instanceof Error ? error.message : "Unable to report delay.",
      );
    }
  };

  const handleAddRemarks = (remarks: string) => {
    try {
      addRemarks(transfer.transferId, remarks);
      notify.success("Remark added", "Timeline updated.");
    } catch (error) {
      notify.error(
        "Action failed",
        error instanceof Error ? error.message : "Unable to add remark.",
      );
    }
  };

  const handleMarkReachedHub = () => {
    try {
      markReachedHub(transfer.transferId);
      notify.success(
        "Reached hub",
        `${transfer.transferId} is now visible in Hub Receiving.`,
      );
    } catch (error) {
      notify.error(
        "Action failed",
        error instanceof Error ? error.message : "Unable to mark reached hub.",
      );
    }
  };

  const handleStartLoading = () => {
    try {
      startLoading(transfer.transferId);
      notify.success(
        "Loading started",
        `${transfer.transferId} is now loading.`,
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

  const handleConfirmDelivery = () => {
    try {
      receiveAtHub(transfer.transferId);
      notify.success(
        "Delivery confirmed",
        `Inventory updated at ${transfer.destinationHub}.`,
      );
    } catch (error) {
      notify.error(
        "Action failed",
        error instanceof Error ? error.message : "Unable to confirm delivery.",
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {transfer.transferId}
            </h1>
            <TransferStatusBadge transfer={transfer} />
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                getPriorityStyles(transfer),
              )}
            >
              {getPriorityLabel(transfer)} Priority
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Transfer summary, timeline, and manual status controls
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-gray-200"
          render={<Link href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers`} />}
        >
          <ArrowLeft className="size-4" />
          Back to Transfers
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              Transfer Summary
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryField
                label="Driver"
                value={transfer.assignedDriver?.name ?? "—"}
                icon={User}
              />
              <SummaryField
                label="Vehicle"
                value={transfer.vehicleNumber ?? "—"}
                icon={Truck}
              />
              <SummaryField
                label="Warehouse"
                value={transfer.sourceWarehouse}
                icon={MapPin}
              />
              <SummaryField
                label="Destination Hub"
                value={transfer.destinationHub}
                icon={MapPin}
              />
              <SummaryField label="Material" value={material} icon={Package} />
              <SummaryField
                label="Quantity"
                value={
                  transfer.quantity
                    ? `${transfer.quantity.toLocaleString("en-IN")} ${transfer.quantityUnit ?? ""}`
                    : "—"
                }
              />
              <SummaryField
                label="ETA"
                value={
                  <span>
                    {formatTransferTime(transfer.eta)}
                    {etaLabel ? (
                      <span
                        className={cn(
                          "mt-0.5 block text-xs font-medium",
                          etaLabel.tone === "warning" && "text-orange-600",
                          etaLabel.tone === "success" && "text-green-600",
                        )}
                      >
                        {etaLabel.label}
                      </span>
                    ) : null}
                  </span>
                }
                icon={Clock}
              />
              <SummaryField
                label="Dispatch Time"
                value={
                  transfer.dispatchAt
                    ? formatTransferDateTime(transfer.dispatchAt)
                    : "—"
                }
              />
              <SummaryField
                label="Expected Arrival"
                value={formatTransferDateTime(transfer.eta)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 pl-3 shadow-sm">
            <h2 className="mb-4 pl-2 text-sm font-bold text-[#1A1A1A]">
              Transfer Timeline
            </h2>
            {timelineSteps.map((step, index) => (
              <TimelineStep
                key={step.type}
                label={step.label}
                timestamp={step.timestamp}
                actor={step.actor}
                remarks={step.remarks}
                isCompleted={step.isCompleted}
                isLast={index === timelineSteps.length - 1}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#1A1A1A]">Current Status</h2>
            <div className="mt-3">
              <TransferStatusBadge transfer={transfer} className="text-sm" />
            </div>
            {transfer.isDelayed && transfer.delayInfo ? (
              <div className="mt-4 rounded-lg border border-orange-100 bg-orange-50/50 p-3 text-xs">
                <p className="font-semibold text-orange-700">Delayed</p>
                <p className="mt-1 text-[#64748B]">
                  {transfer.delayInfo.reason}
                </p>
                <p className="mt-1 text-[#64748B]">
                  Revised ETA:{" "}
                  {formatTransferDateTime(transfer.delayInfo.newEta)}
                </p>
              </div>
            ) : null}
          </div>

          {transfer.status === "TRANSFER_CREATED" &&
          canStartLoading(transfer) ? (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1A1A]">
                Dispatch Actions
              </h2>
              <Button className="mt-4 w-full" onClick={handleStartLoading}>
                Start Loading
              </Button>
            </div>
          ) : null}

          {transfer.status === "LOADING" && canCompleteLoading(transfer) ? (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1A1A]">
                Dispatch Actions
              </h2>
              <Button
                className="mt-4 w-full"
                render={
                  <Link
                    href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}/loading`}
                  />
                }
              >
                Complete Loading
              </Button>
            </div>
          ) : null}

          {transfer.status === "READY_FOR_DISPATCH" &&
          canDispatchNow(transfer) ? (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1A1A]">
                Dispatch Actions
              </h2>
              <Button
                className="mt-4 w-full"
                render={
                  <Link
                    href={`${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}/confirm`}
                  />
                }
              >
                Dispatch Now
              </Button>
            </div>
          ) : null}

          {isInTransit ? (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1A1A]">
                Manual Status Update
              </h2>
              <p className="mt-1 text-xs text-[#64748B]">
                No GPS integration — update transfer status manually.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200"
                  onClick={() => setEtaDialogOpen(true)}
                >
                  Update ETA
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200"
                  onClick={() => setRemarksDialogOpen(true)}
                >
                  Add Remarks
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200"
                  onClick={() => setDelayDialogOpen(true)}
                >
                  Report Delay
                </Button>
                <Button className="w-full" onClick={handleMarkReachedHub}>
                  Mark Reached Hub
                </Button>
              </div>
            </div>
          ) : null}

          {transfer.status === "REACHED_HUB" ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
              <p className="text-sm font-semibold text-amber-800">
                Waiting For Hub Receipt
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                Confirm delivery to update hub inventory and close this
                transfer.
              </p>
              <Button className="mt-3 w-full" onClick={handleConfirmDelivery}>
                Confirm Delivery
              </Button>
              <Button
                className="mt-2 w-full"
                variant="outline"
                render={
                  <Link href={`${ROUTES.CENTRAL_WAREHOUSE}/hub-receiving`} />
                }
              >
                Go to Hub Receiving
              </Button>
            </div>
          ) : null}

          {isViewOnly ? (
            <div className="rounded-xl border border-green-100 bg-green-50/50 p-5">
              <p className="text-sm font-semibold text-green-800">View Only</p>
              <p className="mt-1 text-xs text-[#64748B]">
                This transfer has been delivered and closed.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <UpdateEtaDialog
        open={etaDialogOpen}
        onOpenChange={setEtaDialogOpen}
        currentEta={transfer.eta}
        onSubmit={handleUpdateEta}
      />
      <ReportDelayDialog
        open={delayDialogOpen}
        onOpenChange={setDelayDialogOpen}
        currentEta={transfer.eta}
        onSubmit={handleReportDelay}
      />
      <AddRemarksDialog
        open={remarksDialogOpen}
        onOpenChange={setRemarksDialogOpen}
        onSubmit={handleAddRemarks}
      />
    </div>
  );
}

function SummaryField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-2">
      {Icon ? <Icon className="text-primary mt-0.5 size-4 shrink-0" /> : null}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
          {value}
        </div>
      </div>
    </div>
  );
}
