"use client";

import { Download, Eye, FileText, Info, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  RequisitionConfirmDialog,
  type RequisitionApproveItemEdit,
  type RequisitionConfirmType,
} from "@/components/requisitions/RequisitionConfirmDialog";
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
} from "@/mock/requisitions";
import {
  adminRequisitionsService,
  type AdminRequisitionDetail,
  type AdminRequisitionMaterial,
} from "@/services/adminRequisitions";
import type {
  RequisitionAttachment,
  RequisitionAttachmentType,
  RequisitionListItem,
  RequisitionPriority,
  RequisitionStatus,
} from "@/types/warehouse.types";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface RequisitionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: RequisitionListItem | null;
  isSubmitting?: boolean;
  initialAction?: "approve" | "reject" | null;
  onApprove: (
    remarks: string,
    items: Array<{ itemId: string; approvedQty: number }>,
  ) => void;
  onReject: (remarks: string) => void;
  onDispatch?: () => void;
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
    notify.info(
      `Previewing ${attachment.name}`,
      "Document preview will open here.",
    );
  };

  const handleDownload = () => {
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

function mapUiStatus(status: string | undefined, fallback: RequisitionStatus): RequisitionStatus {
  const normalized = (status ?? fallback).toUpperCase();
  if (normalized === "PENDING_APPROVAL" || normalized === "SUBMITTED") {
    return "PENDING";
  }
  if (normalized === "IN_TRANSIT" || normalized === "DISPATCHED") {
    return "TRANSFERRED";
  }
  if (normalized === "RECEIVED" || normalized === "COMPLETED") {
    return "COMPLETED";
  }
  if (
    normalized === "PENDING" ||
    normalized === "APPROVED" ||
    normalized === "REJECTED" ||
    normalized === "ALLOCATED" ||
    normalized === "TRANSFERRED" ||
    normalized === "COMPLETED"
  ) {
    return normalized;
  }
  return fallback;
}

function mapUiPriority(
  priority: string | undefined,
  fallback: RequisitionPriority,
): RequisitionPriority {
  const normalized = (priority ?? fallback).toLowerCase();
  if (normalized === "urgent" || normalized === "critical") return "critical";
  if (normalized === "high") return "high";
  if (normalized === "low") return "low";
  if (normalized === "medium" || normalized === "normal") return "medium";
  return fallback;
}

function stockForMaterial(material: AdminRequisitionMaterial): number | null {
  if (typeof material.warehouseStock === "number") return material.warehouseStock;
  if (typeof material.availableStock === "number") return material.availableStock;
  return null;
}

export function RequisitionDetailDrawer({
  open,
  onOpenChange,
  requisition,
  isSubmitting = false,
  initialAction = null,
  onApprove,
  onReject,
  onDispatch,
}: RequisitionDetailDrawerProps) {
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [confirmType, setConfirmType] = useState<RequisitionConfirmType | null>(
    null,
  );
  const [liveDetail, setLiveDetail] = useState<AdminRequisitionDetail | null>(
    null,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [approveItems, setApproveItems] = useState<RequisitionApproveItemEdit[]>(
    [],
  );

  useEffect(() => {
    if (!open || !requisition) {
      setLiveDetail(null);
      return;
    }

    let cancelled = false;
    setIsLoadingDetail(true);

    void adminRequisitionsService
      .getById(requisition.id)
      .then((detail) => {
        if (cancelled) return;
        setLiveDetail(detail);
        setApproveItems(
          (detail.materials ?? []).map((material) => ({
            itemId: material.id,
            productName: material.productName,
            requestedQty: material.requestedQty,
            unit: material.unit,
            approvedQty: material.approvedQty ?? material.requestedQty,
          })),
        );
        setRemarks(
          detail.remarks ??
            detail.rejectionReason ??
            requisition.adminRemarks ??
            requisition.rejectionReason ??
            "",
        );
      })
      .catch(() => {
        if (cancelled) return;
        setLiveDetail(null);
        notify.error("Failed to load requisition details");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, requisition]);

  const detail = useMemo(() => {
    if (!requisition) return null;

    const materials = liveDetail?.materials ?? [];
    const first = materials[0];
    const status = mapUiStatus(
      liveDetail?.rawStatus ?? liveDetail?.status,
      requisition.status,
    );
    const priority = mapUiPriority(liveDetail?.priority, requisition.priority);
    const requestedBy =
      typeof liveDetail?.requestedBy === "object" && liveDetail.requestedBy
        ? liveDetail.requestedBy
        : requisition.requestedBy;

    return {
      ...requisition,
      requestId:
        liveDetail?.requestNo ?? liveDetail?.requestId ?? requisition.requestId,
      status,
      priority,
      requestedBy,
      hubName: liveDetail?.hubName ?? liveDetail?.hubLocation ?? requisition.hubName,
      warehouseName: liveDetail?.warehouseName ?? requisition.warehouseName,
      destinationWarehouse:
        liveDetail?.warehouseName ?? requisition.warehouseName,
      assignedWarehouse: liveDetail?.warehouseName ?? requisition.warehouseName,
      region: liveDetail?.hubLocation ?? requisition.hubName,
      sku: first?.sku ?? requisition.sku ?? "N/A",
      category: first?.category ?? "General Materials",
      material: first?.productName ?? requisition.material,
      materialSpec: requisition.materialSpec,
      requestedQty: first?.requestedQty ?? requisition.requestedQty,
      unit: first?.unit ?? requisition.unit,
      requestReason:
        liveDetail?.remarks ||
        liveDetail?.reason ||
        requisition.adminRemarks ||
        "—",
      attachments: [] as RequisitionAttachment[],
      adminRemarks: liveDetail?.remarks ?? requisition.adminRemarks,
      rejectionReason:
        liveDetail?.rejectionReason ?? requisition.rejectionReason,
      materials,
      timeline: liveDetail?.timeline ?? [],
      activityLogs: liveDetail?.activityLogs ?? [],
      createdAt: requisition.createdAt,
    };
  }, [liveDetail, requisition]);

  const isPending = detail?.status === "PENDING";
  const isApproved = detail?.status === "APPROVED";
  const isAllocated = detail?.status === "ALLOCATED";

  useEffect(() => {
    if (open && requisition) {
      setRemarksError(null);
      setConfirmType(null);
    }
  }, [open, requisition]);

  useEffect(() => {
    if (!open || !isPending || !initialAction || isLoadingDetail) return;

    if (initialAction === "approve") {
      setConfirmType("approve");
      return;
    }

    if (initialAction === "reject") {
      window.setTimeout(() => {
        document
          .querySelector<HTMLTextAreaElement>("[data-requisition-remarks]")
          ?.focus();
      }, 100);
    }
  }, [open, isPending, initialAction, isLoadingDetail]);

  const handleApproveClick = () => {
    setRemarksError(null);
    if (approveItems.length === 0 && detail?.materials?.length) {
      setApproveItems(
        detail.materials.map((material) => ({
          itemId: material.id,
          productName: material.productName,
          requestedQty: material.requestedQty,
          unit: material.unit,
          approvedQty: material.approvedQty ?? material.requestedQty,
        })),
      );
    }
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

  const handleDispatchClick = () => {
    setConfirmType("dispatch");
  };

  const handleConfirm = () => {
    if (!confirmType) return;

    if (confirmType === "approve") {
      const items =
        approveItems.length > 0
          ? approveItems.map((item) => ({
              itemId: item.itemId,
              approvedQty: item.approvedQty,
            }))
          : (detail?.materials ?? []).map((material) => ({
              itemId: material.id,
              approvedQty: material.approvedQty ?? material.requestedQty,
            }));
      onApprove(remarks.trim(), items);
      return;
    }

    if (confirmType === "dispatch") {
      onDispatch?.();
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

          {isLoadingDetail ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[#64748B]">
              <Loader2 className="size-4 animate-spin" />
              Loading details...
            </div>
          ) : detail ? (
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
                          Requested
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Approved
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                          Available
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(detail.materials.length > 0
                        ? detail.materials
                        : [
                            {
                              id: requisition?.id ?? "fallback",
                              productId: requisition?.materialId ?? "",
                              sku: detail.sku,
                              productName: detail.material,
                              requestedQty: detail.requestedQty,
                              approvedQty: requisition?.approvedQty,
                              unit: detail.unit,
                              category: detail.category,
                            } satisfies AdminRequisitionMaterial,
                          ]
                      ).map((material) => {
                        const stock = stockForMaterial(material);
                        return (
                          <TableRow
                            key={material.id}
                            className="border-gray-100"
                          >
                            <TableCell className="text-sm text-[#64748B]">
                              {material.sku ?? "—"}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-semibold text-[#1A1A1A]">
                                {material.productName}
                              </p>
                              {material.category ? (
                                <p className="text-xs text-[#64748B]">
                                  {material.category}
                                </p>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-sm text-[#64748B]">
                              {formatRequisitionQuantity(
                                material.requestedQty,
                                material.unit,
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-[#64748B]">
                              {typeof material.approvedQty === "number"
                                ? formatRequisitionQuantity(
                                    material.approvedQty,
                                    material.unit,
                                  )
                                : "—"}
                            </TableCell>
                            <TableCell className="text-primary text-sm font-semibold">
                              {stock !== null
                                ? formatRequisitionQuantity(stock, material.unit)
                                : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

              {detail.timeline.length > 0 ? (
                <DetailSection title="Timeline">
                  <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
                    {detail.timeline.map((step) => (
                      <div key={step.id} className="flex gap-3">
                        <div
                          className={cn(
                            "mt-1 size-2.5 shrink-0 rounded-full",
                            step.status === "completed" && "bg-emerald-500",
                            step.status === "active" && "bg-primary",
                            step.status === "pending" && "bg-gray-300",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {step.title}
                          </p>
                          {step.subtitle ? (
                            <p className="text-xs text-[#64748B]">
                              {step.subtitle}
                            </p>
                          ) : null}
                          {step.timestamp ? (
                            <p className="mt-0.5 text-xs text-gray-400">
                              {step.timestamp}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              ) : null}

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
                    data-requisition-remarks
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

              {isApproved ? (
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    This requisition has been approved. Stock allocation can be
                    performed from the{" "}
                    <span className="font-semibold">Allocation Center</span>.
                  </p>
                </div>
              ) : null}
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
                    disabled={isSubmitting || isLoadingDetail}
                  >
                    Reject Request
                  </Button>
                  <Button
                    type="button"
                    className="h-10"
                    onClick={handleApproveClick}
                    disabled={isSubmitting || isLoadingDetail}
                  >
                    Approve Request
                  </Button>
                </div>
              ) : null}

              {isAllocated && onDispatch ? (
                <Button
                  type="button"
                  className="h-10"
                  onClick={handleDispatchClick}
                  disabled={isSubmitting || isLoadingDetail}
                >
                  Dispatch Request
                </Button>
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
        approveItems={confirmType === "approve" ? approveItems : []}
        onApproveItemsChange={setApproveItems}
        onConfirm={handleConfirm}
      />
    </>
  );
}
