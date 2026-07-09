"use client";

import {
  Check,
  Copy,
  Download,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ROUTES } from "@/constants/routes";
import { CeCustomerAvatar } from "@/features/customer-executive/components/shared/CeCustomerAvatar";
import { CeMetricCard } from "@/features/customer-executive/components/shared/CeMetricCard";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeSearchFilter } from "@/features/customer-executive/components/shared/CeSearchFilter";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { CeTableSkeleton } from "@/features/customer-executive/components/shared/CeTableSkeleton";
import { CeConfirmationDialog } from "@/features/customer-executive/components/shared/CeConfirmationDialog";
import { useCeLoading } from "@/features/customer-executive/hooks/use-ce-loading";
import {
  CE_PAGE_SIZE,
  EMPTY_PAYMENT_FILTERS,
  type CePayment,
  type CePaymentFilters,
} from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";

export function CePaymentsPage() {
  const { isLoading } = useCeLoading();
  const queryPayments = useCustomerExecutiveStore((s) => s.queryPayments);
  const payments = useCustomerExecutiveStore((s) => s.payments);
  const sendPaymentLink = useCustomerExecutiveStore((s) => s.sendPaymentLink);
  const copyPaymentLink = useCustomerExecutiveStore((s) => s.copyPaymentLink);
  const markPaymentPaid = useCustomerExecutiveStore((s) => s.markPaymentPaid);

  const [draftFilters, setDraftFilters] = useState<CePaymentFilters>(
    EMPTY_PAYMENT_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<CePaymentFilters>(
    EMPTY_PAYMENT_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmPaidId, setConfirmPaidId] = useState<string | null>(null);

  const queryResult = useMemo(
    () =>
      queryPayments({
        page: currentPage,
        limit: CE_PAGE_SIZE,
        filters: appliedFilters,
      }),
    [queryPayments, currentPage, appliedFilters, payments],
  );

  const stats = useMemo(() => {
    const pending = payments.filter(
      (p) => p.status === "PENDING" || p.status === "PARTIAL",
    );
    const paidToday = payments.filter((p) => p.status === "PAID");
    const overdue = payments.filter(
      (p) =>
        (p.status === "PENDING" || p.status === "PARTIAL") &&
        new Date(p.dueDate) < new Date(),
    );
    const linksSent = payments.filter((p) => p.linkStatus === "SENT");

    return {
      pendingAmount: pending.reduce((s, p) => s + (p.amount - p.paidAmount), 0),
      pendingCount: pending.length,
      paidTodayAmount: paidToday.reduce((s, p) => s + p.paidAmount, 0),
      paidTodayCount: paidToday.length,
      overdueAmount: overdue.reduce((s, p) => s + (p.amount - p.paidAmount), 0),
      overdueCount: overdue.length,
      linksSentCount: linksSent.length,
    };
  }, [payments]);

  const highValuePayments = useMemo(
    () =>
      payments
        .filter(
          (p) =>
            (p.status === "PENDING" || p.status === "PARTIAL") &&
            p.amount - p.paidAmount >= 200000,
        )
        .slice(0, 4),
    [payments],
  );

  const handleSendLink = (payment: CePayment) => {
    sendPaymentLink(payment.id);
    notify.success("Payment link sent", `Sent to ${payment.customerName}`);
  };

  const handleCopyLink = async (payment: CePayment) => {
    const link = copyPaymentLink(payment.id);
    await navigator.clipboard.writeText(link);
    notify.success("Link copied to clipboard");
  };

  const handleMarkPaid = () => {
    if (!confirmPaidId) return;
    markPaymentPaid(confirmPaidId);
    setConfirmPaidId(null);
    notify.success("Payment marked as received");
  };

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        { label: "Payments" },
      ]}
      title="Payment Follow-up Dashboard"
      subtitle="Track, nudge, and verify pending customer payments in real-time."
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="size-4" />
            Export
          </Button>
          <Button>
            <Plus className="size-4" />
            Create Payment Link
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CeMetricCard
          label="Total Pending"
          value={formatCurrency(stats.pendingAmount)}
          subtext={`${stats.pendingCount} Active Orders`}
          isLoading={isLoading}
        />
        <CeMetricCard
          label="Paid Today"
          value={formatCurrency(stats.paidTodayAmount)}
          subtext={`${stats.paidTodayCount} Orders Verified`}
          isLoading={isLoading}
        />
        <CeMetricCard
          label="Overdue"
          value={formatCurrency(stats.overdueAmount)}
          subtext={`${stats.overdueCount} Critical`}
          isLoading={isLoading}
          valueVariant="warning"
        />
        <CeMetricCard
          label="Links Sent"
          value={stats.linksSentCount}
          subtext="Payment links active"
          isLoading={isLoading}
        />
      </div>

      <CeSearchFilter
        sticky
        search={draftFilters.search}
        onSearchChange={(v) => setDraftFilters((f) => ({ ...f, search: v }))}
        searchPlaceholder="Search customer, order ID, or mobile..."
        filters={[
          {
            key: "status",
            label: "Status",
            value: draftFilters.status,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                status: v as CePaymentFilters["status"],
              })),
            options: [
              { label: "All Status", value: "ALL" },
              { label: "Pending", value: "PENDING" },
              { label: "Paid", value: "PAID" },
              { label: "Partial", value: "PARTIAL" },
              { label: "Expired", value: "EXPIRED" },
            ],
          },
          {
            key: "link",
            label: "Link Status",
            value: draftFilters.linkStatus,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                linkStatus: v as CePaymentFilters["linkStatus"],
              })),
            options: [
              { label: "All Links", value: "ALL" },
              { label: "Not Sent", value: "NOT_SENT" },
              { label: "Sent", value: "SENT" },
              { label: "Expired", value: "EXPIRED" },
            ],
          },
          {
            key: "date",
            label: "Date Range",
            value: draftFilters.dateRange,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                dateRange: v as CePaymentFilters["dateRange"],
              })),
            options: [
              { label: "Last 7 Days", value: "7d" },
              { label: "Last 30 Days", value: "30d" },
              { label: "Last 90 Days", value: "90d" },
              { label: "All Time", value: "ALL" },
            ],
          },
        ]}
        onClear={() => {
          setDraftFilters(EMPTY_PAYMENT_FILTERS);
          setAppliedFilters(EMPTY_PAYMENT_FILTERS);
          setCurrentPage(1);
        }}
      />

      <Button
        size="sm"
        onClick={() => {
          setAppliedFilters(draftFilters);
          setCurrentPage(1);
        }}
      >
        Apply Filters
      </Button>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading ? (
            <CeTableSkeleton columns={7} />
          ) : queryResult.items.length === 0 ? (
            <EmptyState title="No payments found" />
          ) : (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold">Pending Payments Queue</h2>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  LIVE: {stats.pendingCount} TASKS
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-orange-50/50">
                    <TableHead>Customer</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Link Status</TableHead>
                    <TableHead>Reminders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queryResult.items.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CeCustomerAvatar
                            name={payment.customerName}
                            id={payment.customerId}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">
                              {payment.customerName}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {payment.customerPhone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        #{payment.orderNumber}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.amount - payment.paidAmount)}
                      </TableCell>
                      <TableCell>
                        <CeStatusBadge status={payment.linkStatus} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                            payment.reminderCount >= 3
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {payment.reminderCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <CeStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleSendLink(payment)}
                            >
                              <Send className="text-primary size-4" />
                              Send Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyLink(payment)}
                            >
                              <Copy className="size-4" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                notify.info("Calling", payment.customerPhone)
                              }
                            >
                              <Phone className="size-4" />
                              Call Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                notify.info("WhatsApp", payment.customerName)
                              }
                            >
                              <MessageCircle className="size-4" />
                              WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmPaidId(payment.id)}
                            >
                              <Check className="size-4 text-blue-600" />
                              Mark Received
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={queryResult.page}
                totalPages={queryResult.totalPages}
                pageSize={CE_PAGE_SIZE}
                totalItems={queryResult.total}
                onPageChange={setCurrentPage}
                itemLabel="payments"
              />
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">High-Value Recovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highValuePayments.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-gray-100 p-3"
                >
                  <p className="text-primary text-xs font-medium">
                    #{p.orderNumber}
                  </p>
                  <p className="font-medium">{p.customerName}</p>
                  <p className="text-sm font-bold">
                    {formatCurrency(p.amount - p.paidAmount)}
                  </p>
                  {new Date(p.dueDate) < new Date() && (
                    <p className="mt-1 text-xs text-red-600">
                      Critical: Overdue
                    </p>
                  )}
                </div>
              ))}
              <Link
                href="#"
                className="text-primary text-sm font-medium hover:underline"
              >
                View All Critical
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary text-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium">💡 Pro-Tip</p>
              <p className="mt-2 text-sm opacity-90">
                Sending reminders between 10 AM and 11 AM increases payment
                conversion by 40% for corporate clients.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CeConfirmationDialog
        open={!!confirmPaidId}
        onOpenChange={(open) => !open && setConfirmPaidId(null)}
        title="Mark Payment Received"
        description="Confirm that you have verified this payment has been received from the customer."
        confirmLabel="Mark as Paid"
        onConfirm={handleMarkPaid}
      />
    </CePageShell>
  );
}
