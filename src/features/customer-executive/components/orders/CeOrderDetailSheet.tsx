"use client";

import { Download, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
import { downloadAdminOrderInvoicePdf } from "@/services/adminOrders";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { notify } from "@/utils/notify";
import { formatPaymentMethodLabel } from "@/utils/payment-method-labels";

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

function paymentStatusDisplay(order: CeOrder): string {
  if (order.paymentStatus) {
    return order.paymentStatus.replaceAll("_", " ");
  }
  return "—";
}

export function CeOrderDetailSheet({
  open,
  onOpenChange,
  order,
}: CeOrderDetailSheetProps) {
  const loadOrderDetailFromApi = useCustomerExecutiveStore(
    (s) => s.loadOrderDetailFromApi,
  );
  const getOrder = useCustomerExecutiveStore((s) => s.getOrder);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (!open || !order?.id) return;
    void loadOrderDetailFromApi(order.id);
  }, [open, order?.id, loadOrderDetailFromApi]);

  const liveOrder = order ? (getOrder(order.id) ?? order) : null;

  if (!liveOrder) {
    return null;
  }

  const hubName = liveOrder.hubName;
  const driverName = liveOrder.driverName;
  const driverPhone = liveOrder.driverPhone;
  const vehicleNumber = liveOrder.vehicleNumber;
  const paymentStatus = paymentStatusDisplay(liveOrder);
  const paymentTone =
    liveOrder.paymentStatus === "PAID" ||
    liveOrder.paymentStatus === "COLLECTED"
      ? "text-emerald-600"
      : "text-amber-600";

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      await downloadAdminOrderInvoicePdf(liveOrder.id);
      notify.success(
        "Invoice downloaded",
        liveOrder.invoiceNumber ?? liveOrder.orderNumber,
      );
    } catch {
      notify.error("Invoice unavailable", "Could not download order invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-gray-100 p-5">
          <div className="flex flex-wrap items-center gap-3 pr-8">
            <SheetTitle className="text-lg text-[#1A1A1A]">
              #{liveOrder.orderNumber}
            </SheetTitle>
            <CeStatusBadge
              status={liveOrder.status}
              label={liveOrder.statusLabel}
            />
          </div>
          <SheetDescription>
            Placed on {formatDate(liveOrder.createdAt)} ·{" "}
            {formatCurrency(liveOrder.amount)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 p-5">
          <Section title="Order Summary" icon={Package}>
            <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 sm:grid-cols-2">
              <DetailField
                label="Order ID"
                value={`#${liveOrder.orderNumber}`}
              />
              <DetailField
                label="Order Date"
                value={formatDate(liveOrder.createdAt)}
              />
              <DetailField
                label="Amount"
                value={formatCurrency(liveOrder.amount)}
              />
              <DetailField
                label="ETA"
                value={
                  liveOrder.expectedDelivery
                    ? formatDate(liveOrder.expectedDelivery)
                    : (liveOrder.eta ?? "—")
                }
              />
              <DetailField
                label="Payment"
                value={<span className={paymentTone}>{paymentStatus}</span>}
              />
              <DetailField
                label="Payment Method"
                value={formatPaymentMethodLabel(liveOrder.paymentMethod)}
              />
              <DetailField
                label="Tracking"
                value={
                  liveOrder.statusLabel ??
                  liveOrder.trackingStep.replaceAll("_", " ")
                }
              />
              {liveOrder.lastUpdated ? (
                <DetailField
                  label="Last Updated"
                  value={formatDate(liveOrder.lastUpdated)}
                />
              ) : null}
            </div>
          </Section>

          <Section title="Customer" icon={Package}>
            <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
              <DetailField label="Company" value={liveOrder.company} />
              <DetailField label="Contact" value={liveOrder.customerName} />
              <DetailField
                label="Source"
                value={<CeStatusBadge status={liveOrder.orderSource} />}
              />
              <DetailField
                label="Priority"
                value={liveOrder.deliveryPriority}
              />
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
                  {liveOrder.items.map((item) => (
                    <TableRow key={`${item.productId}-${item.productName}`}>
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
              <p className="text-[#1A1A1A]">{liveOrder.deliveryAddress}</p>
              <p className="mt-1 text-[#64748B]">
                PIN: {liveOrder.deliveryPincode}
              </p>
            </div>
          </Section>

          <Section title="Hub routing" icon={MapPin}>
            <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
              <DetailField
                label="Assignment"
                value={
                  liveOrder.routing?.assignmentStatus === "UNASSIGNED" || !hubName
                    ? "Not Assigned"
                    : hubName
                }
              />
              <DetailField
                label="Status"
                value={
                  liveOrder.routing?.snapshot?.inCoverage
                    ? "Inside service area"
                    : liveOrder.routing?.assignmentReasonLabel ||
                      (hubName ? "Assigned" : "Outside service area")
                }
              />
              <DetailField
                label="Nearest Hub"
                value={
                  liveOrder.routing?.snapshot?.nearestHubName ||
                  hubName ||
                  "—"
                }
              />
              <DetailField
                label="Distance"
                value={
                  liveOrder.routing?.snapshot?.nearestDistanceKm != null
                    ? `${liveOrder.routing.snapshot.nearestDistanceKm} km`
                    : "—"
                }
              />
              <DetailField
                label="Hub radius"
                value={
                  liveOrder.routing?.snapshot?.nearestHubRadiusKm != null
                    ? `${liveOrder.routing.snapshot.nearestHubRadiusKm} km`
                    : "—"
                }
              />
              <DetailField
                label="Customer location"
                value={
                  liveOrder.routing?.snapshot?.customerLatitude != null &&
                  liveOrder.routing?.snapshot?.customerLongitude != null
                    ? `${liveOrder.routing.snapshot.customerLatitude}, ${liveOrder.routing.snapshot.customerLongitude}`
                    : "Not available"
                }
              />
            </div>
          </Section>

          {hubName ? (
            <Section title="Assigned Hub" icon={MapPin}>
              <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
                <DetailField label="Hub" value={hubName} />
                <DetailField
                  label="Code"
                  value={liveOrder.hubCode || "—"}
                />
                <DetailField
                  label="Manager"
                  value={liveOrder.managerName || "—"}
                />
              </div>
            </Section>
          ) : null}

          {driverName ? (
            <Section title="Driver & Vehicle" icon={Truck}>
              <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
                <DetailField label="Driver" value={driverName} />
                <DetailField label="Phone" value={driverPhone || "—"} />
                {vehicleNumber ? (
                  <DetailField label="Vehicle" value={vehicleNumber} />
                ) : null}
              </div>
            </Section>
          ) : null}

          {liveOrder.deliveryVerification ? (
            <Section title="Delivery Verification" icon={ShieldCheck}>
              <div className="grid gap-4 rounded-lg border border-gray-100 p-4 sm:grid-cols-2">
                <DetailField
                  label="Driver Reached"
                  value={
                    liveOrder.deliveryVerification.driverReached
                      ? liveOrder.deliveryVerification.driverReachedAt
                        ? formatDate(
                            liveOrder.deliveryVerification.driverReachedAt,
                          )
                        : "Yes"
                      : "No"
                  }
                />
                <DetailField
                  label="OTP Generated"
                  value={
                    liveOrder.deliveryVerification.otpGenerated
                      ? liveOrder.deliveryVerification.otpGeneratedAt
                        ? formatDate(
                            liveOrder.deliveryVerification.otpGeneratedAt,
                          )
                        : "Yes"
                      : "No"
                  }
                />
                <DetailField
                  label="OTP Verified"
                  value={
                    liveOrder.deliveryVerification.otpVerified ? "Yes" : "No"
                  }
                />
                <DetailField
                  label="Verified By"
                  value={liveOrder.deliveryVerification.verifiedBy || "—"}
                />
                <DetailField
                  label="Verification Time"
                  value={
                    liveOrder.deliveryVerification.verifiedAt
                      ? formatDate(liveOrder.deliveryVerification.verifiedAt)
                      : "—"
                  }
                />
                <DetailField
                  label="Delivered"
                  value={
                    liveOrder.deliveryVerification.delivered
                      ? liveOrder.deliveryVerification.deliveredAt
                        ? formatDate(liveOrder.deliveryVerification.deliveredAt)
                        : "Yes"
                      : "No"
                  }
                />
                <DetailField
                  label="Driver"
                  value={
                    liveOrder.deliveryVerification.driver?.name ||
                    driverName ||
                    "—"
                  }
                />
                <DetailField
                  label="Vehicle"
                  value={
                    liveOrder.deliveryVerification.vehicle?.registration ||
                    vehicleNumber ||
                    "—"
                  }
                />
                <DetailField
                  label="Hub"
                  value={
                    liveOrder.deliveryVerification.hub?.name || hubName || "—"
                  }
                />
                {liveOrder.deliveryVerification.paymentCollectedAt ? (
                  <DetailField
                    label="Payment Collected"
                    value={formatDate(
                      liveOrder.deliveryVerification.paymentCollectedAt,
                    )}
                  />
                ) : null}
              </div>
            </Section>
          ) : null}

          {liveOrder.timeline && liveOrder.timeline.length > 0 ? (
            <Section title="Timeline" icon={Package}>
              <ol className="space-y-3 rounded-lg border border-gray-100 p-4">
                {liveOrder.timeline.map((entry, index) => (
                  <li
                    key={
                      entry.id ?? `${entry.status}-${entry.createdAt}-${index}`
                    }
                    className="border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {entry.statusLabel ??
                        entry.status?.replaceAll("_", " ") ??
                        "Update"}
                    </p>
                    {entry.message ? (
                      <p className="mt-0.5 text-xs text-[#64748B]">
                        {entry.message}
                      </p>
                    ) : null}
                    {entry.createdAt ? (
                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatDate(entry.createdAt)}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
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
          {(liveOrder.invoiceId || liveOrder.status === "DELIVERED") && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={downloadingInvoice}
              onClick={() => void handleDownloadInvoice()}
            >
              <Download className="size-4" />
              Invoice PDF
            </Button>
          )}
          <Button
            type="button"
            className="w-full sm:w-auto"
            render={
              <Link
                href={`${ROUTES.CUSTOMER_EXECUTIVE_ORDERS}?order=${liveOrder.id}`}
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
