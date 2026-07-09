"use client";

import { Package, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

import { OrderSourceBadge } from "@/features/user-management/components/OrderSourceBadge";
import type { CustomerDetail } from "@/features/user-management/types/customer.types";
import { useCustomerStore } from "@/store/customer-store";
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
  const orders = useCustomerStore((state) => state.orders);

  const latestAssistedOrder = useMemo(() => {
    return orders
      .filter(
        (order) =>
          order.customerId === customer.id &&
          order.orderSource === "CUSTOMER_EXECUTIVE",
      )
      .sort((left, right) => right.date.localeCompare(left.date))[0];
  }, [orders, customer.id]);

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <ShoppingBag className="size-4 text-[#64748B]" />
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          Order Assistance
        </h3>
      </div>

      {!latestAssistedOrder ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
          <Package className="mx-auto size-8 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-[#64748B]">
            No Assisted Orders
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Customer places orders independently.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Latest Assisted Order
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoField
              label="Order ID"
              value={`#${latestAssistedOrder.orderId}`}
            />
            <InfoField
              label="Created On"
              value={formatDate(latestAssistedOrder.date)}
            />
            <InfoField
              label="Created By"
              value={latestAssistedOrder.createdByExecutive ?? "—"}
            />
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Order Source
              </p>
              <div className="mt-1">
                <OrderSourceBadge source={latestAssistedOrder.orderSource} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[#1A1A1A]">{value}</p>
    </div>
  );
}
