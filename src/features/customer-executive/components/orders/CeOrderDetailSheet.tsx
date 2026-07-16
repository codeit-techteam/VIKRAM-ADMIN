"use client";

import { MapPin, Package, Truck } from "lucide-react";
import Link from "next/link";

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
import { ROUTES } from "@/constants/routes";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import type { CeOrder } from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";

interface CeOrderDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: CeOrder | null;
}

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

export function CeOrderDetailSheet({
  open,
  onOpenChange,
  order,
}: CeOrderDetailSheetProps) {
  const hubs = useCustomerExecutiveStore((s) => s.hubs);
  const drivers = useCustomerExecutiveStore((s) => s.drivers);
  const vehicles = useCustomerExecutiveStore((s) => s.vehicles);

  if (!order) {
    return null;
  }

  const hub = hubs.find((h) => h.id === order.hubId);
  const driver = drivers.find((d) => d.id === order.driverId);
  const vehicle = vehicles.find((v) => v.id === order.vehicleId);
  const paymentStatus = order.paymentMethod === "CREDIT" ? "PENDING" : "PAID";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-gray-100 p-5">
          <div className="flex flex-wrap items-center gap-3 pr-8">
            <SheetTitle className="text-lg text-[#1A1A1A]">
              #{order.orderNumber}
            </SheetTitle>
            <CeStatusBadge status={order.status} />
          </div>
          <SheetDescription>
            Placed on {formatDate(order.createdAt)} ·{" "}
            {formatCurrency(order.amount)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 p-5">
          <Section title="Order Summary" icon={Package}>
            <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 sm:grid-cols-2">
              <DetailField label="Order ID" value={`#${order.orderNumber}`} />
              <DetailField
                label="Order Date"
                value={formatDate(order.createdAt)}
              />
              <DetailField
                label="Amount"
                value={formatCurrency(order.amount)}
              />
              <DetailField label="ETA" value={order.eta ?? "—"} />
              <DetailField
                label="Payment"
                value={
                  <span
                    className={
                      paymentStatus === "PAID"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {paymentStatus}
                  </span>
                }
              />
              <DetailField
                label="Payment Method"
                value={order.paymentMethod.replace("_", " ")}
              />
            </div>
          </Section>

          <Section title="Customer" icon={Package}>
            <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
              <DetailField label="Company" value={order.company} />
              <DetailField label="Contact" value={order.customerName} />
              <DetailField
                label="Source"
                value={<CeStatusBadge status={order.orderSource} />}
              />
              <DetailField label="Priority" value={order.deliveryPriority} />
            </div>
          </Section>

          <Section title="Line Items" icon={Package}>
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
                  {order.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {item.productName}
                        </p>
                        <p className="text-xs text-[#64748B]">{item.sku}</p>
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section title="Delivery Address" icon={MapPin}>
            <div className="rounded-lg border border-gray-100 p-4 text-sm">
              <p className="text-[#1A1A1A]">{order.deliveryAddress}</p>
              <p className="mt-1 text-[#64748B]">
                PIN: {order.deliveryPincode}
              </p>
            </div>
          </Section>

          {hub ? (
            <Section title="Assigned Hub" icon={MapPin}>
              <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
                <DetailField label="Hub" value={hub.name} />
                <DetailField label="City" value={hub.city} />
              </div>
            </Section>
          ) : null}

          {driver ? (
            <Section title="Driver & Vehicle" icon={Truck}>
              <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
                <DetailField label="Driver" value={driver.name} />
                <DetailField label="Phone" value={driver.phone} />
                {vehicle ? (
                  <DetailField label="Vehicle" value={vehicle.registration} />
                ) : null}
              </div>
            </Section>
          ) : null}
        </div>

        <SheetFooter className="flex-col gap-2 border-t border-gray-100 p-5 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            render={
              <Link
                href={`${ROUTES.CUSTOMER_EXECUTIVE_ORDERS}?order=${order.id}`}
              />
            }
          >
            View in Orders
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
