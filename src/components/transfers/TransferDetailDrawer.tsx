"use client";

import {
  CheckCircle2,
  Circle,
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
import {
  formatTransferDateTime,
  formatTransferTime,
  getTransferEtaLabel,
} from "@/mock/transfers";
import type { TransferListItem } from "@/types/warehouse.types";
import { getPriorityLabel, getPriorityStyles } from "@/utils/transfer-actions";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

interface TransferDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: TransferListItem | null;
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
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-[#1A1A1A]">{value}</div>
    </div>
  );
}

function TimelineItem({
  label,
  timestamp,
  description,
  isLast,
  isCompleted,
}: {
  label: string;
  timestamp: string;
  description?: string;
  isLast: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-6">
      {!isLast ? (
        <span
          className="absolute top-6 left-[11px] h-[calc(100%-12px)] w-px bg-gray-200"
          aria-hidden="true"
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
        <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
        <p className="text-xs text-[#64748B]">
          {formatTransferDateTime(timestamp)}
        </p>
        {description ? (
          <p className="mt-1 text-xs text-[#64748B]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function TransferDetailDrawer({
  open,
  onOpenChange,
  transfer,
}: TransferDetailDrawerProps) {
  if (!transfer) return null;

  const etaLabel = getTransferEtaLabel(transfer);
  const materialLabel =
    transfer.material ?? transfer.materials[0]?.split(" x")[0] ?? "—";

  const handleDownload = (name: string) => {
    notify.success("Download started", name);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[640px]">
        <SheetHeader className="border-b border-gray-100 pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Truck className="text-primary size-5" />
            {transfer.transferId}
          </SheetTitle>
          <SheetDescription>
            Transfer details, timeline, and dispatch information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <DetailSection title="Current Status">
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
          </DetailSection>

          <DetailSection title="Transfer Summary">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <DetailField label="Transfer ID" value={transfer.transferId} />
              <DetailField
                label="Created"
                value={formatTransferDateTime(transfer.createdAt)}
              />
              <DetailField
                label="Source Warehouse"
                value={transfer.sourceWarehouse}
              />
              <DetailField
                label="Destination Hub"
                value={transfer.destinationHub}
              />
            </div>
          </DetailSection>

          <DetailSection title="Material Information">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Package className="text-primary size-5" />
                </div>
                <div className="grid flex-1 grid-cols-2 gap-3">
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
            </div>
          </DetailSection>

          <DetailSection title="Allocation Information">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 p-4">
              <DetailField
                label="Allocation ID"
                value={transfer.allocationId ?? "—"}
              />
              <DetailField
                label="Requisition ID"
                value={transfer.requisitionId ?? "—"}
              />
            </div>
          </DetailSection>

          <DetailSection title="Vehicle">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
              <Truck className="text-primary size-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {transfer.vehicleNumber ?? "Not assigned"}
                </p>
                {transfer.vehicleId ? (
                  <p className="text-xs text-[#64748B]">
                    Fleet ID: {transfer.vehicleId}
                  </p>
                ) : null}
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Driver">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
              <User className="text-primary size-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {transfer.assignedDriver?.name ?? "Not assigned"}
                </p>
                {transfer.assignedDriver ? (
                  <p className="text-xs text-[#64748B]">
                    {transfer.assignedDriver.employeeId}
                  </p>
                ) : null}
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Dispatch Information">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 p-4">
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
                    <span
                      className={cn(
                        "mt-0.5 block text-xs font-medium",
                        etaLabel.tone === "success" && "text-green-600",
                        etaLabel.tone === "warning" && "text-orange-600",
                        etaLabel.tone === "muted" && "text-[#64748B]",
                      )}
                    >
                      {etaLabel.label}
                    </span>
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
          </DetailSection>

          <DetailSection title="Timeline">
            {transfer.timeline.length > 0 ? (
              <div className="pl-1">
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
              <p className="text-sm text-[#64748B]">
                No timeline events recorded yet.
              </p>
            )}
          </DetailSection>

          <DetailSection title="Activity Logs">
            {transfer.activityLogs.length > 0 ? (
              <div className="space-y-2">
                {transfer.activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {log.action}
                      </p>
                      <p className="shrink-0 text-xs text-[#64748B]">
                        {formatTransferDateTime(log.timestamp)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      {log.actor}
                      {log.details ? ` — ${log.details}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No activity logged yet.</p>
            )}
          </DetailSection>

          <DetailSection title="Documents">
            {transfer.documents.length > 0 ? (
              <div className="space-y-2">
                {transfer.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3"
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
              <p className="text-sm text-[#64748B]">
                Documents will appear after dispatch.
              </p>
            )}
          </DetailSection>

          <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3 text-xs text-[#64748B]">
            <MapPin className="size-3.5 shrink-0" />
            {transfer.sourceWarehouse} → {transfer.destinationHub}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
