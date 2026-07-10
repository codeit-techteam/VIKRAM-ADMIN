"use client";

import { ArrowRightLeft, Check, Clock3, Printer, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { RequisitionConfirmDialog } from "@/components/requisitions/RequisitionConfirmDialog";
import { RequisitionPriorityBadge } from "@/components/requisitions/RequisitionPriorityBadge";
import { RequisitionStatusBadge } from "@/components/requisitions/RequisitionStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { HubRequisitionDetailView } from "@/mock/hub-requisitions";
import { formatHubRequisitionDate } from "@/mock/hub-requisitions";
import { formatRequisitionQuantity } from "@/mock/requisitions";
import type { RequisitionListItem } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface HubRequisitionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: HubRequisitionDetailView | null;
  isSubmitting?: boolean;
  initialAction?: "approve" | "reject" | null;
  onApprove: (remarks: string) => void;
  onReject: (remarks: string) => void;
  onGenerateTransfer?: () => void;
  onPrint?: () => void;
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

const timelineVariantStyles = {
  default: "border-gray-200 bg-white",
  success: "border-emerald-200 bg-emerald-50/50",
  danger: "border-red-200 bg-red-50/50",
  info: "border-blue-200 bg-blue-50/50",
} as const;

export function HubRequisitionDetailDrawer({
  open,
  onOpenChange,
  detail,
  isSubmitting = false,
  initialAction = null,
  onApprove,
  onReject,
  onGenerateTransfer,
  onPrint,
}: HubRequisitionDetailDrawerProps) {
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [confirmType, setConfirmType] = useState<"approve" | "reject" | null>(
    null,
  );

  const requisition = detail?.requisition ?? null;
  const isPending = requisition?.status === "PENDING";
  const canGenerateTransfer =
    requisition?.status === "APPROVED" && Boolean(requisition.allocationId);

  const approvedQty = useMemo(() => {
    if (!requisition) return null;
    if (requisition.status === "PENDING" || requisition.status === "REJECTED") {
      return null;
    }
    return requisition.approvedQty ?? requisition.requestedQty;
  }, [requisition]);

  useEffect(() => {
    if (open && requisition) {
      setRemarks(requisition.adminRemarks ?? requisition.rejectionReason ?? "");
      setRemarksError(null);
      setConfirmType(null);
    }
  }, [open, requisition]);

  useEffect(() => {
    if (!open || !isPending || !initialAction) return;

    if (initialAction === "approve") {
      setConfirmType("approve");
      return;
    }

    if (initialAction === "reject") {
      window.setTimeout(() => {
        document
          .querySelector<HTMLTextAreaElement>("[data-hub-requisition-remarks]")
          ?.focus();
      }, 100);
    }
  }, [open, isPending, initialAction]);

  const handleApproveClick = () => {
    setRemarksError(null);
    setConfirmType("approve");
  };

  const handleRejectClick = () => {
    if (!remarks.trim()) {
      setRemarksError("Rejection remarks are required.");
      return;
    }

    setRemarksError(null);
    setConfirmType("reject");
  };

  const handleConfirm = () => {
    if (!confirmType) return;

    if (confirmType === "approve") {
      onApprove(remarks.trim());
      return;
    }

    onReject(remarks.trim());
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton
          className="flex w-full flex-col gap-0 p-0 sm:max-w-[640px]"
        >
          <SheetHeader className="border-b border-gray-100 px-6 py-5 text-left">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <SheetTitle className="text-xl font-bold text-[#1A1A1A]">
                  Hub Requisition
                </SheetTitle>
                <SheetDescription className="mt-1 text-sm text-[#64748B]">
                  {requisition
                    ? `${requisition.requestId} · ${requisition.hubName}`
                    : "Review request details and take action."}
                </SheetDescription>
              </div>
              {requisition ? (
                <RequisitionStatusBadge status={requisition.status} />
              ) : null}
            </div>
          </SheetHeader>

          {detail && requisition ? (
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <DetailSection title="Hub Information">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <DetailField label="Hub" value={requisition.hubName} />
                  <DetailField label="Manager" value={detail.hubManager} />
                  <DetailField label="City" value={detail.hubCity} />
                  <DetailField label="Region" value={detail.hubRegion} />
                  <DetailField
                    label="Destination Warehouse"
                    value={requisition.destinationWarehouse}
                  />
                  <DetailField
                    label="Priority"
                    value={
                      <RequisitionPriorityBadge
                        priority={requisition.priority}
                      />
                    }
                  />
                </div>
              </DetailSection>

              <DetailSection title="Requested Materials">
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 hover:bg-transparent">
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          SKU
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Material
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Requested
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Approved
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-gray-100">
                        <TableCell className="text-sm text-[#64748B]">
                          {requisition.sku}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-semibold text-[#1A1A1A]">
                            {requisition.material}
                          </p>
                          {requisition.materialSpec ? (
                            <p className="text-xs text-[#64748B]">
                              {requisition.materialSpec}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm text-[#64748B]">
                          {formatRequisitionQuantity(
                            requisition.requestedQty,
                            requisition.unit,
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-[#1A1A1A]">
                          {approvedQty != null
                            ? formatRequisitionQuantity(
                                approvedQty,
                                requisition.unit,
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </DetailSection>

              <DetailSection title="Inventory Snapshot">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <DetailField
                    label="Current Inventory"
                    value={
                      detail.inventory
                        ? formatRequisitionQuantity(
                            detail.inventory.currentQty,
                            detail.inventory.unit,
                          )
                        : "—"
                    }
                  />
                  <DetailField
                    label="Minimum Stock"
                    value={
                      detail.inventory
                        ? formatRequisitionQuantity(
                            detail.inventory.minimumStock,
                            detail.inventory.unit,
                          )
                        : "—"
                    }
                  />
                </div>
              </DetailSection>

              <DetailSection title="Reason">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    &ldquo;{requisition.requestReason}&rdquo;
                  </p>
                </div>
              </DetailSection>

              <DetailSection title="Approval Timeline">
                <div className="space-y-3">
                  {detail.timeline.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "rounded-xl border px-4 py-3",
                        timelineVariantStyles[entry.variant],
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Clock3 className="mt-0.5 size-4 shrink-0 text-[#94A3B8]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1A1A1A]">
                            {entry.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#64748B]">
                            {formatHubRequisitionDate(entry.timestamp)} ·{" "}
                            {entry.actor}
                          </p>
                          {entry.description ? (
                            <p className="mt-2 text-sm text-[#475569]">
                              {entry.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>

              {isPending ? (
                <DetailSection title="Admin Remarks">
                  <div className="space-y-2">
                    <Textarea
                      data-hub-requisition-remarks
                      value={remarks}
                      onChange={(event) => {
                        setRemarks(event.target.value);
                        if (remarksError && event.target.value.trim()) {
                          setRemarksError(null);
                        }
                      }}
                      placeholder="Enter approval or rejection remarks..."
                      className="min-h-24 resize-none rounded-xl border-gray-200 bg-white"
                      disabled={isSubmitting}
                    />
                    {remarksError ? (
                      <p className="text-sm text-red-600">{remarksError}</p>
                    ) : (
                      <p className="text-xs text-[#64748B]">
                        Remarks are optional for approval and mandatory for
                        rejection.
                      </p>
                    )}
                  </div>
                </DetailSection>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto border-t border-gray-100 bg-white px-6 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {onPrint ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 gap-2"
                    onClick={onPrint}
                    disabled={!detail}
                  >
                    <Printer className="size-4" />
                    Print
                  </Button>
                ) : null}
                {canGenerateTransfer && onGenerateTransfer ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 gap-2"
                    onClick={onGenerateTransfer}
                    disabled={isSubmitting}
                  >
                    <ArrowRightLeft className="size-4" />
                    Generate Transfer
                  </Button>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Close
                </Button>

                {isPending ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleRejectClick}
                      disabled={isSubmitting}
                    >
                      <X className="size-4" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      className="h-10 gap-2"
                      onClick={handleApproveClick}
                      disabled={isSubmitting}
                    >
                      <Check className="size-4" />
                      Approve
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <RequisitionConfirmDialog
        open={confirmType !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConfirmType(null);
          }
        }}
        type={confirmType ?? "approve"}
        requestId={requisition?.requestId}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export type { RequisitionListItem };
