"use client";

import { format } from "date-fns";
import { Ban, CheckCircle2, Crown, History, RefreshCw, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MembershipPaymentBadge,
  MembershipPlanBadge,
  MembershipStatusBadge,
} from "@/features/membership/components/MembershipStatusBadge";
import { useMembershipDetail } from "@/features/membership/hooks/use-membership";
import type { CustomerMembership } from "@/features/membership/types";
import { formatCurrency } from "@/utils/format-currency";
import { getApiErrorMessage } from "@/services/api";
import { notify } from "@/utils/notify";

interface MembershipDetailDrawerProps {
  membership: CustomerMembership | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenew?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}

export function MembershipDetailDrawer({
  membership,
  open,
  onOpenChange,
  onRenew,
  onCancel,
}: MembershipDetailDrawerProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const detailQuery = useMembershipDetail(
    open ? (membership?.id ?? null) : null,
    open && Boolean(membership?.id),
  );

  const detail = detailQuery.data ?? membership;
  const isLoading = detailQuery.isLoading && !detailQuery.data;

  const handleRenew = async () => {
    if (!detail || !onRenew) return;
    setActionLoading(true);
    try {
      await onRenew(detail.id);
      void detailQuery.refetch();
    } catch (error) {
      notify.error("Renewal failed", getApiErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!detail || !onCancel) return;
    setActionLoading(true);
    try {
      await onCancel(detail.id);
      onOpenChange(false);
    } catch (error) {
      notify.error("Cancellation failed", getApiErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-100 px-6 py-5 pr-14 text-left">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : detail ? (
            <>
              <SheetTitle className="flex items-center gap-2.5 text-xl font-bold text-[#1A1A1A]">
                <Crown className="text-primary size-5" />
                {detail.customerName}
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
                {detail.customerPhone}
                {detail.customerCompany ? ` · ${detail.customerCompany}` : ""}
                {detail.customerCity && detail.customerCity !== "—"
                  ? ` · ${detail.customerCity}`
                  : ""}
              </SheetDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <MembershipPlanBadge
                  plan={detail.planName ?? detail.membership}
                />
                <MembershipStatusBadge status={detail.status} />
                <MembershipPaymentBadge status={detail.paymentStatus} />
              </div>
            </>
          ) : detailQuery.isError ? (
            <SheetTitle className="text-base text-red-600">
              Unable to load membership details.
            </SheetTitle>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : detailQuery.isError && !detail ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>Unable to load membership data.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => void detailQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-4">
                  <p className="text-xs text-[#64748B]">Purchase Date</p>
                  <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                    {format(new Date(detail.purchaseDate), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-4">
                  <p className="text-xs text-[#64748B]">Expiry Date</p>
                  <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">
                    {format(new Date(detail.expiryDate), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg border border-gray-100 bg-[#F5F6F8] p-4">
                  <p className="text-xs text-[#64748B]">Amount Paid</p>
                  <p className="mt-1 text-lg font-bold text-[#1A1A1A]">
                    {formatCurrency(detail.amount)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                  <CheckCircle2 className="text-primary size-4" />
                  Benefits Enabled
                </h4>
                {detail.benefits.length === 0 ? (
                  <p className="text-sm text-[#64748B]">No benefits listed.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.benefits.map((benefit) => (
                      <li
                        key={benefit.id}
                        className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm"
                      >
                        <span
                          className={
                            benefit.enabled ? "text-green-600" : "text-gray-300"
                          }
                        >
                          {benefit.enabled ? "✓" : "✗"}
                        </span>
                        <span
                          className={
                            benefit.enabled
                              ? "text-[#1A1A1A]"
                              : "text-[#64748B] line-through"
                          }
                        >
                          {benefit.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                  <History className="text-primary size-4" />
                  Membership History
                </h4>
                {detail.history.length === 0 ? (
                  <p className="text-sm text-[#64748B]">
                    No membership history yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {detail.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <MembershipPlanBadge plan={entry.plan} />
                          <MembershipStatusBadge status={entry.status} />
                        </div>
                        <p className="mt-2 text-xs text-[#64748B]">
                          {format(new Date(entry.purchaseDate), "dd MMM yyyy")}{" "}
                          – {format(new Date(entry.expiryDate), "dd MMM yyyy")}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#1A1A1A]">
                          {formatCurrency(entry.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {detail && !isLoading ? (
          <SheetFooter className="shrink-0 flex-row flex-wrap gap-2 border-t border-gray-100 bg-white px-6 py-4">
            {detail.status !== "CANCELLED" && onRenew ? (
              <Button
                className="bg-primary hover:bg-primary/90 gap-2"
                disabled={actionLoading}
                onClick={() => void handleRenew()}
              >
                <RefreshCw className="size-4" />
                Renew Membership
              </Button>
            ) : null}
            {detail.status === "ACTIVE" && onCancel ? (
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                disabled={actionLoading}
                onClick={() => void handleCancel()}
              >
                <Ban className="size-4" />
                Cancel Membership
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="ml-auto gap-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              Close
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
