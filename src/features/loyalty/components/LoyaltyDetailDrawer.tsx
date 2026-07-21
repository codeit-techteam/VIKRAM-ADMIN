"use client";

import { format } from "date-fns";
import { Award, Gift, History, ShoppingBag, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { LoyaltyTierBadge } from "@/features/loyalty/components/LoyaltyTierBadge";
import type { CustomerLoyalty } from "@/mock/mockLoyalty";
import { formatCurrency } from "@/utils/format-currency";

interface LoyaltyDetailDrawerProps {
  customer: CustomerLoyalty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function LoyaltyDetailDrawer({
  customer,
  open,
  onOpenChange,
  isLoading,
}: LoyaltyDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-100 px-6 py-5 pr-14 text-left">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : customer ? (
            <>
              <SheetTitle className="flex items-center gap-2.5 text-xl font-bold text-[#1A1A1A]">
                <Award className="text-primary size-5" />
                {customer.customerName}
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
                {customer.customerPhone} · {customer.customerCity}
              </SheetDescription>
              <div className="mt-3 flex items-center gap-3">
                <LoyaltyTierBadge tier={customer.currentTier} />
                <span className="text-primary text-lg font-bold">
                  {customer.availablePoints.toLocaleString("en-IN")} pts
                </span>
              </div>
            </>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : customer ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-3 text-center">
                  <p className="text-xs text-[#64748B]">Current</p>
                  <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                    {customer.currentPoints.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-3 text-center">
                  <p className="text-xs text-[#64748B]">Redeemed</p>
                  <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                    {customer.redeemedPoints.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-[#F5F6F8] p-3 text-center">
                  <p className="text-xs text-[#64748B]">Available</p>
                  <p className="text-primary mt-1 text-sm font-bold">
                    {customer.availablePoints.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {customer.nextTier && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      Tier Progress
                    </p>
                    <LoyaltyTierBadge tier={customer.nextTier} />
                  </div>
                  <Progress value={customer.tierProgress} className="h-2" />
                  <p className="mt-2 text-xs text-[#64748B]">
                    {customer.pointsToNextTier.toLocaleString("en-IN")} points
                    to {customer.nextTier.toLowerCase()}
                  </p>
                </div>
              )}

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                  <History className="text-primary size-4" />
                  Point History
                </h4>
                <div className="space-y-2">
                  {customer.pointHistory.map((entry) => (
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
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${entry.type === "REDEEMED" || entry.type === "EXPIRED" ? "text-red-600" : "text-green-600"}`}
                      >
                        {entry.type === "REDEEMED" || entry.type === "EXPIRED"
                          ? "-"
                          : "+"}
                        {entry.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                  <ShoppingBag className="text-primary size-4" />
                  Orders Earned From
                </h4>
                <div className="space-y-2">
                  {customer.ordersEarnedFrom.map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {format(new Date(order.date), "dd MMM yyyy")} ·{" "}
                          {formatCurrency(order.amount)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        +{order.pointsEarned} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {customer.redemptions.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                    <Gift className="text-primary size-4" />
                    Redeem History
                  </h4>
                  <div className="space-y-2">
                    {customer.redemptions.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {r.reward}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#64748B]">
                          {format(new Date(r.date), "dd MMM yyyy")} · {r.points}{" "}
                          pts
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {customer && !isLoading ? (
          <SheetFooter className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
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
