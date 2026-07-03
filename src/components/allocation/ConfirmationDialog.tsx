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

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title = "Confirm Material Allocation?",
  message = "This inventory will be reserved and transferred for this requisition.",
  confirmLabel = "Confirm",
  isSubmitting = false,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl p-6">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="text-lg font-semibold text-[#1A1A1A]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-[#64748B]">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isSubmitting ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
