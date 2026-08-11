"use client";

import { format } from "date-fns";
import {
  Award,
  Bike,
  Gift,
  History,
  Pencil,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { LoyaltyTierBadge } from "@/features/loyalty/components/LoyaltyTierBadge";
import {
  useAdjustLoyaltyPoints,
  useLoyaltyDetail,
} from "@/features/loyalty/hooks/use-loyalty";
import type { CustomerLoyalty } from "@/features/loyalty/types";
import { getApiErrorMessage } from "@/services/api";
import { notify } from "@/utils/notify";

interface LoyaltyDetailDrawerProps {
  customer: CustomerLoyalty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoyaltyDetailDrawer({
  customer,
  open,
  onOpenChange,
}: LoyaltyDetailDrawerProps) {
  const detailQuery = useLoyaltyDetail(
    open ? (customer?.customerId ?? null) : null,
    open && Boolean(customer?.customerId),
  );
  const adjustMutation = useAdjustLoyaltyPoints();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [pointsInput, setPointsInput] = useState("");
  const [reason, setReason] = useState("");

  const detail = detailQuery.data ?? customer;
  const isLoading = detailQuery.isLoading && !detailQuery.data;

  useEffect(() => {
    if (!open) {
      setAdjustOpen(false);
      setPointsInput("");
      setReason("");
    }
  }, [open]);

  const handleAdjust = async () => {
    if (!detail) return;
    const points = Number.parseInt(pointsInput, 10);
    if (!Number.isFinite(points) || points === 0) {
      notify.error("Invalid points", "Enter a non-zero integer amount.");
      return;
    }
    if (!reason.trim()) {
      notify.error("Reason required", "Provide a reason for the adjustment.");
      return;
    }

    try {
      await adjustMutation.mutateAsync({
        customerId: detail.customerId,
        points,
        reason: reason.trim(),
      });
      notify.success(
        "Points adjusted",
        `${points > 0 ? "+" : ""}${points} points recorded in the loyalty ledger.`,
      );
      setAdjustOpen(false);
      setPointsInput("");
      setReason("");
    } catch (error) {
      notify.error("Adjustment failed", getApiErrorMessage(error));
    }
  };

  return (
    <>
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
                  <Award className="text-primary size-5" />
                  {detail.customerName}
                </SheetTitle>
                <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
                  {detail.customerPhone}
                  {detail.customerCompany
                    ? ` · ${detail.customerCompany}`
                    : ""}
                  {detail.customerCity && detail.customerCity !== "—"
                    ? ` · ${detail.customerCity}`
                    : ""}
                </SheetDescription>
                <div className="mt-3 flex items-center gap-3">
                  <LoyaltyTierBadge tier={detail.currentTier} />
                  <span className="text-primary text-lg font-bold">
                    {detail.availablePoints.toLocaleString("en-IN")} pts
                  </span>
                </div>
              </>
            ) : detailQuery.isError ? (
              <SheetTitle className="text-base text-red-600">
                Unable to load loyalty details.
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
                <p>Unable to load customer loyalty data.</p>
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-3 text-center">
                    <p className="text-xs text-[#64748B]">Balance</p>
                    <p className="text-primary mt-1 text-sm font-bold">
                      {detail.availablePoints.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-3 text-center">
                    <p className="text-xs text-[#64748B]">Lifetime Earned</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                      {(detail.lifetimeEarned ?? detail.currentPoints).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-3 text-center">
                    <p className="text-xs text-[#64748B]">Redeemed</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                      {(
                        detail.lifetimeRedeemed ?? detail.redeemedPoints
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-3 text-center">
                    <p className="text-xs text-[#64748B]">Tier</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                      {detail.currentTier.charAt(0) +
                        detail.currentTier.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>

                {detail.nextTier && (
                  <div className="rounded-lg border border-gray-100 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        Tier Progress
                      </p>
                      <LoyaltyTierBadge tier={detail.nextTier} />
                    </div>
                    <Progress value={detail.tierProgress} className="h-2" />
                    <p className="mt-2 text-xs text-[#64748B]">
                      {detail.pointsToNextTier.toLocaleString("en-IN")} points to{" "}
                      {detail.nextTier.toLowerCase()} ({detail.tierProgress}%)
                    </p>
                  </div>
                )}

                <div className="rounded-lg border border-gray-100 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                    <Star className="text-primary size-4" />
                    Benefits
                  </h4>
                  <div className="space-y-2 text-sm text-[#64748B]">
                    <p>
                      First Order Bonus:{" "}
                      <span className="font-medium text-[#1A1A1A]">
                        {detail.firstOrderBonusClaimed
                          ? "Claimed"
                          : "Available"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Bike className="size-3.5" />
                      Free Bike Deliveries:{" "}
                      <span className="font-medium text-[#1A1A1A]">
                        {detail.freeBikeDeliveriesRemaining ?? 0} remaining
                        {typeof detail.freeBikeDeliveriesAllowed === "number"
                          ? ` of ${detail.freeBikeDeliveriesAllowed}`
                          : ""}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                    <History className="text-primary size-4" />
                    Activity
                  </h4>
                  {detail.pointHistory.length === 0 ? (
                    <p className="text-sm text-[#64748B]">
                      No loyalty transactions yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detail.pointHistory.map((entry) => {
                        const isDebit =
                          entry.type === "REDEEMED" || entry.type === "EXPIRED";
                        return (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-[#1A1A1A]">
                                {entry.description}
                              </p>
                              <p className="text-xs text-[#64748B]">
                                {format(new Date(entry.date), "dd MMM yyyy")}
                                {entry.orderNumber
                                  ? ` · ${entry.orderNumber}`
                                  : ""}
                                {entry.status ? ` · ${entry.status}` : ""}
                              </p>
                              {typeof entry.balanceAfter === "number" ? (
                                <p className="text-xs text-[#64748B]">
                                  Balance after:{" "}
                                  {entry.balanceAfter.toLocaleString("en-IN")}
                                </p>
                              ) : null}
                            </div>
                            <span
                              className={`text-sm font-semibold ${isDebit ? "text-red-600" : "text-green-600"}`}
                            >
                              {isDebit ? "-" : "+"}
                              {entry.points}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {detail.ordersEarnedFrom.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                      <ShoppingBag className="text-primary size-4" />
                      Orders Earned From
                    </h4>
                    <div className="space-y-2">
                      {detail.ordersEarnedFrom.map((order) => (
                        <div
                          key={order.orderId}
                          className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#1A1A1A]">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {format(new Date(order.date), "dd MMM yyyy")}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-green-600">
                            +{order.pointsEarned} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.redemptions.length > 0 && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                      <Gift className="text-primary size-4" />
                      Redeem History
                    </h4>
                    <div className="space-y-2">
                      {detail.redemptions.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-lg border border-gray-100 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#1A1A1A]">
                              {r.reward}
                            </p>
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              {r.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#64748B]">
                            {format(new Date(r.date), "dd MMM yyyy")} ·{" "}
                            {r.points} pts
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {detail && !isLoading ? (
            <SheetFooter className="shrink-0 gap-2 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setAdjustOpen(true)}
              >
                <Pencil className="size-4" />
                Adjust Points
              </Button>
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

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Points</DialogTitle>
            <DialogDescription>
              Creates an audited ADMIN_ADJUSTMENT ledger entry. Use a positive
              value to credit or a negative value to debit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A1A]">
                Points
              </label>
              <Input
                type="number"
                placeholder="e.g. 100 or -50"
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A1A]">
                Reason
              </label>
              <Textarea
                placeholder="Customer support compensation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              disabled={adjustMutation.isPending}
              onClick={() => void handleAdjust()}
            >
              {adjustMutation.isPending ? "Saving..." : "Confirm Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
