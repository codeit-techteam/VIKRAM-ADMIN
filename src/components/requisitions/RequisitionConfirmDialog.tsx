"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type RequisitionConfirmType = "approve" | "reject" | "dispatch";

export interface RequisitionApproveItemEdit {
  itemId: string;
  productName: string;
  requestedQty: number;
  unit: string;
  approvedQty: number;
}

interface RequisitionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: RequisitionConfirmType;
  requestId?: string;
  isSubmitting?: boolean;
  approveItems?: RequisitionApproveItemEdit[];
  onApproveItemsChange?: (items: RequisitionApproveItemEdit[]) => void;
  onConfirm: () => void;
}

const dialogCopy: Record<
  RequisitionConfirmType,
  { title: string; message: string; confirmLabel: string }
> = {
  approve: {
    title: "Approve Requisition?",
    message: "Adjust approved quantities if needed, then confirm approval.",
    confirmLabel: "Approve",
  },
  reject: {
    title: "Reject Requisition?",
    message:
      "This requisition will be marked as rejected and removed from the pending queue.",
    confirmLabel: "Reject",
  },
  dispatch: {
    title: "Dispatch Requisition?",
    message: "This will mark the allocated requisition as in transit.",
    confirmLabel: "Dispatch",
  },
};

export function RequisitionConfirmDialog({
  open,
  onOpenChange,
  type,
  requestId,
  isSubmitting = false,
  approveItems = [],
  onApproveItemsChange,
  onConfirm,
}: RequisitionConfirmDialogProps) {
  const copy = dialogCopy[type];
  const showApproveQty = type === "approve" && approveItems.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "rounded-xl p-6",
          showApproveQty ? "max-w-lg" : "max-w-md",
        )}
      >
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="text-lg font-semibold text-[#1A1A1A]">
            {copy.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-[#64748B]">
            {copy.message}
            {requestId ? (
              <span className="mt-2 block font-medium text-[#1A1A1A]">
                {requestId}
              </span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {showApproveQty ? (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/60 p-3">
            {approveItems.map((item, index) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1A1A1A]">
                    {item.productName}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Requested: {item.requestedQty} {item.unit}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <label className="text-xs text-[#64748B]" htmlFor={`qty-${item.itemId}`}>
                    Approve
                  </label>
                  <Input
                    id={`qty-${item.itemId}`}
                    type="number"
                    min={0}
                    max={item.requestedQty}
                    value={item.approvedQty}
                    disabled={isSubmitting}
                    className="h-8 w-20 bg-white"
                    onChange={(event) => {
                      if (!onApproveItemsChange) return;
                      const next = Number(event.target.value);
                      const approvedQty = Number.isFinite(next)
                        ? Math.max(0, Math.min(item.requestedQty, Math.floor(next)))
                        : 0;
                      onApproveItemsChange(
                        approveItems.map((entry, entryIndex) =>
                          entryIndex === index
                            ? { ...entry, approvedQty }
                            : entry,
                        ),
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <AlertDialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            className={cn(
              type === "reject" && "bg-red-600 hover:bg-red-600/90",
            )}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isSubmitting ? "Processing..." : copy.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
