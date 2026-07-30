"use client";

import { Download, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";

import { HubOrderStatusBadge } from "@/components/sub-hub/orders/HubOrderStatusBadge";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { BackendAdminOrder } from "@/features/customer-executive/utils/map-backend-order";
import {
  adminOrdersService,
  downloadAdminOrderInvoicePdf,
} from "@/services/adminOrders";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { formatPaymentMethodLabel } from "@/utils/payment-method-labels";
import { notify } from "@/utils/notify";

interface HubOrderDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
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

export function HubOrderDetailDrawer({
  open,
  onOpenChange,
  orderId,
}: HubOrderDetailDrawerProps) {
  const [order, setOrder] = useState<BackendAdminOrder | null>(null);
  const [timeline, setTimeline] = useState<
    Array<{ statusLabel?: string; message?: string; createdAt?: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !orderId) {
      setOrder(null);
      setTimeline([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void Promise.all([
      adminOrdersService.getById(orderId),
      adminOrdersService.timeline(orderId),
    ])
      .then(([detail, entries]) => {
        if (cancelled) return;
        setOrder(detail);
        setTimeline(entries ?? []);
      })
      .catch(() => {
        if (!cancelled) notify.error("Failed to load order details");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, orderId]);

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      await downloadAdminOrderInvoicePdf(orderId);
    } catch {
      notify.error("Failed to download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const address =
    order?.deliveryAddress ??
    order?.address ??
    (order as { address?: { line1?: string; city?: string; pincode?: string } })
      ?.address;

  const addressRecord = address as {
    line1?: string;
    line2?: string;
    city?: string;
    pincode?: string;
    address?: string;
  } | null;

  const addressLabel = [
    addressRecord?.line1 ?? addressRecord?.address,
    addressRecord?.line2,
    addressRecord?.city,
    addressRecord?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {loading ? "Loading…" : (order?.orderNumber ?? "Order Details")}
          </SheetTitle>
          <SheetDescription>
            Customer order details, payment, dispatch, and timeline.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : order ? (
          <div className="mt-6 space-y-6 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <HubOrderStatusBadge
                status={order.orderStatus ?? order.status ?? "PENDING"}
                label={order.statusLabel}
              />
              {order.paymentStatus ? (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize">
                  {order.paymentStatus.toLowerCase()}
                </span>
              ) : null}
            </div>

            <Section title="Customer Details" icon={Package}>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-100 bg-[#FAFAFA] p-4">
                <DetailField
                  label="Name"
                  value={order.customer?.fullName ?? "—"}
                />
                <DetailField
                  label="Phone"
                  value={order.customer?.phone ?? "—"}
                />
                <DetailField
                  label="GST"
                  value={
                    (order.customer as { profile?: { gstNumber?: string } })
                      ?.profile?.gstNumber ?? "—"
                  }
                />
                <DetailField
                  label="Company"
                  value={
                    (order.customer as { profile?: { companyName?: string } })
                      ?.profile?.companyName ?? "—"
                  }
                />
              </div>
            </Section>

            <Section title="Delivery Address" icon={MapPin}>
              <p className="rounded-lg border border-gray-100 bg-[#FAFAFA] p-4 text-sm text-[#1A1A1A]">
                {addressLabel || "—"}
              </p>
            </Section>

            {order.items && order.items.length > 0 ? (
              <Section title="Items" icon={Package}>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, idx) => {
                        const variantLabel = (item as { variant?: string })
                          .variant;
                        return (
                          <TableRow key={item.productId ?? idx}>
                            <TableCell className="text-sm">
                              {item.name ?? item.product?.name ?? "Product"}
                              {variantLabel ? (
                                <span className="mt-0.5 block text-xs text-[#94A3B8]">
                                  {variantLabel}
                                </span>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.quantity} {item.unit ?? ""}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatCurrency(Number(item.unitPrice ?? 0))}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Section>
            ) : null}

            <Section title="Payment" icon={ShieldCheck}>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-100 bg-[#FAFAFA] p-4">
                <DetailField
                  label="Method"
                  value={formatPaymentMethodLabel(
                    order.paymentMethod ?? "CASH",
                  )}
                />
                <DetailField
                  label="Status"
                  value={order.paymentStatus?.replaceAll("_", " ") ?? "—"}
                />
                <DetailField
                  label="Subtotal"
                  value={formatCurrency(
                    Number(
                      (order as { subtotal?: number | string }).subtotal ??
                        order.grandTotal ??
                        0,
                    ),
                  )}
                />
                <DetailField
                  label="Grand Total"
                  value={formatCurrency(
                    Number(order.grandTotal ?? order.amount ?? 0),
                  )}
                />
                {(order as { discountAmount?: number }).discountAmount ? (
                  <DetailField
                    label="Discount"
                    value={formatCurrency(
                      Number(
                        (order as { discountAmount?: number }).discountAmount,
                      ),
                    )}
                  />
                ) : null}
                {(order as { loyaltyPointsUsed?: number }).loyaltyPointsUsed ? (
                  <DetailField
                    label="Loyalty Points"
                    value={String(
                      (order as { loyaltyPointsUsed?: number })
                        .loyaltyPointsUsed,
                    )}
                  />
                ) : null}
              </div>
            </Section>

            <Section title="Driver & Vehicle" icon={Truck}>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-100 bg-[#FAFAFA] p-4">
                <DetailField
                  label="Driver"
                  value={order.assignedDriver?.name ?? "Unassigned"}
                />
                <DetailField
                  label="Phone"
                  value={order.assignedDriver?.phone ?? "—"}
                />
                <DetailField
                  label="Vehicle"
                  value={
                    order.assignedVehicle?.registration ??
                    order.assignedDriver?.vehicle?.registration ??
                    "—"
                  }
                />
                <DetailField
                  label="OTP Verified"
                  value={
                    (order as { deliveryOtpVerified?: boolean })
                      .deliveryOtpVerified
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </Section>

            {timeline.length > 0 ? (
              <Section title="Timeline" icon={Package}>
                <ol className="space-y-3">
                  {timeline.map((entry, idx) => (
                    <li
                      key={idx}
                      className="relative border-l-2 border-orange-200 pb-1 pl-4"
                    >
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {entry.statusLabel ?? entry.message ?? "Update"}
                      </p>
                      {entry.createdAt ? (
                        <p className="text-xs text-[#94A3B8]">
                          {formatDate(entry.createdAt)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </Section>
            ) : null}

            {order.invoiceNumber ? (
              <Section title="Invoice" icon={ShieldCheck}>
                <DetailField label="Invoice No." value={order.invoiceNumber} />
              </Section>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-sm text-[#64748B]">Order not found.</p>
        )}

        <SheetFooter className="mt-4 gap-2 sm:flex-row">
          {order?.invoiceId || order?.invoiceNumber ? (
            <Button
              variant="outline"
              onClick={() => void handleDownloadInvoice()}
              disabled={downloading}
            >
              <Download className="mr-2 size-4" />
              {downloading ? "Downloading…" : "Download Invoice"}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
