"use client";

import { Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CustomerStatusBadge } from "@/features/user-management/components/CustomerStatusBadge";
import { ExecutiveCard } from "@/features/user-management/components/support-executive/ExecutiveCard";
import { ExecutiveSummary } from "@/features/user-management/components/support-executive/ExecutiveSummary";
import {
  CUSTOMER_TYPE_LABELS,
  type CustomerListItem,
} from "@/features/user-management/types/customer.types";
import {
  EMPTY_SUPPORT_EXECUTIVE_FILTERS,
  EXECUTIVE_STATUS_LABELS,
  SUPPORT_ASSIGNMENT_PRIORITY_LABELS,
  SUPPORT_ASSIGNMENT_REASON_LABELS,
  type AssignSupportExecutivePayload,
  type ExecutiveAvailabilityStatus,
  type SupportAssignmentPriority,
  type SupportAssignmentReason,
  type SupportExecutiveFilters,
} from "@/features/user-management/types/support-executive.types";
import { CUSTOMER_HUBS } from "@/mock/customers";
import { useCustomerStore } from "@/store/customer-store";
import { notify } from "@/utils/notify";

interface AssignExecutiveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerListItem | null;
  onAssigned?: () => void;
}

const ASSIGNMENT_REASONS = Object.entries(SUPPORT_ASSIGNMENT_REASON_LABELS) as [
  SupportAssignmentReason,
  string,
][];

const ASSIGNMENT_PRIORITIES = Object.entries(
  SUPPORT_ASSIGNMENT_PRIORITY_LABELS,
) as [SupportAssignmentPriority, string][];

const EXECUTIVE_STATUSES = Object.entries(EXECUTIVE_STATUS_LABELS) as [
  ExecutiveAvailabilityStatus,
  string,
][];

export function AssignExecutiveDrawer({
  open,
  onOpenChange,
  customer,
  onAssigned,
}: AssignExecutiveDrawerProps) {
  const getSupportExecutives = useCustomerStore(
    (state) => state.getSupportExecutives,
  );
  const assignSupportExecutive = useCustomerStore(
    (state) => state.assignSupportExecutive,
  );
  const supportExecutiveAssignmentHistory = useCustomerStore(
    (state) => state.supportExecutiveAssignmentHistory,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SupportExecutiveFilters>(
    EMPTY_SUPPORT_EXECUTIVE_FILTERS,
  );
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string | null>(
    null,
  );
  const [reason, setReason] =
    useState<SupportAssignmentReason>("CUSTOMER_SUPPORT");
  const [priority, setPriority] = useState<SupportAssignmentPriority>("MEDIUM");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (open && customer) {
      setSelectedExecutiveId(
        customer.supportExecutiveAssignment?.executiveId ?? null,
      );
      setReason(
        customer.supportExecutiveAssignment?.reason ?? "CUSTOMER_SUPPORT",
      );
      setPriority(customer.supportExecutiveAssignment?.priority ?? "MEDIUM");
      setNotes(customer.supportExecutiveAssignment?.notes ?? "");
      setFilters(EMPTY_SUPPORT_EXECUTIVE_FILTERS);
    }
  }, [open, customer]);

  const executives = useMemo(
    () => getSupportExecutives(filters),
    [getSupportExecutives, filters, supportExecutiveAssignmentHistory],
  );

  const selectedExecutive = useMemo(
    () => executives.find((executive) => executive.id === selectedExecutiveId),
    [executives, selectedExecutiveId],
  );

  const hasExistingAssignment = Boolean(customer?.supportExecutiveAssignment);
  const isValid = Boolean(selectedExecutiveId && reason);

  const handleAssign = () => {
    if (!customer || !selectedExecutiveId || !reason) {
      return;
    }

    setIsSubmitting(true);

    const payload: AssignSupportExecutivePayload = {
      executiveId: selectedExecutiveId,
      reason,
      priority,
      notes: notes.trim() || undefined,
    };

    assignSupportExecutive(customer.id, payload);
    setIsSubmitting(false);
    onOpenChange(false);
    onAssigned?.();
    notify.success("Support Executive Assigned Successfully.");
  };

  if (!customer) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b border-gray-100 p-5">
          <SheetTitle className="flex items-center gap-2 text-lg text-[#1A1A1A]">
            <UserPlus className="text-primary size-5" />
            Assign Support Executive
          </SheetTitle>
          <SheetDescription>
            {hasExistingAssignment
              ? "Change the support executive assigned to this customer."
              : "Assign a support executive for customer assistance and follow-up."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
            <p className="mb-3 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Customer Summary
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryField label="Customer Name" value={customer.name} />
              <SummaryField label="Customer ID" value={customer.customerId} />
              <SummaryField
                label="Customer Type"
                value={CUSTOMER_TYPE_LABELS[customer.customerType]}
              />
              <SummaryField label="Assigned Hub" value={customer.assignedHub} />
              <SummaryField
                label="Current Executive"
                value={
                  customer.supportExecutiveAssignment?.executiveName ??
                  "Not Assigned"
                }
              />
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Status
                </p>
                <div className="mt-1">
                  <CustomerStatusBadge status={customer.status} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#1A1A1A]">
                Available Executives
              </p>
              <span className="text-xs text-[#64748B]">
                {executives.length} executive(s)
              </span>
            </div>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#64748B]" />
              <Input
                value={filters.search}
                onChange={(event) =>
                  setFilters({ ...filters, search: event.target.value })
                }
                placeholder="Search by name, employee ID, or hub..."
                className="pl-9"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hub</Label>
                <Select
                  value={filters.hubId}
                  onValueChange={(value) =>
                    setFilters({ ...filters, hubId: value ?? "all" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All hubs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hubs</SelectItem>
                    {CUSTOMER_HUBS.map((hub) => (
                      <SelectItem key={hub.id} value={hub.id}>
                        {hub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value ?? "all" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {EXECUTIVE_STATUSES.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-xl" />
                ))
              ) : executives.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    No executives found
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                executives.map((executive) => (
                  <ExecutiveCard
                    key={executive.id}
                    executive={executive}
                    selected={selectedExecutiveId === executive.id}
                    onSelect={setSelectedExecutiveId}
                  />
                ))
              )}
            </div>
          </section>

          {selectedExecutive ? (
            <ExecutiveSummary
              executiveName={selectedExecutive.name}
              hubName={selectedExecutive.hubName}
              activeCustomers={selectedExecutive.activeCustomers}
            />
          ) : null}

          <section className="space-y-4 rounded-lg border border-gray-100 p-4">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Assignment Details
            </p>

            <div className="space-y-2">
              <Label>
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select
                value={reason}
                onValueChange={(value) =>
                  setReason(value as SupportAssignmentReason)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_REASONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(value as SupportAssignmentPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_PRIORITIES.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-notes">Notes</Label>
              <Textarea
                id="assignment-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add context for this assignment..."
                rows={3}
              />
            </div>
          </section>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-gray-100 bg-white p-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!isValid || isSubmitting}
          >
            {hasExistingAssignment ? "Change Executive" : "Assign Executive"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[#1A1A1A]">{value}</p>
    </div>
  );
}
