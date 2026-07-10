"use client";

import {
  Clock,
  MessageSquareWarning,
  UserPlus,
  Users,
  Wallet,
  ShoppingCart,
  CreditCard,
  Truck,
  Phone,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { QuickActionCard } from "@/components/shared/QuickActionCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { CeMetricCard } from "@/features/customer-executive/components/shared/CeMetricCard";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { CeTableSkeleton } from "@/features/customer-executive/components/shared/CeTableSkeleton";
import { CeTimeline } from "@/features/customer-executive/components/shared/CeTimeline";
import { useCeLoading } from "@/features/customer-executive/hooks/use-ce-loading";
import { CE_PAGE_SIZE } from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";
import {
  initiateCall,
  openWhatsApp,
} from "@/features/customer-executive/utils/communication";
import { MoreHorizontal, Eye } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CePayment } from "@/features/customer-executive/types";

export function CeDashboardPage() {
  const router = useRouter();
  const { isLoading } = useCeLoading();
  const getDashboardStats = useCustomerExecutiveStore(
    (s) => s.getDashboardStats,
  );
  const queryOrders = useCustomerExecutiveStore((s) => s.queryOrders);
  const getRecentActivities = useCustomerExecutiveStore(
    (s) => s.getRecentActivities,
  );
  const getPendingPayments = useCustomerExecutiveStore(
    (s) => s.getPendingPayments,
  );
  const sendPaymentLink = useCustomerExecutiveStore((s) => s.sendPaymentLink);
  const copyPaymentLink = useCustomerExecutiveStore((s) => s.copyPaymentLink);
  const currentExecutive = useCustomerExecutiveStore((s) => s.currentExecutive);

  const [orderPage, setOrderPage] = useState(1);
  const [paymentDrawer, setPaymentDrawer] = useState<CePayment | null>(null);

  const stats = getDashboardStats();
  const recentOrders = useMemo(
    () =>
      queryOrders({
        page: orderPage,
        limit: CE_PAGE_SIZE,
        filters: { search: "", status: "ALL", orderSource: "ALL" },
      }),
    [queryOrders, orderPage],
  );
  const activities = getRecentActivities(8);
  const pendingPayments = getPendingPayments(5);

  const handleSendLink = (payment: CePayment) => {
    sendPaymentLink(payment.id);
    notify.success("Payment link sent", `Link sent to ${payment.customerName}`);
  };

  const handleCopyLink = async (payment: CePayment) => {
    const link = copyPaymentLink(payment.id);
    await navigator.clipboard.writeText(link);
    notify.success("Link copied to clipboard");
  };

  const handleCall = (phone: string, name?: string) => {
    initiateCall(phone, name);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    openWhatsApp(
      phone,
      `Hi ${name}, this is ${currentExecutive?.name ?? "your executive"} from BuildQuick India.`,
      name,
    );
  };

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        { label: "Dashboard" },
      ]}
      title="Service Dashboard"
      subtitle="Welcome back! Here's your daily operations overview."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            render={
              <Link href={`${ROUTES.CUSTOMER_EXECUTIVE}/customers/new`} />
            }
          >
            <UserPlus className="size-4" />
            Register Customer
          </Button>
          <Button
            variant="secondary"
            render={<Link href={`${ROUTES.CUSTOMER_EXECUTIVE}/orders/new`} />}
          >
            <ShoppingCart className="size-4" />
            Place Order
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <CeTableSkeleton columns={4} rows={1} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CeMetricCard
            index={0}
            label="Assigned Customers"
            value={stats.assignedCustomers}
            subtext="Under your portfolio"
            icon={Users}
            iconContainerClassName="bg-orange-50"
            iconClassName="text-primary"
            href={`${ROUTES.CUSTOMER_EXECUTIVE}/customers`}
          />
          <CeMetricCard
            index={1}
            label="Open Complaints"
            value={stats.openComplaints}
            subtext="Needs attention"
            icon={MessageSquareWarning}
            iconContainerClassName="bg-red-50"
            iconClassName="text-red-500"
            valueVariant="warning"
            href={`${ROUTES.CUSTOMER_EXECUTIVE}/complaints`}
          />
          <CeMetricCard
            index={2}
            label="Pending Payments"
            value={stats.pendingPayments}
            subtext={formatCurrency(stats.pendingPaymentsAmount)}
            icon={Wallet}
            iconContainerClassName="bg-amber-50"
            iconClassName="text-amber-600"
            href={`${ROUTES.CUSTOMER_EXECUTIVE}/payments`}
          />
          <CeMetricCard
            index={3}
            label="Avg Resolution Time"
            value={`${stats.avgResolutionHours}h`}
            subtext="Complaint resolution"
            icon={Clock}
            iconContainerClassName="bg-blue-50"
            iconClassName="text-blue-600"
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Recent Orders
              </h2>
              <Link
                href={`${ROUTES.CUSTOMER_EXECUTIVE}/orders`}
                className="text-primary text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>

            {isLoading ? (
              <CeTableSkeleton columns={6} rows={5} />
            ) : recentOrders.items.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="Orders placed by your customers will appear here."
                className="m-4 border-none bg-transparent"
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-50/50 hover:bg-orange-50/50">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.items.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="text-primary font-medium">
                            #{order.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-[#64748B]">
                              {order.company}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(order.amount)}</TableCell>
                        <TableCell>
                          <CeStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <CeStatusBadge status={order.orderSource} />
                        </TableCell>
                        <TableCell className="text-sm text-[#64748B]">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                          )}
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
                                onClick={() =>
                                  router.push(
                                    `${ROUTES.CUSTOMER_EXECUTIVE}/orders?order=${order.id}`,
                                  )
                                }
                              >
                                <Eye className="size-4" />
                                View
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  currentPage={recentOrders.page}
                  totalPages={recentOrders.totalPages}
                  pageSize={CE_PAGE_SIZE}
                  totalItems={recentOrders.total}
                  onPageChange={setOrderPage}
                  itemLabel="orders"
                />
              </>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#1A1A1A]">
              Live Activity
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded bg-gray-100"
                  />
                ))}
              </div>
            ) : (
              <CeTimeline activities={activities} maxItems={6} />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Pending Payments
              </h2>
            </div>
            {isLoading ? (
              <CeTableSkeleton columns={4} rows={3} />
            ) : pendingPayments.length === 0 ? (
              <EmptyState
                title="All caught up!"
                description="No pending payments at the moment."
                className="m-4 border-none bg-transparent"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-orange-50/50 hover:bg-orange-50/50">
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reminders</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <p className="font-medium">{payment.customerName}</p>
                        <p className="text-xs text-[#64748B]">
                          {payment.orderNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.amount - payment.paidAmount)}
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
                        <div className="flex gap-1">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleSendLink(payment)}
                          >
                            <Send className="size-3" />
                            Link
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setPaymentDrawer(payment)}
                          >
                            <Eye className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#1A1A1A]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              label="Register Customer"
              icon={UserPlus}
              circleColor="orange"
              onClick={() =>
                router.push(`${ROUTES.CUSTOMER_EXECUTIVE}/customers/new`)
              }
            />
            <QuickActionCard
              label="Create Order"
              icon={ShoppingCart}
              circleColor="blue"
              onClick={() =>
                router.push(`${ROUTES.CUSTOMER_EXECUTIVE}/orders/new`)
              }
            />
            <QuickActionCard
              label="Send Payment Link"
              icon={CreditCard}
              circleColor="indigo"
              onClick={() =>
                router.push(`${ROUTES.CUSTOMER_EXECUTIVE}/payments`)
              }
            />
            <QuickActionCard
              label="Track Shipment"
              icon={Truck}
              circleColor="green"
              onClick={() =>
                router.push(`${ROUTES.CUSTOMER_EXECUTIVE}/tracking`)
              }
            />
          </div>
        </div>
      </div>

      <Sheet
        open={!!paymentDrawer}
        onOpenChange={(open) => !open && setPaymentDrawer(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Payment Details</SheetTitle>
          </SheetHeader>
          {paymentDrawer && (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-[#64748B]">Customer</p>
                <p className="font-medium">{paymentDrawer.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Order</p>
                <p className="text-primary font-medium">
                  #{paymentDrawer.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Amount Due</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    paymentDrawer.amount - paymentDrawer.paidAmount,
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={() => handleSendLink(paymentDrawer)}>
                  <Send className="size-4" />
                  Send Payment Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(paymentDrawer)}
                >
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleCall(
                      paymentDrawer.customerPhone,
                      paymentDrawer.customerName,
                    )
                  }
                >
                  <Phone className="size-4" />
                  Call Customer
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleWhatsApp(
                      paymentDrawer.customerPhone,
                      paymentDrawer.customerName,
                    )
                  }
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </CePageShell>
  );
}
