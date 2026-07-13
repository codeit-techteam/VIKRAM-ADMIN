"use client";

import {
  ArrowRightLeft,
  FileText,
  Phone,
  Printer,
  Truck,
  User,
} from "lucide-react";

import { HubTransferStatusBadge } from "@/components/sub-hub/transfers/HubTransferStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import {
  formatHubTransferCurrency,
  formatHubTransferDateTime,
} from "@/mock/hub-transfers";
import type { HubTransfer } from "@/types/hub-transfer.types";
import { cn } from "@/lib/utils";

interface HubTransferDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: HubTransfer | null;
  onAssignVehicle?: () => void;
  onAssignDriver?: () => void;
  onUpdateStatus?: () => void;
  onCallDriver?: () => void;
  onViewCustomer?: () => void;
  onViewOrder?: () => void;
  onPrint?: () => void;
  onGenerateInvoice?: () => void;
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
        {title}
      </h3>
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
      <div className="mt-1 text-sm font-medium text-[#1A1A1A]">{value}</div>
    </div>
  );
}

export function HubTransferDetailDrawer({
  open,
  onOpenChange,
  transfer,
  onAssignVehicle,
  onAssignDriver,
  onUpdateStatus,
  onCallDriver,
  onViewCustomer,
  onViewOrder,
  onPrint,
  onGenerateInvoice,
}: HubTransferDetailDrawerProps) {
  if (!transfer) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-[680px]" />
      </Sheet>
    );
  }

  const canAssignVehicle =
    transfer.status !== "CANCELLED" && transfer.status !== "DELIVERED";

  const canAssignDriver = canAssignVehicle && Boolean(transfer.vehicleId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[680px]"
      >
        <SheetHeader className="border-b border-gray-100 px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <SheetTitle className="text-xl font-bold text-[#1A1A1A]">
                Hub Dispatch Details
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm text-[#64748B]">
                {transfer.transferId} · {transfer.orderId} · {transfer.hubName}
              </SheetDescription>
            </div>
            <HubTransferStatusBadge
              status={transfer.status}
              isDelayed={transfer.isDelayed}
            />
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <DetailSection title="Customer Information">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <DetailField
                label="Customer Name"
                value={transfer.customerName}
              />
              <DetailField label="Mobile" value={transfer.customerMobile} />
              <div className="col-span-2">
                <DetailField
                  label="Delivery Address"
                  value={`${transfer.deliveryAddress}, ${transfer.pincode}`}
                />
              </div>
              <DetailField
                label="Order Value"
                value={formatHubTransferCurrency(transfer.orderValue)}
              />
              <DetailField
                label="Order Date"
                value={formatHubTransferDateTime(transfer.orderDate)}
              />
            </div>
          </DetailSection>

          <DetailSection title="Order Summary">
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      Product
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      Qty
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      Reserved
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      Weight
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.products.map((product) => (
                    <TableRow
                      key={product.productId}
                      className="border-gray-100"
                    >
                      <TableCell>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#64748B]">{product.sku}</p>
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {product.quantity}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {product.reservedQuantity}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {(product.weightKg * product.quantity).toLocaleString(
                          "en-IN",
                        )}{" "}
                        kg
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-[#1A1A1A]">
                        {formatHubTransferCurrency(product.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableCell
                      colSpan={3}
                      className="text-sm font-semibold text-[#1A1A1A]"
                    >
                      Total
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#64748B]">
                      {transfer.totalWeightKg.toLocaleString("en-IN")} kg
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold text-[#1A1A1A]">
                      {formatHubTransferCurrency(transfer.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </DetailSection>

          <DetailSection title="Hub Details">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <DetailField label="Hub Name" value={transfer.hubName} />
              <DetailField label="Manager" value={transfer.hubManager} />
              <DetailField
                label="Dispatch Counter"
                value={transfer.dispatchCounter}
              />
              <DetailField
                label="Reserved Inventory"
                value={transfer.reservedInventoryLabel}
              />
            </div>
          </DetailSection>

          <DetailSection title="Logistics">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <DetailField
                label="Assigned Vehicle"
                value={transfer.vehicleType ?? "—"}
              />
              <DetailField
                label="Vehicle Number"
                value={transfer.vehicleNumber ?? "—"}
              />
              <DetailField
                label="Vehicle Capacity"
                value={
                  transfer.vehicleCapacityKg
                    ? `${(transfer.vehicleCapacityKg / 1000).toFixed(1)} Tons`
                    : "—"
                }
              />
              <DetailField
                label="Assigned Driver"
                value={transfer.driverName ?? "—"}
              />
              <DetailField
                label="Driver Mobile"
                value={transfer.driverMobile ?? "—"}
              />
              <DetailField
                label="License Status"
                value={
                  transfer.licenseStatus ? (
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase",
                        transfer.licenseStatus === "valid"
                          ? "bg-emerald-100 text-emerald-700"
                          : transfer.licenseStatus === "expiring"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700",
                      )}
                    >
                      {transfer.licenseStatus}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
          </DetailSection>

          <DetailSection title="Delivery Timeline">
            <div className="space-y-3">
              {transfer.timeline.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    event.completed
                      ? "border-gray-100 bg-white"
                      : "border-dashed border-gray-200 bg-gray-50/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B]">
                        {formatHubTransferDateTime(event.timestamp)} ·{" "}
                        {event.updatedBy}
                      </p>
                      {event.remarks ? (
                        <p className="mt-2 text-sm text-[#475569]">
                          {event.remarks}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        event.completed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {event.completed ? "Done" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>

        <div className="mt-auto border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {onAssignVehicle && canAssignVehicle ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={onAssignVehicle}
                >
                  <Truck className="size-3.5" />
                  Assign Vehicle
                </Button>
              ) : null}
              {onAssignDriver && canAssignDriver ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={onAssignDriver}
                >
                  <User className="size-3.5" />
                  Assign Driver
                </Button>
              ) : null}
              {onUpdateStatus ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={onUpdateStatus}
                >
                  <ArrowRightLeft className="size-3.5" />
                  Update Status
                </Button>
              ) : null}
              {transfer.driverMobile && onCallDriver ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={onCallDriver}
                >
                  <Phone className="size-3.5" />
                  Call Driver
                </Button>
              ) : null}
              {onViewCustomer ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onViewCustomer}
                >
                  View Customer
                </Button>
              ) : null}
              {onViewOrder ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onViewOrder}
                >
                  View Order
                </Button>
              ) : null}
              {onPrint ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={onPrint}
                >
                  <Printer className="size-3.5" />
                  Print Dispatch Slip
                </Button>
              ) : null}
              {onGenerateInvoice ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={onGenerateInvoice}
                >
                  <FileText className="size-3.5" />
                  Generate Invoice
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
