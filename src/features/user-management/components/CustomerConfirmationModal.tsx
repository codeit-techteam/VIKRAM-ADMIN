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

interface CustomerConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive";
  isSubmitting?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
}

export function CustomerConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  isSubmitting = false,
  children,
  onConfirm,
}: CustomerConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl p-6">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="text-lg font-semibold text-[#1A1A1A]">
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className="text-sm text-[#64748B]">
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        {children ? <div className="py-2">{children}</div> : null}

        <AlertDialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
          <AlertDialogCancel disabled={isSubmitting}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            className={cn(
              confirmVariant === "destructive" &&
                "bg-red-600 text-white hover:bg-red-700",
            )}
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
