"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { ROUTES } from "@/constants/routes";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";

export function FinancePaymentsPage() {
  const router = useRouter();
  const payments = useCustomerExecutiveStore((s) => s.payments);
  const pendingPayments = payments.filter(
    (p) => p.status === "PENDING" || p.status === "PARTIAL",
  );

  const totalPending = pendingPayments.reduce(
    (sum, p) => sum + (p.amount - p.paidAmount),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Payments"
        subtitle="Manage invoices, settlements, GST compliance, and payment reconciliation."
        actions={
          <Button
            onClick={() => router.push(NAV_FILTER_PRESETS.paymentsPending())}
          >
            Review Pending Payments
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="PENDING PAYMENTS"
          value={pendingPayments.length}
          subtext={formatCurrency(totalPending)}
          valueVariant="warning"
          href={NAV_FILTER_PRESETS.paymentsPending()}
        />
        <StatCard
          label="PAID TODAY"
          value={payments.filter((p) => p.status === "PAID").length}
          subtext="Settled transactions"
          href={NAV_FILTER_PRESETS.paymentsByStatus("PAID")}
        />
        <StatCard
          label="CUSTOMER EXECUTIVE"
          value="CE Portal"
          subtext="Payment link management"
          href={ROUTES.CUSTOMER_EXECUTIVE_PAYMENTS}
        />
        <StatCard
          label="APPROVALS"
          value="Queue"
          subtext="Payment approvals pending review"
          href={`${ROUTES.APPROVALS_CENTER}?tab=payments`}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Pending Customer Payments
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingPayments.slice(0, 8).map((payment) => (
              <TableRow
                key={payment.id}
                className="cursor-pointer hover:bg-gray-50/80"
                onClick={() =>
                  router.push(NAV_FILTER_PRESETS.orderDetail(payment.orderId))
                }
              >
                <TableCell className="font-medium">
                  {payment.customerName}
                </TableCell>
                <TableCell>#{payment.orderNumber}</TableCell>
                <TableCell>
                  {formatCurrency(payment.amount - payment.paidAmount)}
                </TableCell>
                <TableCell>{payment.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-gray-100 px-6 py-3">
          <Link
            href={NAV_FILTER_PRESETS.paymentsPending()}
            className="text-primary text-sm font-medium hover:underline"
          >
            View all pending payments →
          </Link>
        </div>
      </div>
    </div>
  );
}
