"use client";

import { Mail, Phone, UserPlus, UserX } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { AssignmentHistory } from "@/features/user-management/components/support-executive/AssignmentHistory";
import { AssignExecutiveDrawer } from "@/features/user-management/components/support-executive/AssignExecutiveDrawer";
import { RemoveExecutiveConfirmationModal } from "@/features/user-management/components/support-executive/RemoveExecutiveConfirmationModal";
import { SUPPORT_ASSIGNMENT_REASON_LABELS } from "@/features/user-management/types/support-executive.types";
import type { CustomerDetail } from "@/features/user-management/types/customer.types";
import { useCustomerStore } from "@/store/customer-store";
import { formatDate } from "@/utils/format-date";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface SupportExecutiveSectionProps {
  customer: CustomerDetail;
  className?: string;
}

export function SupportExecutiveSection({
  customer,
  className,
}: SupportExecutiveSectionProps) {
  const getAssignmentHistory = useCustomerStore(
    (state) => state.getAssignmentHistory,
  );
  const removeSupportExecutive = useCustomerStore(
    (state) => state.removeSupportExecutive,
  );
  const supportExecutiveAssignmentHistory = useCustomerStore(
    (state) => state.supportExecutiveAssignmentHistory,
  );
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState("Assignment removed.");

  const assignment = customer.supportExecutiveAssignment;
  const history = useMemo(
    () => getAssignmentHistory(customer.id),
    [getAssignmentHistory, customer.id, supportExecutiveAssignmentHistory],
  );

  const handleRemove = () => {
    if (!removeReason.trim()) {
      return;
    }

    removeSupportExecutive(customer.id, { reason: removeReason.trim() });
    setIsRemoveOpen(false);
    setRemoveReason("Assignment removed.");
    notify.success(
      "Assignment removed",
      "Customer can continue placing orders normally.",
    );
  };

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Support Executive
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsAssignOpen(true)}
          >
            <UserPlus className="size-4" />
            {assignment ? "Change Executive" : "Assign Executive"}
          </Button>
          {assignment ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setIsRemoveOpen(true)}
            >
              <UserX className="size-4" />
              Remove Assignment
            </Button>
          ) : null}
        </div>
      </div>

      {!assignment ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-[#64748B]">
            No Support Executive Assigned
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Assign an executive for customer assistance, complaint resolution,
            or follow-up support.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoField
              label="Executive Name"
              value={assignment.executiveName}
            />
            <InfoField label="Employee ID" value={assignment.employeeId} />
            <InfoField label="Hub" value={assignment.hubName} />
            <InfoField label="Phone" value={assignment.phone} icon={Phone} />
            <InfoField label="Email" value={assignment.email} icon={Mail} />
            <InfoField
              label="Assignment Reason"
              value={SUPPORT_ASSIGNMENT_REASON_LABELS[assignment.reason]}
            />
            <InfoField
              label="Assigned Date"
              value={formatDate(assignment.assignedDate)}
            />
            <InfoField label="Assigned By" value={assignment.assignedBy} />
            {assignment.notes ? (
              <div className="sm:col-span-2">
                <InfoField label="Notes" value={assignment.notes} />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {history.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Assignment History
          </h4>
          <AssignmentHistory history={history} />
        </div>
      ) : null}

      <AssignExecutiveDrawer
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        customer={customer}
      />

      <RemoveExecutiveConfirmationModal
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        customerName={customer.name}
        reason={removeReason}
        onReasonChange={setRemoveReason}
        onConfirm={handleRemove}
      />
    </section>
  );
}

function InfoField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Phone;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 flex items-center gap-2 text-sm font-medium text-[#1A1A1A]">
        {Icon ? <Icon className="size-3.5 text-[#64748B]" /> : null}
        {value}
      </p>
    </div>
  );
}
