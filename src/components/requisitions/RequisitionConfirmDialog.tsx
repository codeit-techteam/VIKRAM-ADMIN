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
import { cn } from "@/lib/utils";

export type RequisitionConfirmType = "approve" | "reject";

interface RequisitionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: RequisitionConfirmType;
  requestId?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
}

const dialogCopy: Record<
  RequisitionConfirmType,
  { title: string; message: string; confirmLabel: string }
> = {
  approve: {
    title: "Approve Requisition?",
    message: "Inventory will now be allocated for this requisition.",
    confirmLabel: "Approve",
  },
  reject: {
    title: "Reject Requisition?",
    message:
      "This requisition will be marked as rejected and removed from the pending queue.",
    confirmLabel: "Reject",
  },
};

export function RequisitionConfirmDialog({
  open,
  onOpenChange,
  type,
  requestId,
  isSubmitting = false,
  onConfirm,
}: RequisitionConfirmDialogProps) {
  const copy = dialogCopy[type];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl p-6">
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
