"use client";

import { Download, Eye, FileText } from "lucide-react";
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
import {
  formatRequisitionDateOnly,
  formatRequisitionQuantity,
  formatRequisitionTimeOnly,
  getMaterialAvailableStock,
  getRequisitionDetail,
} from "@/mock/requisitions";
import type {
  RequisitionAttachment,
  RequisitionAttachmentType,
  RequisitionListItem,
} from "@/types/warehouse.types";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface RequisitionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: RequisitionListItem | null;
  isSubmitting?: boolean;
  onApprove: (remarks: string) => void;
  onReject: (remarks: string) => void;
}

const attachmentTypeLabels: Record<RequisitionAttachmentType, string> = {
  "purchase-sheet": "Purchase Sheet",
  quotation: "Quotation",
  "supporting-document": "Supporting Document",
};

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

function AttachmentRow({ attachment }: { attachment: RequisitionAttachment }) {
  const handlePreview = () => {
    // TODO: Replace with document preview API
    notify.info(
      `Previewing ${attachment.name}`,
      "Document preview will open here.",
    );
  };

  const handleDownload = () => {
    // TODO: Replace with document download API
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
    notify.success("Download started", attachment.name);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
          <FileText className="text-primary size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#1A1A1A]">
            {attachmentTypeLabels[attachment.type]}
          </p>
          <p className="truncate text-xs text-[#64748B]">{attachment.name}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 text-[#64748B] hover:text-[#1A1A1A]"
          onClick={handlePreview}
          aria-label={`Preview ${attachment.name}`}
        >
          <Eye className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 text-[#64748B] hover:text-[#1A1A1A]"
          onClick={handleDownload}
          aria-label={`Download ${attachment.name}`}
        >
          <Download className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function RequisitionDetailDrawer({
  open,
  onOpenChange,
  requisition,
  isSubmitting = false,
  onApprove,
  onReject,
}: RequisitionDetailDrawerProps) {
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [confirmType, setConfirmType] = useState<"approve" | "reject" | null>(
    null,
  );

  const detail = useMemo(
    () => (requisition ? getRequisitionDetail(requisition) : null),
    [requisition],
  );

  const availableStock = detail
    ? getMaterialAvailableStock(detail.materialId)
    : null;

  const isPending = detail?.status === "PENDING";

  useEffect(() => {
    if (open && requisition) {
      setRemarks(requisition.adminRemarks ?? requisition.rejectionReason ?? "");
      setRemarksError(null);
      setConfirmType(null);
    }
  }, [open, requisition]);

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
          className="flex w-full flex-col gap-0 p-0 sm:max-w-[600px]"
        >
          <SheetHeader className="border-b border-gray-100 px-6 py-5 text-left">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <SheetTitle className="text-xl font-bold text-[#1A1A1A]">
                  Requisition Details
                </SheetTitle>
                <SheetDescription className="mt-1 text-sm text-[#64748B]">
                  Review request information before approval or rejection.
                </SheetDescription>
              </div>
              {detail ? (
                <RequisitionStatusBadge status={detail.status} />
              ) : null}
            </div>
          </SheetHeader>

          {detail ? (
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <DetailSection title="Request Information">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <DetailField label="Request ID" value={detail.requestId} />
                  <DetailField
                    label="Requested Date"
                    value={formatRequisitionDateOnly(detail.createdAt)}
                  />
                  <DetailField
                    label="Requested Time"
                    value={formatRequisitionTimeOnly(detail.createdAt)}
                  />
                  <DetailField
                    label="Priority"
                    value={
                      <RequisitionPriorityBadge priority={detail.priority} />
                    }
                  />
                  <DetailField
                    label="Current Status"
                    value={<RequisitionStatusBadge status={detail.status} />}
                  />
                  <DetailField
                    label="Requested By"
                    value={detail.requestedBy.name}
                  />
                  <DetailField label="Role" value={detail.requestedBy.role} />
                  {detail.customerName ? (
                    <div className="col-span-2">
                      <DetailField
                        label="Customer Name"
                        value={detail.customerName}
                      />
                    </div>
                  ) : null}
                </div>
              </DetailSection>

              <DetailSection title="Hub Information">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <DetailField label="Source Hub" value={detail.hubName} />
                  <DetailField
                    label="Destination Warehouse"
                    value={detail.destinationWarehouse}
                  />
                  <DetailField label="Region" value={detail.region} />
                  <DetailField
                    label="Assigned Warehouse"
                    value={detail.assignedWarehouse}
                  />
                </div>
              </DetailSection>

              <DetailSection title="Material Details">
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 hover:bg-transparent">
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          SKU
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Material Name
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Category
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Requested Qty
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Available
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-gray-100">
                        <TableCell className="text-sm text-[#64748B]">
                          {detail.sku}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-semibold text-[#1A1A1A]">
                            {detail.material}
                          </p>
                          {detail.materialSpec ? (
                            <p className="text-xs text-[#64748B]">
                              {detail.materialSpec}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm text-[#64748B]">
                          {detail.category}
                        </TableCell>
                        <TableCell className="text-sm text-[#64748B]">
                          {formatRequisitionQuantity(
                            detail.requestedQty,
                            detail.unit,
                          )}
                        </TableCell>
                        <TableCell className="text-primary text-sm font-semibold">
                          {availableStock
                            ? formatRequisitionQuantity(
                                availableStock.available,
                                availableStock.unit,
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </DetailSection>

              <DetailSection title="Request Reason">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-sm leading-relaxed text-[#64748B]">
                    &ldquo;{detail.requestReason}&rdquo;
                  </p>
                </div>
              </DetailSection>

              {detail.attachments.length > 0 ? (
                <DetailSection title="Attachments">
                  <div className="space-y-2">
                    {detail.attachments.map((attachment) => (
                      <AttachmentRow
                        key={attachment.id}
                        attachment={attachment}
                      />
                    ))}
                  </div>
                </DetailSection>
              ) : null}

              <DetailSection title="Admin Remarks">
                <div className="space-y-2">
                  <Textarea
                    value={remarks}
                    onChange={(event) => {
                      setRemarks(event.target.value);
                      if (remarksError && event.target.value.trim()) {
                        setRemarksError(null);
                      }
                    }}
                    placeholder="Enter approval/rejection remarks..."
                    className="min-h-28 resize-none rounded-xl border-gray-200 bg-white"
                    disabled={!isPending || isSubmitting}
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
            </div>
          ) : null}

          <div className="mt-auto border-t border-gray-100 bg-white px-6 py-4">
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
                    className="h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleRejectClick}
                    disabled={isSubmitting}
                  >
                    Reject Request
                  </Button>
                  <Button
                    type="button"
                    className="h-10"
                    onClick={handleApproveClick}
                    disabled={isSubmitting}
                  >
                    Approve Request
                  </Button>
                </div>
              ) : null}
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
        requestId={detail?.requestId}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
      />
    </>
  );
}
