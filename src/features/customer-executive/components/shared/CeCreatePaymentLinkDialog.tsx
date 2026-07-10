"use client";

import { Check, CreditCard, IndianRupee, Search } from "lucide-react";
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
import { CeCustomerAvatar } from "@/features/customer-executive/components/shared/CeCustomerAvatar";
import type { CePayment } from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface CeCreatePaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCustomerId?: string;
  defaultOrderId?: string;
  onCreated?: (payment: CePayment) => void;
}

export function CeCreatePaymentLinkDialog({
  open,
  onOpenChange,
  defaultCustomerId,
  defaultOrderId,
  onCreated,
}: CeCreatePaymentLinkDialogProps) {
  const customers = useCustomerExecutiveStore((s) => s.customers);
  const orders = useCustomerExecutiveStore((s) => s.orders);
  const payments = useCustomerExecutiveStore((s) => s.payments);
  const getCustomerPendingAmount = useCustomerExecutiveStore(
    (s) => s.getCustomerPendingAmount,
  );
  const generatePaymentLinkForCustomer = useCustomerExecutiveStore(
    (s) => s.generatePaymentLinkForCustomer,
  );
  const copyPaymentLink = useCustomerExecutiveStore((s) => s.copyPaymentLink);

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedCustomerId(defaultCustomerId ?? "");
    setSelectedOrderId(defaultOrderId ?? "");
    setCustomerSearch("");
    setCustomAmount("");
  }, [open, defaultCustomerId, defaultOrderId]);

  const customersWithPending = useMemo(
    () =>
      customers
        .map((c) => ({
          ...c,
          pendingAmount: getCustomerPendingAmount(c.id),
        }))
        .filter((c) => c.pendingAmount > 0)
        .sort((a, b) => b.pendingAmount - a.pendingAmount),
    [customers, getCustomerPendingAmount, payments],
  );

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customersWithPending;
    return customersWithPending.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [customersWithPending, customerSearch]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const customerOrders = useMemo(
    () =>
      orders
        .filter((o) => o.customerId === selectedCustomerId)
        .map((o) => {
          const payment = payments.find(
            (p) =>
              p.orderId === o.id &&
              (p.status === "PENDING" || p.status === "PARTIAL"),
          );
          return {
            ...o,
            outstanding: payment ? payment.amount - payment.paidAmount : 0,
            paymentId: payment?.id,
          };
        })
        .filter((o) => o.outstanding > 0)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [orders, payments, selectedCustomerId],
  );

  const selectedOrder = customerOrders.find((o) => o.id === selectedOrderId);

  const outstandingAmount =
    customAmount && Number(customAmount) > 0
      ? Number(customAmount)
      : (selectedOrder?.outstanding ??
        (selectedCustomer ? getCustomerPendingAmount(selectedCustomer.id) : 0));

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      notify.error("Select a customer", "Choose a customer with pending dues");
      return;
    }

    setIsSubmitting(true);
    try {
      const amount =
        customAmount && Number(customAmount) > 0
          ? Number(customAmount)
          : undefined;

      const payment = generatePaymentLinkForCustomer({
        customerId: selectedCustomerId,
        orderId: selectedOrderId || undefined,
        amount,
      });

      if (!payment) {
        notify.error(
          "No pending payment",
          "This customer has no outstanding balance",
        );
        return;
      }

      const link = copyPaymentLink(payment.id);
      await navigator.clipboard.writeText(link);
      notify.success(
        "Payment link sent",
        `Link copied for ${payment.customerName}`,
      );
      onOpenChange(false);
      onCreated?.(payment);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
              <CreditCard className="text-primary size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create Payment Link</DialogTitle>
              <DialogDescription className="mt-1">
                Select a customer and order to generate a shareable payment
                link.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Step 1 — Customer */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-[#1A1A1A]">
                1. Select Customer
              </Label>
              <span className="text-xs text-[#64748B]">
                {customersWithPending.length} with pending dues
              </span>
            </div>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by name, company, or phone..."
                className="pl-9"
              />
            </div>

            <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-1.5">
              {filteredCustomers.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-[#64748B]">
                  No customers with pending payments found
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
                        setCustomAmount("");
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
                          {c.company}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-amber-700">
                          {formatCurrency(c.pendingAmount)}
                        </p>
                        {isSelected && (
                          <Check className="text-primary ml-auto size-4" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Step 2 — Order */}
          {selectedCustomerId && customerOrders.length > 0 && (
            <section className="space-y-3">
              <Label className="text-sm font-semibold text-[#1A1A1A]">
                2. Select Order
              </Label>
              <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/50 p-1.5">
                {customerOrders.map((o) => {
                  const isSelected = selectedOrderId === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setCustomAmount("");
                      }}
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
                          {new Date(o.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {formatCurrency(o.outstanding)}
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

          {/* Step 3 — Amount */}
          {selectedCustomerId && (
            <section className="space-y-3">
              <Label
                htmlFor="custom-amount"
                className="text-sm font-semibold text-[#1A1A1A]"
              >
                {customerOrders.length > 0 ? "3. " : "2. "}
                Custom Amount{" "}
                <span className="font-normal text-[#64748B]">(optional)</span>
              </Label>
              <div className="relative">
                <IndianRupee className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  id="custom-amount"
                  type="number"
                  min={1}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Leave blank to use order amount"
                  className="pl-9"
                />
              </div>
            </section>
          )}

          {/* Summary */}
          {selectedCustomer && outstandingAmount > 0 && (
            <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                Link Summary
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedCustomer.name}</p>
                  {selectedOrder && (
                    <p className="text-primary text-sm">
                      Order #{selectedOrder.orderNumber}
                    </p>
                  )}
                </div>
                <p className="text-xl font-bold text-[#1A1A1A]">
                  {formatCurrency(outstandingAmount)}
                </p>
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
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedCustomerId || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send & Copy Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
