"use client";

import { Package, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

import { OrderSourceBadge } from "@/features/user-management/components/OrderSourceBadge";
import type { CustomerDetail } from "@/features/user-management/types/customer.types";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/lib/utils";

interface OrderAssistanceSectionProps {
  customer: CustomerDetail;
  className?: string;
}

export function OrderAssistanceSection({
  customer,
  className,
}: OrderAssistanceSectionProps) {
  const latestAssistedOrder = useMemo(() => {
    return customer.orders
      .filter((order) => order.orderSource === "CUSTOMER_EXECUTIVE")
      .sort((left, right) => right.date.localeCompare(left.date))[0];
  }, [customer.orders]);

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <ShoppingBag className="size-4 text-[#64748B]" />
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Order Assistance
        </h3>
      </div>

      {latestAssistedOrder ? (
        <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A]">
                {latestAssistedOrder.orderId}
              </p>
              <p className="mt-0.5 text-xs text-[#64748B]">
                {formatDate(latestAssistedOrder.date)}
              </p>
            </div>
            <OrderSourceBadge source={latestAssistedOrder.orderSource} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center">
          <Package className="mx-auto size-5 text-gray-300" />
          <p className="mt-2 text-xs text-[#64748B]">
            No executive-assisted orders yet.
          </p>
        </div>
      )}
    </section>
  );
}
