"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  FileText,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";

import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatTransferDateTime,
  formatTransferTime,
  getTransferEtaLabel,
} from "@/mock/transfers";
import type { TransferListItem, TransferStatus } from "@/types/warehouse.types";
import {
  getPriorityLabel,
  getPriorityStyles,
  hasDriverAssigned,
  hasVehicleAssigned,
} from "@/utils/transfer-actions";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

interface TransferDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: TransferListItem | null;
}

const WORKFLOW_STEPS: Array<{ status: TransferStatus; label: string }> = [
  { status: "DRAFT", label: "Transfer Draft" },
  { status: "CREATED", label: "Transfer Created" },
  { status: "VEHICLE_ASSIGNED", label: "Vehicle Assigned" },
  { status: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { status: "PENDING_DISPATCH", label: "Pending Dispatch" },
  { status: "IN_TRANSIT", label: "In Transit" },
  { status: "DELIVERED", label: "Delivered" },
  { status: "COMPLETED", label: "Completed" },
];

const STATUS_ORDER: TransferStatus[] = [
  "DRAFT",
  "CREATED",
  "VEHICLE_ASSIGNED",
  "DRIVER_ASSIGNED",
  "READY_FOR_DISPATCH",
  "PENDING_DISPATCH",
  "DISPATCH_STARTED",
  "IN_TRANSIT",
  "DELIVERED",
  "HUB_RECEIVED",
  "COMPLETED",
];

function getStatusIndex(status: TransferStatus): number {
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? 0 : index;
}

function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-[#1A1A1A]">{value}</div>
    </div>
  );
}

function InfoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-gray-50/60 p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FleetCard({
  icon: Icon,
  title,
  primary,
  secondary,
  empty,
}: {
  icon: React.ElementType;
  title: string;
  primary: string;
  secondary?: string;
  empty?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        empty
          ? "border-dashed border-gray-200 bg-gray-50/40"
          : "border-gray-100 bg-white",
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          empty ? "bg-gray-100" : "bg-primary/10",
        )}
      >
        <Icon
          className={cn("size-5", empty ? "text-gray-400" : "text-primary")}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          {title}
        </p>
        <p
          className={cn(
            "mt-1 text-sm font-semibold",
            empty ? "text-[#64748B]" : "text-[#1A1A1A]",
          )}
        >
          {primary}
        </p>
        {secondary ? (
          <p className="mt-0.5 text-xs text-[#64748B]">{secondary}</p>
        ) : null}
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  timestamp,
  description,
  isLast,
  isCompleted,
  isCurrent,
}: {
  label: string;
  timestamp?: string;
  description?: string;
  isLast: boolean;
  isCompleted: boolean;
  isCurrent?: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-5">
      {!isLast ? (
        <span
          className={cn(
            "absolute top-6 left-[11px] h-[calc(100%-8px)] w-px",
            isCompleted ? "bg-primary/30" : "bg-gray-200",
          )}
          aria-hidden="true"
        />
      ) : null}
      <div className="relative z-10 mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="text-primary size-[22px]" />
        ) : isCurrent ? (
          <div className="border-primary flex size-[22px] items-center justify-center rounded-full border-2 bg-orange-50">
            <div className="bg-primary size-2 rounded-full" />
          </div>
        ) : (
          <Circle className="size-[22px] text-gray-300" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={cn(
            "text-sm font-semibold",
            isCompleted || isCurrent ? "text-[#1A1A1A]" : "text-[#64748B]",
          )}
        >
          {label}
        </p>
        {timestamp ? (
          <p className="text-xs text-[#64748B]">
            {formatTransferDateTime(timestamp)}
          </p>
        ) : isCurrent ? (
          <p className="text-primary text-xs font-medium">In progress</p>
        ) : (
          <p className="text-xs text-gray-400">Pending</p>
        )}
        {description ? (
          <p className="mt-1 text-xs text-[#64748B]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function WorkflowTimeline({ transfer }: { transfer: TransferListItem }) {
  const currentIndex = getStatusIndex(transfer.status);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 pl-2">
      {WORKFLOW_STEPS.map((step, index) => {
        const stepIndex = getStatusIndex(step.status);
        const isCompleted = stepIndex < currentIndex;
        const isCurrent =
          transfer.status === step.status ||
          (step.status === "PENDING_DISPATCH" &&
            (transfer.status === "READY_FOR_DISPATCH" ||
              transfer.status === "DISPATCH_STARTED")) ||
          (step.status === "IN_TRANSIT" &&
            (transfer.status === "DISPATCH_STARTED" ||
              transfer.status === "HUB_RECEIVED"));

        const timelineEvent = transfer.timeline.find((event) =>
          event.label
            .toLowerCase()
            .includes(step.label.toLowerCase().split(" ")[0]),
        );

        return (
          <TimelineItem
            key={step.status}
            label={step.label}
            timestamp={timelineEvent?.timestamp}
            description={timelineEvent?.description}
            isLast={index === WORKFLOW_STEPS.length - 1}
            isCompleted={isCompleted}
            isCurrent={isCurrent && !isCompleted}
          />
        );
      })}
    </div>
  );
}

export function TransferDetailDrawer({
  open,
  onOpenChange,
  transfer,
}: TransferDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("timeline");

  useEffect(() => {
    if (open && transfer) {
      setActiveTab("timeline");
    }
  }, [open, transfer?.transferId]);

  const etaLabel = transfer ? getTransferEtaLabel(transfer) : null;
  const materialLabel = transfer
    ? (transfer.material ?? transfer.materials[0]?.split(" x")[0] ?? "—")
    : "—";

  const handleDownload = (name: string) => {
    notify.success("Download started", name);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-100 px-6 py-5 pr-14 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="flex items-center gap-2 text-xl font-bold text-[#1A1A1A]">
                <span className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
                  <Truck className="text-primary size-5" />
                </span>
                {transfer?.transferId ?? "Transfer Details"}
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
                Transfer details, timeline, and dispatch information
              </SheetDescription>
            </div>
            {transfer ? (
              <div className="flex flex-wrap items-center gap-2">
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
            ) : null}
          </div>

          {transfer ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3">
              <MapPin className="text-primary size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                  {transfer.sourceWarehouse}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-orange-400" />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                  {transfer.destinationHub}
                </p>
              </div>
            </div>
          ) : null}
        </SheetHeader>

        {transfer ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-6 px-6 py-5">
              <DetailSection title="Transfer Summary">
                <InfoCard>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-2">
                    <DetailField
                      label="Transfer ID"
                      value={transfer.transferId}
                    />
                    <DetailField
                      label="Created"
                      value={formatTransferDateTime(transfer.createdAt)}
                    />
                    <DetailField
                      label="Allocation ID"
                      value={transfer.allocationId ?? "—"}
                    />
                    <DetailField
                      label="Requisition ID"
                      value={transfer.requisitionId ?? "—"}
                    />
                  </div>
                </InfoCard>
              </DetailSection>

              <DetailSection title="Material Information">
                <InfoCard>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-xl">
                      <Package className="text-primary size-5" />
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-4">
                      <DetailField label="Material" value={materialLabel} />
                      <DetailField label="SKU" value={transfer.sku ?? "—"} />
                      <DetailField
                        label="Reserved Quantity"
                        value={
                          transfer.quantity
                            ? `${transfer.quantity.toLocaleString("en-IN")} ${transfer.quantityUnit ?? ""}`
                            : "—"
                        }
                      />
                      <DetailField
                        label="Est. Weight"
                        value={
                          transfer.estimatedWeightKg
                            ? `${transfer.estimatedWeightKg.toLocaleString("en-IN")} kg`
                            : "—"
                        }
                      />
                    </div>
                  </div>
                </InfoCard>
              </DetailSection>

              <DetailSection title="Fleet Assignment">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FleetCard
                    icon={Truck}
                    title="Vehicle"
                    primary={transfer.vehicleNumber ?? "Not assigned"}
                    secondary={
                      transfer.vehicleId
                        ? `Fleet ID: ${transfer.vehicleId}`
                        : undefined
                    }
                    empty={!hasVehicleAssigned(transfer)}
                  />
                  <FleetCard
                    icon={User}
                    title="Driver"
                    primary={transfer.assignedDriver?.name ?? "Not assigned"}
                    secondary={transfer.assignedDriver?.employeeId}
                    empty={!hasDriverAssigned(transfer)}
                  />
                </div>
              </DetailSection>

              <DetailSection title="Dispatch Information">
                <InfoCard>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    <DetailField
                      label="Dispatch Date"
                      value={
                        transfer.dispatchAt
                          ? formatTransferDateTime(transfer.dispatchAt)
                          : "—"
                      }
                    />
                    <DetailField
                      label="ETA"
                      value={
                        <span>
                          {formatTransferTime(transfer.eta)}
                          {etaLabel ? (
                            <span
                              className={cn(
                                "mt-0.5 block text-xs font-medium",
                                etaLabel.tone === "success" && "text-green-600",
                                etaLabel.tone === "warning" &&
                                  "text-orange-600",
                                etaLabel.tone === "muted" && "text-[#64748B]",
                              )}
                            >
                              {etaLabel.label}
                            </span>
                          ) : null}
                        </span>
                      }
                    />
                    <DetailField
                      label="Gate Pass"
                      value={transfer.gatePassId ?? "—"}
                    />
                    <DetailField
                      label="Delivered At"
                      value={
                        transfer.deliveredAt
                          ? formatTransferDateTime(transfer.deliveredAt)
                          : "—"
                      }
                    />
                  </div>
                </InfoCard>
              </DetailSection>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid h-10 w-full grid-cols-3 bg-gray-100/80">
                  <TabsTrigger value="timeline" className="text-xs sm:text-sm">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs sm:text-sm">
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs sm:text-sm">
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-4 space-y-4">
                  {transfer.timeline.length > 0 ? (
                    <div className="rounded-xl border border-gray-100 bg-white p-4 pl-2">
                      {transfer.timeline.map((event, index) => (
                        <TimelineItem
                          key={event.id}
                          label={event.label}
                          timestamp={event.timestamp}
                          description={event.description}
                          isLast={index === transfer.timeline.length - 1}
                          isCompleted
                        />
                      ))}
                    </div>
                  ) : (
                    <WorkflowTimeline transfer={transfer} />
                  )}
                  {transfer.timeline.length === 0 ? (
                    <p className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Clock className="size-3.5" />
                      Workflow progress — events will be logged as actions are
                      completed.
                    </p>
                  ) : null}
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  {transfer.activityLogs.length > 0 ? (
                    <div className="space-y-2">
                      {transfer.activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-xl border border-gray-100 bg-white px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                              {log.action}
                            </p>
                            <p className="shrink-0 text-xs text-[#64748B]">
                              {formatTransferDateTime(log.timestamp)}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-[#64748B]">
                            <span className="font-medium text-[#1A1A1A]">
                              {log.actor}
                            </span>
                            {log.details ? ` — ${log.details}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">
                      <Clock className="mx-auto size-8 text-gray-300" />
                      <p className="mt-2 text-sm font-medium text-[#64748B]">
                        No activity logged yet
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Actions on this transfer will appear here.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  {transfer.documents.length > 0 ? (
                    <div className="space-y-2">
                      {transfer.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
                              <FileText className="text-primary size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#1A1A1A]">
                                {doc.name}
                              </p>
                              <p className="text-xs text-[#64748B] capitalize">
                                {doc.type.replace("-", " ")}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDownload(doc.name)}
                            aria-label={`Download ${doc.name}`}
                          >
                            <Download className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">
                      <FileText className="mx-auto size-8 text-gray-300" />
                      <p className="mt-2 text-sm font-medium text-[#64748B]">
                        No documents yet
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Gate pass and dispatch logs appear after dispatch
                        starts.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-[#64748B]">
            Select a transfer to view details.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
