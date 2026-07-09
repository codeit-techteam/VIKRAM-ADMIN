"use client";

import { MapPin, Package, Truck, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerOrderDetail } from "@/features/user-management/types/customer.types";
import { formatDate, formatDateTime } from "@/utils/format-date";
import { cn } from "@/lib/utils";

interface CustomerOrderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: CustomerOrderDetail | null;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const ORDER_STATUS_STYLES: Record<
  CustomerOrderDetail["status"],
  { badge: string; label: string }
> = {
  PENDING: {
    badge: "bg-amber-50 text-amber-700 border border-amber-100",
    label: "Pending",
  },
  PROCESSING: {
    badge: "bg-blue-50 text-blue-700 border border-blue-100",
    label: "Processing",
  },
  PACKED: {
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    label: "Packed",
  },
  DISPATCHED: {
    badge: "bg-sky-50 text-sky-700 border border-sky-100",
    label: "Dispatched",
  },
  OUT_FOR_DELIVERY: {
    badge: "bg-violet-50 text-violet-700 border border-violet-100",
    label: "Out For Delivery",
  },
  DELIVERED: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    label: "Delivered",
  },
  CANCELLED: {
    badge: "bg-red-50 text-red-700 border border-red-100",
    label: "Cancelled",
  },
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-[#64748B]" />
        <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#1A1A1A]">{value}</p>
    </div>
  );
}

export function CustomerOrderDrawer({
  open,
  onOpenChange,
  order,
}: CustomerOrderDrawerProps) {
  if (!order) {
    return null;
  }

  const statusStyle = ORDER_STATUS_STYLES[order.status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-gray-100 p-5">
          <div className="flex flex-wrap items-center gap-3 pr-8">
            <SheetTitle className="text-lg text-[#1A1A1A]">
              #{order.orderId}
            </SheetTitle>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
                statusStyle.badge,
              )}
            >
              {statusStyle.label}
            </span>
          </div>
          <SheetDescription>
            Placed on {formatDate(order.date)} · {formatAmount(order.amount)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 p-5">
          <Section title="Order Summary" icon={Package}>
            <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 sm:grid-cols-2">
              <DetailField label="Order ID" value={`#${order.orderId}`} />
              <DetailField label="Order Date" value={formatDate(order.date)} />
              <DetailField label="Amount" value={formatAmount(order.amount)} />
              <DetailField label="Status" value={statusStyle.label} />
            </div>
          </Section>

          <Section title="Products" icon={Package}>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase">
                      Product
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">Qty</TableHead>
                    <TableHead className="text-right text-[10px] uppercase">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-sm font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {product.quantity} {product.unit}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatAmount(product.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section title="Delivery Address" icon={MapPin}>
            <div className="rounded-lg border border-gray-100 p-4 text-sm">
              <p className="font-medium text-[#1A1A1A]">
                {order.deliveryAddress.recipient}
              </p>
              <p className="mt-1 text-[#64748B]">
                {order.deliveryAddress.phone}
              </p>
              <p className="mt-2 text-[#1A1A1A]">
                {order.deliveryAddress.address}
              </p>
              <p className="text-[#64748B]">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} —{" "}
                {order.deliveryAddress.pincode}
              </p>
            </div>
          </Section>

          <Section title="Hub Information" icon={MapPin}>
            <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
              <DetailField label="Hub" value={order.hub.name} />
              <DetailField
                label="Location"
                value={`${order.hub.city}, ${order.hub.state}`}
              />
              <DetailField label="Address" value={order.hub.address} />
            </div>
          </Section>

          <Section title="Assigned Executive" icon={User}>
            <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
              <DetailField label="Name" value={order.executive.name} />
              <DetailField label="Phone" value={order.executive.phone} />
              <DetailField label="Email" value={order.executive.email} />
            </div>
          </Section>

          {order.driver ? (
            <Section title="Driver" icon={Truck}>
              <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
                <DetailField label="Name" value={order.driver.name} />
                <DetailField label="Phone" value={order.driver.phone} />
                <DetailField
                  label="Vehicle"
                  value={order.driver.vehicleNumber}
                />
              </div>
            </Section>
          ) : null}

          <Section title="Timeline" icon={Package}>
            <ol className="space-y-0">
              {order.timeline.map((event, index) => (
                <li
                  key={`${event.status}-${event.timestamp}`}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {index < order.timeline.length - 1 ? (
                    <span
                      className="absolute top-3 left-[7px] h-full w-px bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="bg-primary relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full ring-4 ring-white" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {event.label}
                      </p>
                      <time className="text-xs text-[#64748B]">
                        {formatDateTime(event.timestamp)}
                      </time>
                    </div>
                    {event.note ? (
                      <p className="mt-1 text-sm text-[#64748B]">
                        {event.note}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <SheetFooter className="border-t border-gray-100 p-5">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
