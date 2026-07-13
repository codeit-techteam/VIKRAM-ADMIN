"use client";

import {
  EMPTY_FINANCE_FILTERS,
  FINANCE_PAGE_SIZE,
  type FinanceInvoice,
  type FinancePaymentFilters,
} from "@/features/finance/types";
import { useFinanceLoading } from "@/features/finance/hooks/use-finance-loading";
import { FinanceFilterBar } from "@/features/finance/components/FinanceFilterBar";
import { FinanceStatusBadge } from "@/features/finance/components/FinanceStatusBadge";
import { PaymentDetailDrawer } from "@/features/finance/components/PaymentDetailDrawer";
import {
  downloadInvoicePdf,
  viewInvoicePdf,
} from "@/features/finance/utils/invoice-pdf";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { CeConfirmationDialog } from "@/features/customer-executive/components/shared/CeConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { ROUTES } from "@/constants/routes";
import { useFinanceStore } from "@/store/finance-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";
import { format } from "date-fns";
import {
  Download,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Receipt,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export function FinancePaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading } = useFinanceLoading();

  const invoices = useFinanceStore((s) => s.invoices);
  const queryInvoices = useFinanceStore((s) => s.queryInvoices);
  const getDashboardStats = useFinanceStore((s) => s.getDashboardStats);
  const markAsPaid = useFinanceStore((s) => s.markAsPaid);
  const cancelPayment = useFinanceStore((s) => s.cancelPayment);

  const [draftFilters, setDraftFilters] = useState<FinancePaymentFilters>(
    EMPTY_FINANCE_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<FinancePaymentFilters>(
    EMPTY_FINANCE_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmPaidTarget, setConfirmPaidTarget] =
    useState<FinanceInvoice | null>(null);
  const [confirmCancelTarget, setConfirmCancelTarget] =
    useState<FinanceInvoice | null>(null);

  const hydrateFromUrl = useCallback(() => {
    const statusParam = searchParams.get("status");
    const filterParam = searchParams.get("filter");
    const idParam = searchParams.get("id");

    const filters: FinancePaymentFilters = { ...EMPTY_FINANCE_FILTERS };

    if (statusParam) {
      const normalized =
        statusParam.charAt(0).toUpperCase() +
        statusParam.slice(1).toLowerCase();
      if (["Pending", "Paid", "Cancelled"].includes(normalized)) {
        filters.status = normalized as FinancePaymentFilters["status"];
      }
    }

    if (filterParam === "today") {
      filters.quickFilter = "today";
    } else if (filterParam === "paid") {
      filters.quickFilter = "paid";
    }

    setDraftFilters(filters);
    setAppliedFilters(filters);
    setCurrentPage(1);

    if (idParam) {
      setSelectedInvoiceId(idParam);
      setDrawerOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    hydrateFromUrl();
  }, [hydrateFromUrl]);

  const stats = useMemo(
    () => getDashboardStats(),
    [getDashboardStats, invoices],
  );

  const queryResult = useMemo(
    () =>
      queryInvoices({
        page: currentPage,
        limit: FINANCE_PAGE_SIZE,
        filters: appliedFilters,
      }),
    [queryInvoices, currentPage, appliedFilters, invoices],
  );

  const selectedInvoice = useMemo(
    () =>
      selectedInvoiceId
        ? (invoices.find((inv) => inv.id === selectedInvoiceId) ?? null)
        : null,
    [selectedInvoiceId, invoices],
  );

  const openDrawer = (invoice: FinanceInvoice) => {
    setSelectedInvoiceId(invoice.id);
    setDrawerOpen(true);
  };

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      setSelectedInvoiceId(null);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters, quickFilter: null });
    setCurrentPage(1);
    router.push(ROUTES.FINANCE_PAYMENTS);
  };

  const handleResetFilters = () => {
    setDraftFilters(EMPTY_FINANCE_FILTERS);
    setAppliedFilters(EMPTY_FINANCE_FILTERS);
    setCurrentPage(1);
    router.push(ROUTES.FINANCE_PAYMENTS);
  };

  const handleMarkAsPaid = () => {
    if (!confirmPaidTarget) return;
    markAsPaid(confirmPaidTarget.id);
    setConfirmPaidTarget(null);
    notify.success(
      "Payment marked as received",
      `${confirmPaidTarget.invoiceNumber} verified and completed`,
    );
  };

  const handleCancelPayment = () => {
    if (!confirmCancelTarget) return;
    cancelPayment(confirmCancelTarget.id);
    setConfirmCancelTarget(null);
    notify.success(
      "Payment cancelled",
      `${confirmCancelTarget.invoiceNumber} has been cancelled`,
    );
  };

  const handleDownloadInvoice = (invoice: FinanceInvoice) => {
    downloadInvoicePdf(invoice);
    notify.success("Invoice downloaded", `${invoice.invoiceNumber}.pdf`);
  };

  const handleViewInvoice = (invoice: FinanceInvoice) => {
    viewInvoicePdf(invoice);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Payments"
        subtitle="Track invoices, verify payments, and manage the complete payment lifecycle."
        breadcrumbs={getNavBreadcrumbsFromPath("/finance-payments")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending Payments"
          value={stats.pendingCount}
          subtext="Awaiting customer payment"
          valueVariant="warning"
          href={NAV_FILTER_PRESETS.financePending()}
          isLoading={isLoading}
        />
        <StatCard
          label="Paid Today"
          value={stats.paidTodayCount}
          subtext="Payments received today"
          href={NAV_FILTER_PRESETS.financePaidToday()}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtext="From completed payments"
          href={NAV_FILTER_PRESETS.financePaid()}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Transactions"
          value={stats.totalTransactions}
          subtext="All generated invoices"
          href={NAV_FILTER_PRESETS.financePayments()}
          isLoading={isLoading}
        />
      </div>

      <FinanceFilterBar
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Payment Records
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            {queryResult.total} invoice{queryResult.total !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : queryResult.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No payment records found"
              description="Try adjusting your filters or search criteria."
              icon={<Receipt className="size-8" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-50/50">
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Customer Executive
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Assigned Hub
                  </TableHead>
                  <TableHead>Invoice Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Invoice Date
                  </TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResult.items.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-orange-50/40",
                      selectedInvoiceId === invoice.id &&
                        drawerOpen &&
                        "bg-orange-50/60",
                    )}
                    onClick={() => openDrawer(invoice)}
                  >
                    <TableCell className="text-primary font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>#{invoice.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">
                          {invoice.customerName}
                        </p>
                        <p className="text-xs text-[#64748B] lg:hidden">
                          {invoice.executiveName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-[#64748B] lg:table-cell">
                      {invoice.executiveName}
                    </TableCell>
                    <TableCell className="hidden text-sm text-[#64748B] md:table-cell">
                      {invoice.hubName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.invoiceAmount)}
                    </TableCell>
                    <TableCell>
                      <FinanceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="hidden text-sm text-[#64748B] sm:table-cell">
                      {format(new Date(invoice.invoiceDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInvoice(invoice);
                            }}
                          >
                            <FileText className="size-4" />
                            View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoice(invoice);
                            }}
                          >
                            <Download className="size-4" />
                            Download Invoice
                          </DropdownMenuItem>
                          {invoice.status === "Pending" ? (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmPaidTarget(invoice);
                                }}
                              >
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmCancelTarget(invoice);
                                }}
                              >
                                Cancel Payment
                              </DropdownMenuItem>
                            </>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                NAV_FILTER_PRESETS.orderDetail(invoice.orderId),
                              );
                            }}
                          >
                            <ExternalLink className="size-4" />
                            View Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && queryResult.total > 0 ? (
          <Pagination
            currentPage={queryResult.page}
            totalPages={queryResult.totalPages}
            pageSize={FINANCE_PAGE_SIZE}
            totalItems={queryResult.total}
            onPageChange={setCurrentPage}
            itemLabel="invoices"
          />
        ) : null}
      </div>

      <PaymentDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        invoice={selectedInvoice}
        onMarkAsPaid={(inv) => setConfirmPaidTarget(inv)}
        onCancelPayment={(inv) => setConfirmCancelTarget(inv)}
      />

      <CeConfirmationDialog
        open={Boolean(confirmPaidTarget)}
        onOpenChange={(open) => !open && setConfirmPaidTarget(null)}
        title="Mark Payment as Received"
        description={
          confirmPaidTarget
            ? `Confirm that payment of ${formatCurrency(confirmPaidTarget.invoiceAmount)} for ${confirmPaidTarget.invoiceNumber} has been received and verified.`
            : ""
        }
        confirmLabel="Mark as Paid"
        onConfirm={handleMarkAsPaid}
      />

      <CeConfirmationDialog
        open={Boolean(confirmCancelTarget)}
        onOpenChange={(open) => !open && setConfirmCancelTarget(null)}
        title="Cancel Payment"
        description={
          confirmCancelTarget
            ? `Are you sure you want to cancel the payment for ${confirmCancelTarget.invoiceNumber}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Cancel Payment"
        variant="destructive"
        onConfirm={handleCancelPayment}
      />
    </div>
  );
}
