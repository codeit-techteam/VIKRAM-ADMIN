"use client";

import { Mail, Phone, UserPlus, UserX } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AssignExecutiveDrawer } from "@/features/user-management/components/support-executive/AssignExecutiveDrawer";
import { RemoveExecutiveConfirmationModal } from "@/features/user-management/components/support-executive/RemoveExecutiveConfirmationModal";
import { SUPPORT_ASSIGNMENT_REASON_LABELS } from "@/features/user-management/types/support-executive.types";
import type { CustomerDetail } from "@/features/user-management/types/customer.types";
import { getApiErrorMessage } from "@/services/api";
import { assignAdminCustomer } from "@/services/customers";
import { formatDate } from "@/utils/format-date";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface SupportExecutiveSectionProps {
  customer: CustomerDetail;
  className?: string;
  onChanged?: () => void;
}

export function SupportExecutiveSection({
  customer,
  className,
  onChanged,
}: SupportExecutiveSectionProps) {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState("Assignment removed.");
  const [isPending, setIsPending] = useState(false);

  const assignment = customer.supportExecutiveAssignment;

  const handleRemove = async () => {
    if (!removeReason.trim()) {
      return;
    }

    setIsPending(true);
    try {
      await assignAdminCustomer(customer.id, {
        executiveId: null,
        reason: removeReason.trim(),
      });
      setIsRemoveOpen(false);
      notify.success("Executive removed", "Support assignment cleared.");
      onChanged?.();
    } catch (error) {
      notify.error("Remove failed", getApiErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Support Executive
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setIsAssignOpen(true)}
        >
          <UserPlus className="size-3.5" />
          {assignment ? "Change" : "Assign"}
        </Button>
      </div>

      {assignment ? (
        <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A]">
                {assignment.executiveName}
              </p>
              <p className="mt-0.5 text-xs text-[#64748B]">
                {SUPPORT_ASSIGNMENT_REASON_LABELS[assignment.reason]}
              </p>
              <p className="mt-1 text-[11px] text-[#64748B]">
                Assigned {formatDate(assignment.assignedDate)}
              </p>
              <div className="mt-2 space-y-1 text-xs text-[#64748B]">
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3" />
                  {assignment.phone}
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="size-3" />
                  {assignment.email}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setIsRemoveOpen(true)}
              aria-label="Remove executive"
            >
              <UserX className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center">
          <p className="text-xs text-[#64748B]">No support executive assigned.</p>
        </div>
      )}

      <AssignExecutiveDrawer
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        customer={customer}
        onAssigned={onChanged}
      />

      <RemoveExecutiveConfirmationModal
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        customerName={customer.name}
        reason={removeReason}
        onReasonChange={setRemoveReason}
        onConfirm={() => {
          void handleRemove();
        }}
        isSubmitting={isPending}
      />
    </section>
  );
}
