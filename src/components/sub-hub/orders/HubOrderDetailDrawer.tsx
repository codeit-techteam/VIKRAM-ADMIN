"use client";

import {
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { HubOrderStatusBadge } from "@/components/sub-hub/orders/HubOrderStatusBadge";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { BackendAdminOrder } from "@/features/customer-executive/utils/map-backend-order";
import { cn } from "@/lib/utils";
import {
  adminOrdersService,
  downloadAdminOrderInvoicePdf,
} from "@/services/adminOrders";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate, formatDateTime } from "@/utils/format-date";
import { formatPaymentMethodLabel } from "@/utils/payment-method-labels";
import { notify } from "@/utils/notify";

interface HubOrderDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

type AddressRecord = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  country?: string;
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
        <span className="flex size-7 items-center justify-center rounded-lg bg-orange-50 text-[#F97316]">
          <Icon className="size-3.5" />
        </span>
        <h3 className="text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">
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
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium wrap-break-word text-[#1A1A1A]">
        {value}
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-sm text-[#64748B]">—</span>;

  const key = status.toUpperCase();
  const styles: Record<string, string> = {
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    COLLECTED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
    FAILED: "bg-red-50 text-red-700 ring-red-100",
    REFUNDED: "bg-slate-100 text-slate-700 ring-slate-200",
    PARTIALLY_PAID: "bg-sky-50 text-sky-700 ring-sky-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        styles[key] ?? "bg-gray-100 text-gray-700 ring-gray-200",
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function OtpBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        verified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700",
      )}
    >
      {verified ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <XCircle className="size-3" />
      )}
      {verified ? "Verified" : "Not verified"}
    </span>
  );
}

function PhoneLink({ phone }: { phone?: string | null }) {
  if (!phone) return <span>—</span>;
  const href = `tel:${phone.replace(/\s+/g, "")}`;
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 text-[#F97316] hover:underline"
    >
      <Phone className="size-3.5 shrink-0" />
      {phone}
    </a>
  );
}

function MoneyRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "muted" | "emphasis" | "discount";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 text-sm",
        tone === "emphasis" && "pt-2",
      )}
    >
      <span
        className={cn(
          "text-[#64748B]",
          tone === "emphasis" && "font-semibold text-[#1A1A1A]",
          tone === "discount" && "text-emerald-700",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-medium text-[#1A1A1A] tabular-nums",
          tone === "muted" && "text-[#64748B]",
          tone === "emphasis" && "text-base font-bold text-[#1A1A1A]",
          tone === "discount" && "text-emerald-700",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function formatDeliveryAddress(address: AddressRecord | null | undefined): {
  primary: string;
  pincode?: string;
} {
  if (!address) return { primary: "" };

  const candidates = [
    address.line1 ?? address.address,
    address.line2,
    address.city,
    address.state,
    address.country,
  ];

  const parts: string[] = [];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    const haystack = parts.join(", ").toLowerCase();
    if (haystack.includes(value.toLowerCase())) continue;
    parts.push(value);
  }

  const pincode = address.pincode?.trim();
  const primary = parts.join(", ");
  const pincodeAlreadyPresent =
    !!pincode && primary.toLowerCase().includes(pincode.toLowerCase());

  return {
    primary,
    pincode: pincode && !pincodeAlreadyPresent ? pincode : undefined,
  };
}

function asNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
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
    (order?.deliveryAddress as AddressRecord | null | undefined) ??
    (order?.address as AddressRecord | null | undefined);
  const { primary: addressPrimary, pincode: addressPincode } =
    formatDeliveryAddress(address);

  const subtotal = asNumber(order?.subtotal ?? order?.grandTotal);
  const discount = asNumber(order?.discountAmount);
  const gst = asNumber(order?.gstAmount);
  const deliveryCharge = asNumber(order?.deliveryCharge);
  const grandTotal = asNumber(order?.grandTotal ?? order?.amount);
  const otpVerified = Boolean(
    order?.deliveryOtpVerified ??
    order?.deliveryVerification?.otpVerified ??
    false,
  );

  const customerProfile = order?.customer?.profile;

  const metaBits = [
    order?.createdAt ? `Placed ${formatDate(order.createdAt)}` : null,
    order?.hub?.code || order?.hub?.name || null,
    grandTotal ? formatCurrency(grandTotal) : null,
  ].filter(Boolean);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
          <div className="flex flex-wrap items-start gap-2 pr-8">
            <SheetTitle className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              {loading ? "Loading…" : (order?.orderNumber ?? "Order Details")}
            </SheetTitle>
            {!loading && order ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <HubOrderStatusBadge
                  status={order.orderStatus ?? order.status ?? "PENDING"}
                  label={order.statusLabel}
                />
                {order.paymentStatus ? (
                  <PaymentStatusBadge status={order.paymentStatus} />
                ) : null}
              </div>
            ) : null}
          </div>
          <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
            {loading
              ? "Fetching customer, payment, and dispatch details…"
              : metaBits.length > 0
                ? metaBits.join(" · ")
                : "Customer order details, payment, dispatch, and timeline."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : order ? (
            <div className="space-y-7 pb-2">
              <Section title="Customer" icon={User}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <DetailField
                    label="Name"
                    value={order.customer?.fullName ?? "—"}
                  />
                  <DetailField
                    label="Phone"
                    value={<PhoneLink phone={order.customer?.phone} />}
                  />
                  <DetailField
                    label="Company"
                    value={customerProfile?.companyName ?? "—"}
                  />
                  <DetailField
                    label="GSTIN"
                    value={
                      <span className="font-mono text-[13px]">
                        {customerProfile?.gstNumber ?? "—"}
                      </span>
                    }
                  />
                </div>
              </Section>

              <Section title="Delivery Address" icon={MapPin}>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="text-sm leading-relaxed text-[#1A1A1A]">
                    {addressPrimary || "—"}
                  </p>
                  {addressPincode || address?.pincode ? (
                    <p className="mt-2 text-xs font-medium tracking-wide text-[#64748B]">
                      PIN {addressPincode ?? address?.pincode}
                    </p>
                  ) : null}
                </div>
              </Section>

              <Section title="Delivery Preference" icon={Truck}>
                <div className="grid gap-4 rounded-xl border border-gray-100 p-4 sm:grid-cols-2">
                  <DetailField
                    label="Delivery Type"
                    value={
                      order.deliveryPreference?.label ??
                      "As soon as possible"
                    }
                  />
                  <DetailField
                    label="Date"
                    value={
                      order.deliveryPreference?.scheduledDateLabel ?? "—"
                    }
                  />
                  <DetailField
                    label="Time"
                    value={
                      order.deliveryPreference?.scheduledSlotLabel ?? "—"
                    }
                  />
                  <DetailField
                    label="Customer Remark"
                    value={
                      order.deliveryPreference?.customerRemark ??
                      order.deliveryCustomerRemark ??
                      order.notes ??
                      "—"
                    }
                  />
                  <DetailField
                    label="Internal Note"
                    value={order.adminInternalNote ?? "—"}
                  />
                </div>
              </Section>

              {order.items && order.items.length > 0 ? (
                <Section title="Items" icon={Package}>
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
                          <TableHead className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                            Product
                          </TableHead>
                          <TableHead className="w-16 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                            Qty
                          </TableHead>
                          <TableHead className="text-right text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                            Amount
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, idx) => {
                          const variantLabel = item.variant;
                          const qty = Number(item.quantity ?? 0);
                          const unitPrice = asNumber(item.unitPrice);
                          const lineTotal =
                            asNumber(item.subtotal) || unitPrice * qty;
                          const unit = item.unit?.trim();

                          return (
                            <TableRow
                              key={item.productId ?? idx}
                              className="border-gray-100"
                            >
                              <TableCell className="align-top">
                                <p className="text-sm font-medium text-[#1A1A1A]">
                                  {item.name ?? item.product?.name ?? "Product"}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#94A3B8]">
                                  {variantLabel ? (
                                    <span>{variantLabel}</span>
                                  ) : null}
                                  {unit ? <span>· {unit}</span> : null}
                                  {unitPrice > 0 ? (
                                    <span>
                                      · {formatCurrency(unitPrice)} each
                                    </span>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell className="align-top text-sm font-semibold text-[#1A1A1A] tabular-nums">
                                {qty || "—"}
                              </TableCell>
                              <TableCell className="text-right align-top text-sm font-medium text-[#1A1A1A] tabular-nums">
                                {formatCurrency(lineTotal)}
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
                <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="Method"
                      value={formatPaymentMethodLabel(
                        order.paymentMethod ?? "CASH",
                      )}
                    />
                    <DetailField
                      label="Status"
                      value={
                        <PaymentStatusBadge status={order.paymentStatus} />
                      }
                    />
                  </div>

                  <div className="space-y-2.5 border-t border-gray-200/80 pt-3">
                    <MoneyRow
                      label="Subtotal"
                      value={formatCurrency(subtotal)}
                    />
                    {discount > 0 ? (
                      <MoneyRow
                        label="Discount"
                        value={`−${formatCurrency(discount)}`}
                        tone="discount"
                      />
                    ) : null}
                    {gst > 0 ? (
                      <MoneyRow label="GST" value={formatCurrency(gst)} />
                    ) : null}
                    {deliveryCharge > 0 ? (
                      <MoneyRow
                        label="Delivery"
                        value={formatCurrency(deliveryCharge)}
                      />
                    ) : null}
                    {order.loyaltyPointsUsed ? (
                      <MoneyRow
                        label="Loyalty points"
                        value={String(order.loyaltyPointsUsed)}
                        tone="muted"
                      />
                    ) : null}
                    <div className="border-t border-dashed border-gray-200 pt-2">
                      <MoneyRow
                        label="Grand total"
                        value={formatCurrency(grandTotal)}
                        tone="emphasis"
                      />
                    </div>
                  </div>

                  {order.invoiceNumber ? (
                    <p className="text-xs text-[#64748B]">
                      Invoice{" "}
                      <span className="font-medium text-[#1A1A1A]">
                        {order.invoiceNumber}
                      </span>
                    </p>
                  ) : null}
                </div>
              </Section>

              <Section title="Driver & Vehicle" icon={Truck}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <DetailField
                    label="Driver"
                    value={order.assignedDriver?.name ?? "Unassigned"}
                  />
                  <DetailField
                    label="Phone"
                    value={<PhoneLink phone={order.assignedDriver?.phone} />}
                  />
                  <DetailField
                    label="Vehicle"
                    value={
                      <span className="font-mono text-[13px] tracking-wide">
                        {order.assignedVehicle?.registration ??
                          order.assignedDriver?.vehicle?.registration ??
                          "—"}
                      </span>
                    }
                  />
                  <DetailField
                    label="OTP"
                    value={<OtpBadge verified={otpVerified} />}
                  />
                </div>
              </Section>

              {timeline.length > 0 ? (
                <Section title="Timeline" icon={Clock}>
                  <ol className="relative ml-1 space-y-0">
                    {timeline.map((entry, idx) => {
                      const isLast = idx === timeline.length - 1;
                      const isLatest = idx === 0;
                      return (
                        <li
                          key={`${entry.createdAt ?? ""}-${idx}`}
                          className="relative flex gap-3 pb-5 last:pb-0"
                        >
                          {!isLast ? (
                            <span
                              aria-hidden
                              className="absolute top-3 left-1.75 h-[calc(100%-4px)] w-px bg-orange-200"
                            />
                          ) : null}
                          <span
                            className={cn(
                              "relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2",
                              isLatest
                                ? "border-[#F97316] bg-[#F97316] shadow-[0_0_0_3px_rgba(249,115,22,0.15)]"
                                : "border-orange-200 bg-white",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-sm text-[#1A1A1A]",
                                isLatest ? "font-semibold" : "font-medium",
                              )}
                            >
                              {entry.statusLabel ?? entry.message ?? "Update"}
                            </p>
                            {entry.createdAt ? (
                              <p className="mt-0.5 text-xs text-[#94A3B8]">
                                {formatDateTime(entry.createdAt)}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </Section>
              ) : null}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center">
              <Package className="mb-2 size-8 text-[#CBD5E1]" />
              <p className="text-sm font-medium text-[#475569]">
                Order not found
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                It may have been removed or the link is invalid.
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="h-10"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {order?.invoiceId || order?.invoiceNumber ? (
              <Button
                className="h-10 bg-[#F97316] text-white hover:bg-[#EA580C]"
                onClick={() => void handleDownloadInvoice()}
                disabled={downloading || loading}
              >
                <Download className="mr-2 size-4" />
                {downloading ? "Downloading…" : "Download Invoice"}
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
