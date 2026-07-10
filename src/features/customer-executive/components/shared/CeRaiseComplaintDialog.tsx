"use client";

import {
  AlertTriangle,
  Check,
  MessageSquareWarning,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CeCustomerAvatar } from "@/features/customer-executive/components/shared/CeCustomerAvatar";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { CE_ISSUE_TYPES } from "@/features/customer-executive/mock/seed";
import type {
  CeComplaint,
  ComplaintPriority,
} from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

const PRIORITY_OPTIONS: {
  value: ComplaintPriority;
  label: string;
  hint: string;
}[] = [
  { value: "LOW", label: "Low", hint: "General inquiry" },
  { value: "MEDIUM", label: "Medium", hint: "Needs follow-up" },
  { value: "HIGH", label: "High", hint: "Urgent issue" },
  { value: "CRITICAL", label: "Critical", hint: "Escalate immediately" },
];

interface CeRaiseComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCustomerId?: string;
  defaultOrderId?: string;
  onCreated?: (complaint: CeComplaint) => void;
}

export function CeRaiseComplaintDialog({
  open,
  onOpenChange,
  defaultCustomerId,
  defaultOrderId,
  onCreated,
}: CeRaiseComplaintDialogProps) {
  const customers = useCustomerExecutiveStore((s) => s.customers);
  const orders = useCustomerExecutiveStore((s) => s.orders);
  const createComplaint = useCustomerExecutiveStore((s) => s.createComplaint);

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [issueType, setIssueType] = useState("Delivery Delay");
  const [priority, setPriority] = useState<ComplaintPriority>("MEDIUM");
  const [issue, setIssue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    customer?: string;
    issue?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setSelectedCustomerId(defaultCustomerId ?? "");
    setSelectedOrderId(defaultOrderId ?? "");
    setCustomerSearch("");
    setIssueType("Delivery Delay");
    setPriority("MEDIUM");
    setIssue("");
    setErrors({});
  }, [open, defaultCustomerId, defaultOrderId]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    const list = [...customers].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [customers, customerSearch]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const customerOrders = useMemo(
    () =>
      orders
        .filter((o) => o.customerId === selectedCustomerId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [orders, selectedCustomerId],
  );

  const selectedOrder = customerOrders.find((o) => o.id === selectedOrderId);

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!selectedCustomerId) {
      nextErrors.customer = "Select a customer to raise a complaint";
    }
    if (issue.trim().length < 10) {
      nextErrors.issue = "Describe the issue in at least 10 characters";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const complaint = createComplaint({
        customerId: selectedCustomerId,
        orderId: selectedOrderId || undefined,
        issue: issue.trim(),
        issueType,
        priority,
      });
      notify.success(
        "Complaint raised",
        `Ticket #${complaint.ticketNumber} created`,
      );
      onOpenChange(false);
      onCreated?.(complaint);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,760px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-50">
              <MessageSquareWarning className="size-5 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-lg">Raise Complaint</DialogTitle>
              <DialogDescription className="mt-1">
                Log a customer issue and assign it for resolution.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Step 1 — Customer */}
          <section className="space-y-3">
            <Label className="text-sm font-semibold text-[#1A1A1A]">
              1. Select Customer *
            </Label>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by name, company, or phone..."
                className="pl-9"
              />
            </div>

            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-1.5">
              {filteredCustomers.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-[#64748B]">
                  No customers match your search
                </p>
              ) : (
                filteredCustomers.map((c) => {
                  const isSelected = selectedCustomerId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setSelectedOrderId("");
                        setErrors((e) => ({ ...e, customer: undefined }));
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        isSelected
                          ? "border border-orange-200 bg-orange-50 shadow-sm"
                          : "hover:bg-white",
                      )}
                    >
                      <CeCustomerAvatar name={c.name} id={c.id} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="truncate text-xs text-[#64748B]">
                          {c.company} · {c.city}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="text-primary size-4 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {errors.customer && (
              <p className="text-xs text-red-500">{errors.customer}</p>
            )}
          </section>

          {/* Step 2 — Order (optional) */}
          {selectedCustomerId && customerOrders.length > 0 && (
            <section className="space-y-3">
              <Label className="text-sm font-semibold text-[#1A1A1A]">
                2. Link Order{" "}
                <span className="font-normal text-[#64748B]">(optional)</span>
              </Label>
              <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/50 p-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedOrderId("")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    !selectedOrderId
                      ? "border border-orange-200 bg-orange-50 shadow-sm"
                      : "hover:bg-white",
                  )}
                >
                  <span className="text-[#64748B]">No order linked</span>
                  {!selectedOrderId && (
                    <Check className="text-primary size-4" />
                  )}
                </button>
                {customerOrders.map((o) => {
                  const isSelected = selectedOrderId === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelectedOrderId(o.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors",
                        isSelected
                          ? "border border-orange-200 bg-orange-50 shadow-sm"
                          : "hover:bg-white",
                      )}
                    >
                      <div>
                        <p className="text-primary text-sm font-medium">
                          #{o.orderNumber}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {new Date(o.createdAt).toLocaleDateString("en-IN")} ·{" "}
                          <CeStatusBadge status={o.status} />
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(o.amount)}
                        </span>
                        {isSelected && (
                          <Check className="text-primary size-4" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Issue type */}
          <section className="space-y-3">
            <Label className="text-sm font-semibold text-[#1A1A1A]">
              {customerOrders.length > 0 ? "3. " : "2. "}
              Issue Type *
            </Label>
            <div className="flex flex-wrap gap-2">
              {CE_ISSUE_TYPES.filter((t) => t !== "ALL").map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setIssueType(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    issueType === t
                      ? "border-orange-300 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-[#64748B] hover:border-gray-300",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Priority */}
          <section className="space-y-3">
            <Label className="text-sm font-semibold text-[#1A1A1A]">
              Priority *
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition-all",
                    priority === opt.value
                      ? "border-orange-300 bg-orange-50 shadow-sm"
                      : "border-gray-100 bg-gray-50/50 hover:bg-white",
                  )}
                >
                  <CeStatusBadge status={opt.value} />
                  <p className="mt-1 text-[10px] text-[#64748B]">{opt.hint}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-3">
            <Label
              htmlFor="complaint-issue"
              className="text-sm font-semibold text-[#1A1A1A]"
            >
              Issue Description *
            </Label>
            <Textarea
              id="complaint-issue"
              value={issue}
              onChange={(e) => {
                setIssue(e.target.value);
                if (e.target.value.trim().length >= 10) {
                  setErrors((prev) => ({ ...prev, issue: undefined }));
                }
              }}
              placeholder="Describe the customer's complaint in detail — what happened, when, and expected resolution..."
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              {errors.issue ? (
                <p className="text-xs text-red-500">{errors.issue}</p>
              ) : (
                <span />
              )}
              <span
                className={cn(
                  "text-xs",
                  issue.length < 10 ? "text-[#94A3B8]" : "text-green-600",
                )}
              >
                {issue.length}/10 min
              </span>
            </div>
          </section>

          {/* Preview */}
          {selectedCustomer && issue.trim().length >= 10 && (
            <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Complaint Preview
                  </p>
                  <p className="mt-1 font-medium">{selectedCustomer.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <CeStatusBadge status={priority} />
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#64748B]">
                      {issueType}
                    </span>
                    {selectedOrder && (
                      <span className="text-primary text-xs font-medium">
                        #{selectedOrder.orderNumber}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
                    {issue}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="!mx-0 !mb-0 border-t border-gray-100 bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Raising..." : "Raise Complaint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
