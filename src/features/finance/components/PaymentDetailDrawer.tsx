"use client";

import { format } from "date-fns";
import {
  Building2,
  Download,
  ExternalLink,
  FileText,
  IndianRupee,
  MapPin,
  Package,
  Phone,
  Receipt,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinanceStatusBadge } from "@/features/finance/components/FinanceStatusBadge";
import { FinanceTimeline } from "@/features/finance/components/FinanceTimeline";
import type { FinanceInvoice } from "@/features/finance/types";
import {
  downloadInvoicePdf,
  viewInvoicePdf,
} from "@/features/finance/utils/invoice-pdf";
import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { formatCurrency } from "@/utils/format-currency";
import { formatGST } from "@/utils/format-gst";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface PaymentDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: FinanceInvoice | null;
  onMarkAsPaid?: (invoice: FinanceInvoice) => void;
  onCancelPayment?: (invoice: FinanceInvoice) => void;
}

function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function InfoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-gray-50/60 p-4",
        className,
      )}
    >
      {children}
    </div>
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

function getCustomerInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PaymentDetailDrawer({
  open,
  onOpenChange,
  invoice,
  onMarkAsPaid,
  onCancelPayment,
}: PaymentDetailDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (open && invoice) {
      setActiveTab("overview");
    }
  }, [open, invoice?.id]);

  const handleDownload = () => {
    if (!invoice) return;
    downloadInvoicePdf(invoice);
    notify.success("Invoice downloaded", `${invoice.invoiceNumber}.pdf`);
  };

  const handleViewInvoice = () => {
    if (!invoice) return;
    viewInvoicePdf(invoice);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px]"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-100 px-6 py-5 pr-14 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="flex items-center gap-2.5 text-xl font-bold text-[#1A1A1A]">
                <span className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Receipt className="text-primary size-5" />
                </span>
                <span className="truncate">
                  {invoice?.invoiceNumber ?? "Payment Details"}
                </span>
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-sm text-[#64748B]">
                {invoice
                  ? `Order #${invoice.orderNumber} · ${format(new Date(invoice.invoiceDate), "dd MMM yyyy")}`
                  : "Invoice, customer, and payment information"}
              </SheetDescription>
            </div>
            {invoice ? <FinanceStatusBadge status={invoice.status} /> : null}
          </div>

          {invoice ? (
            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-orange-100 bg-linear-to-r from-orange-50/80 to-white px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                  <IndianRupee className="text-primary size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    Invoice Amount
                  </p>
                  <p className="text-xl font-bold text-[#1A1A1A]">
                    {formatCurrency(invoice.invoiceAmount)}
                  </p>
                </div>
              </div>
              {invoice.paymentMethod ? (
                <div className="text-right">
                  <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    Method
                  </p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {invoice.paymentMethod}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </SheetHeader>

        {invoice ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-6 py-5">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid h-10 w-full grid-cols-3 bg-gray-100/80">
                    <TabsTrigger
                      value="overview"
                      className="text-xs sm:text-sm"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="products"
                      className="text-xs sm:text-sm"
                    >
                      Products & GST
                    </TabsTrigger>
                    <TabsTrigger
                      value="timeline"
                      className="text-xs sm:text-sm"
                    >
                      Timeline
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-5 space-y-5">
                    <DetailSection title="Invoice Information">
                      <InfoCard className="bg-white">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                          <DetailField
                            label="Invoice Number"
                            value={invoice.invoiceNumber}
                          />
                          <DetailField
                            label="Invoice Date"
                            value={format(
                              new Date(invoice.invoiceDate),
                              "dd MMM yyyy",
                            )}
                          />
                          <DetailField
                            label="Order ID"
                            value={`#${invoice.orderNumber}`}
                          />
                          <DetailField
                            label="Amount"
                            value={formatCurrency(invoice.invoiceAmount)}
                          />
                          {invoice.paymentDate ? (
                            <DetailField
                              label="Payment Date"
                              value={format(
                                new Date(invoice.paymentDate),
                                "dd MMM yyyy",
                              )}
                            />
                          ) : null}
                          {invoice.verifiedBy ? (
                            <DetailField
                              label="Verified By"
                              value={invoice.verifiedBy}
                            />
                          ) : null}
                        </div>
                      </InfoCard>
                    </DetailSection>

                    <DetailSection title="Customer Information">
                      <div className="rounded-xl border border-gray-100 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="size-11 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {getCustomerInitials(invoice.customerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[#1A1A1A]">
                              {invoice.customerName}
                            </p>
                            <p className="text-sm text-[#64748B]">
                              {invoice.customerCompany}
                            </p>
                            <div className="mt-3 space-y-1.5">
                              <p className="flex items-center gap-2 text-xs text-[#64748B]">
                                <Phone className="size-3.5 shrink-0 text-gray-400" />
                                {invoice.customerPhone}
                              </p>
                              {invoice.customerGst ? (
                                <p className="flex items-center gap-2 text-xs text-[#64748B]">
                                  <Building2 className="size-3.5 shrink-0 text-gray-400" />
                                  GST {formatGST(invoice.customerGst)}
                                </p>
                              ) : null}
                              <p className="flex items-start gap-2 text-xs leading-relaxed text-[#64748B]">
                                <MapPin className="mt-0.5 size-3.5 shrink-0 text-gray-400" />
                                {invoice.customerAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DetailSection>

                    <DetailSection title="Assigned Hub & Executive">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                            <MapPin className="text-primary size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                              Assigned Hub
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#1A1A1A]">
                              {invoice.hubName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <User className="size-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                              Customer Executive
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#1A1A1A]">
                              {invoice.executiveName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DetailSection>

                    <DetailSection title="Payment Status">
                      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
                        <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                          <Package className="text-primary size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <FinanceStatusBadge status={invoice.status} />
                          {invoice.cancellationReason ? (
                            <p className="mt-2 text-sm text-[#64748B]">
                              {invoice.cancellationReason}
                            </p>
                          ) : null}
                          {invoice.verifiedAt ? (
                            <p className="mt-1.5 text-xs text-[#64748B]">
                              Verified on{" "}
                              {format(
                                new Date(invoice.verifiedAt),
                                "dd MMM yyyy, hh:mm a",
                              )}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </DetailSection>
                  </TabsContent>

                  <TabsContent value="products" className="mt-5 space-y-5">
                    <DetailSection title="Products">
                      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-orange-50/50 hover:bg-orange-50/50">
                              <TableHead className="text-xs">Product</TableHead>
                              <TableHead className="text-right text-xs">
                                Qty
                              </TableHead>
                              <TableHead className="text-right text-xs">
                                Amount
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoice.products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell className="py-3">
                                  <p className="text-sm font-medium text-[#1A1A1A]">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-[#64748B]">
                                    {product.sku} · GST {product.gstRate}%
                                  </p>
                                </TableCell>
                                <TableCell className="text-right text-sm text-[#64748B]">
                                  {product.quantity} {product.unit}
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">
                                  {formatCurrency(product.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DetailSection>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DetailSection title="GST Summary">
                        <InfoCard className="space-y-2 bg-white text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#64748B]">Taxable</span>
                            <span className="font-medium">
                              {formatCurrency(invoice.gstSummary.taxableAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#64748B]">CGST</span>
                            <span>
                              {formatCurrency(invoice.gstSummary.cgst)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#64748B]">SGST</span>
                            <span>
                              {formatCurrency(invoice.gstSummary.sgst)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span className="font-medium">Total GST</span>
                            <span className="font-semibold">
                              {formatCurrency(invoice.gstSummary.totalGst)}
                            </span>
                          </div>
                        </InfoCard>
                      </DetailSection>

                      <DetailSection title="Order Summary">
                        <InfoCard className="space-y-2 bg-white text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#64748B]">Subtotal</span>
                            <span>
                              {formatCurrency(invoice.orderSummary.subtotal)}
                            </span>
                          </div>
                          {invoice.orderSummary.discount > 0 ? (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>
                                -{formatCurrency(invoice.orderSummary.discount)}
                              </span>
                            </div>
                          ) : null}
                          <div className="flex justify-between">
                            <span className="text-[#64748B]">Delivery</span>
                            <span>
                              {formatCurrency(
                                invoice.orderSummary.deliveryCharges,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#64748B]">GST</span>
                            <span>
                              {formatCurrency(invoice.orderSummary.gstTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span className="font-semibold">Grand Total</span>
                            <span className="text-primary font-bold">
                              {formatCurrency(invoice.orderSummary.grandTotal)}
                            </span>
                          </div>
                        </InfoCard>
                      </DetailSection>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-5">
                    <DetailSection title="Payment Lifecycle">
                      <InfoCard className="bg-white">
                        <FinanceTimeline events={invoice.timeline} />
                      </InfoCard>
                    </DetailSection>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <SheetFooter className="shrink-0 flex-row flex-wrap gap-2 border-t border-gray-100 bg-white px-6 py-4">
              <Button variant="outline" size="sm" onClick={handleViewInvoice}>
                <FileText className="size-4" />
                View Invoice
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(NAV_FILTER_PRESETS.orderDetail(invoice.orderId))
                }
              >
                <ExternalLink className="size-4" />
                View Order
              </Button>
              {invoice.status === "Pending" ? (
                <>
                  <Button size="sm" onClick={() => onMarkAsPaid?.(invoice)}>
                    Mark as Paid
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancelPayment?.(invoice)}
                  >
                    Cancel Payment
                  </Button>
                </>
              ) : null}
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-[#64748B]">
            Select a payment record to view details.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
