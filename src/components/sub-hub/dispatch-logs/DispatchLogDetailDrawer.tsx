"use client";

import { ArrowRightLeft, ClipboardList, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import { DispatchLogStatusBadge } from "@/components/sub-hub/dispatch-logs/DispatchLogStatusBadge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  DISPATCH_LOG_STATUS_LABELS,
  formatDispatchLogCurrency,
  formatDispatchLogDateTime,
} from "@/mock/dispatch-logs";
import type { DispatchLog } from "@/types/dispatch-log.types";
import { cn } from "@/lib/utils";

interface DispatchLogDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DispatchLog | null;
  onUpdateStatus?: () => void;
  onViewOrder?: () => void;
  onPrint?: () => void;
  onSaveNotes?: (notes: string) => void;
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

export function DispatchLogDetailDrawer({
  open,
  onOpenChange,
  log,
  onUpdateStatus,
  onViewOrder,
  onPrint,
  onSaveNotes,
}: DispatchLogDetailDrawerProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && log) {
      setNotes(log.deliveryNotes);
    }
  }, [open, log]);

  if (!log) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-[640px]" />
      </Sheet>
    );
  }

  const manualUpdates = log.timeline.filter((event) => event.isManual);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[640px]"
      >
        <SheetHeader className="border-b border-gray-100 px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <SheetTitle className="text-xl font-bold text-[#1A1A1A]">
                Dispatch Log
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm text-[#64748B]">
                {log.dispatchId} · {log.orderId} · Manual tracking
              </SheetDescription>
            </div>
            <DispatchLogStatusBadge status={log.status} />
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <DetailSection title="Customer">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <DetailField label="Customer Name" value={log.customerName} />
              <DetailField label="Mobile" value={log.customerMobile} />
              <div className="col-span-2">
                <DetailField
                  label="Delivery Address"
                  value={`${log.deliveryAddress}, ${log.pincode}`}
                />
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Order">
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      Product
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      SKU
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      Qty
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.orderLines.map((line) => (
                    <TableRow key={line.productId} className="border-gray-100">
                      <TableCell className="text-sm font-medium text-[#1A1A1A]">
                        {line.name}
                      </TableCell>
                      <TableCell className="text-xs text-[#64748B]">
                        {line.sku}
                      </TableCell>
                      <TableCell className="text-sm text-[#64748B]">
                        {line.quantity} {line.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Order Value: {formatDispatchLogCurrency(log.orderValue)}
            </p>
          </DetailSection>

          <DetailSection title="Vehicle">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <DetailField
                label="Vehicle Number"
                value={log.vehicleNumber ?? "—"}
              />
              <DetailField
                label="Vehicle Type"
                value={log.vehicleType ?? "—"}
              />
              <DetailField label="Hub" value={log.hubName} />
              <DetailField
                label="Dispatch Time"
                value={
                  log.dispatchTime
                    ? formatDispatchLogDateTime(log.dispatchTime)
                    : "Not dispatched yet"
                }
              />
            </div>
          </DetailSection>

          <DetailSection title="Driver">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <DetailField label="Driver Name" value={log.driverName ?? "—"} />
              <DetailField label="Mobile" value={log.driverMobile ?? "—"} />
            </div>
          </DetailSection>

          <DetailSection title="Timeline">
            <div className="space-y-3">
              {log.timeline.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B]">
                        {formatDispatchLogDateTime(event.timestamp)} ·{" "}
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
                        event.isManual
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {event.isManual ? "Manual" : "System"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Manual Status Updates">
            {manualUpdates.length === 0 ? (
              <p className="text-sm text-[#64748B]">
                No manual updates recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {manualUpdates.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {DISPATCH_LOG_STATUS_LABELS[event.status]}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {event.updatedBy} ·{" "}
                        {formatDispatchLogDateTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>

          <DetailSection title="Delivery Notes">
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add delivery notes for this dispatch..."
                className="min-h-24 resize-none rounded-xl border-gray-200"
              />
              {onSaveNotes ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onSaveNotes(notes)}
                >
                  <ClipboardList className="size-3.5" />
                  Save Notes
                </Button>
              ) : null}
            </div>
          </DetailSection>
        </div>

        <div className="mt-auto border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
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
