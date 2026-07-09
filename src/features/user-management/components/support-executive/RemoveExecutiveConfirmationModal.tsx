"use client";

import { CustomerConfirmationModal } from "@/features/user-management/components/CustomerConfirmationModal";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RemoveExecutiveConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function RemoveExecutiveConfirmationModal({
  open,
  onOpenChange,
  customerName,
  reason,
  onReasonChange,
  onConfirm,
  isSubmitting = false,
}: RemoveExecutiveConfirmationModalProps) {
  return (
    <CustomerConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remove Assignment?"
      description={`This will remove the support executive assignment for ${customerName}. The customer can continue placing orders normally.`}
      confirmLabel="Remove Assignment"
      confirmVariant="destructive"
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
    >
      <div className="space-y-2">
        <Label htmlFor="remove-reason">Reason</Label>
        <Textarea
          id="remove-reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Assignment removed."
          rows={3}
        />
      </div>
    </CustomerConfirmationModal>
  );
}
