"use client";

import {
  Ban,
  Calendar,
  CheckCircle2,
  Headphones,
  KeyRound,
  MapPin,
  Package,
  Pencil,
  Phone,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { CustomerSummaryCard } from "@/features/user-management/components/CustomerSummaryCard";
import { ExecutiveStatusBadge } from "@/features/user-management/components/customer-executive/ExecutiveStatusBadge";
import { OrderSourceBadge } from "@/features/user-management/components/OrderSourceBadge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExecutiveAssignedCustomerRow } from "@/features/user-management/types/support-executive.types";
import { ROUTES } from "@/constants/routes";
import { useCustomerStore } from "@/store/customer-store";
import { formatDate } from "@/utils/format-date";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface ExecutiveProfileContentProps {
  executiveId: string;
}

const CUSTOMER_PAGE_SIZE = 5;

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
  PROCESSING: "bg-blue-50 text-blue-700 border border-blue-100",
  DISPATCHED: "bg-sky-50 text-sky-700 border border-sky-100",
  OUT_FOR_DELIVERY: "bg-violet-50 text-violet-700 border border-violet-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 border border-red-100",
};

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-72" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

function CustomerStatusDot({
  status,
}: {
  status: ExecutiveAssignedCustomerRow["status"];
}) {
  const styles = {
    ACTIVE: "bg-emerald-500 text-emerald-700",
    NEW_LEAD: "bg-slate-400 text-slate-600",
    INACTIVE: "bg-amber-400 text-amber-700",
  };

  const labels = {
    ACTIVE: "Active",
    NEW_LEAD: "New Lead",
    INACTIVE: "Inactive",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
      <span
        className={cn("size-1.5 rounded-full", styles[status].split(" ")[0])}
      />
      {labels[status]}
    </span>
  );
}

export function ExecutiveProfileContent({
  executiveId,
}: ExecutiveProfileContentProps) {
  const getExecutiveProfile = useCustomerStore(
    (state) => state.getExecutiveProfile,
  );
  const customers = useCustomerStore((state) => state.customers);
  const orders = useCustomerStore((state) => state.orders);
  const supportExecutiveAssignmentHistory = useCustomerStore(
    (state) => state.supportExecutiveAssignmentHistory,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [customerPage, setCustomerPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [executiveId]);

  const executive = useMemo(
    () => getExecutiveProfile(executiveId),
    [
      getExecutiveProfile,
      executiveId,
      customers,
      orders,
      supportExecutiveAssignmentHistory,
    ],
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!executive) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "User Management", href: ROUTES.USER_MANAGEMENT },
            { label: "Customer Executives", href: ROUTES.CUSTOMER_EXECUTIVE },
            { label: "Executive Profile" },
          ]}
        />
        <EmptyState
          title="Executive not found"
          description="The requested executive profile could not be located."
        />
      </div>
    );
  }

  const totalCustomerPages = Math.max(
    1,
    Math.ceil(executive.assignedCustomerRows.length / CUSTOMER_PAGE_SIZE),
  );
  const pagedCustomers = executive.assignedCustomerRows.slice(
    (customerPage - 1) * CUSTOMER_PAGE_SIZE,
    customerPage * CUSTOMER_PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "User Management", href: ROUTES.USER_MANAGEMENT },
          { label: "Customer Executives", href: ROUTES.CUSTOMER_EXECUTIVE },
          { label: "Executive Profile" },
        ]}
      />

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary flex size-16 shrink-0 items-center justify-center rounded-xl text-xl font-bold">
              {executive.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1A1A1A]">
                  {executive.name}
                </h1>
                <Badge
                  variant="outline"
                  className="rounded-full border-pink-200 bg-pink-50 px-2.5 py-0.5 text-[10px] font-semibold text-pink-700 uppercase"
                >
                  {executive.employeeId}
                </Badge>
                <ExecutiveStatusBadge status={executive.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#64748B]">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-4" />
                  {executive.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {executive.hub}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  Joined {formatDate(executive.joiningDate)}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Assigned Region
                </p>
                <p className="mt-1 text-sm font-medium text-[#1A1A1A]">
                  {executive.assignedRegions.join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() =>
                notify.success("Edit", "Executive edit form opened.")
              }
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={() =>
                notify.success(
                  "Assign Customers",
                  "Customer assignment flow opened.",
                )
              }
            >
              <UserPlus className="size-4" />
              Assign Customers
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() =>
                notify.success(
                  "Reset Password",
                  "Temporary password generated.",
                )
              }
            >
              <KeyRound className="size-4" />
              Reset Password
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() =>
                notify.success("Deactivate", "Executive deactivated.")
              }
            >
              <Ban className="size-4" />
              Deactivate
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CustomerSummaryCard
          label="Assigned Customers"
          value={executive.assignedCustomers}
          icon={Users}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
        />
        <CustomerSummaryCard
          label="Today's Calls"
          value={executive.todayCalls}
          icon={Headphones}
          iconContainerClassName="bg-orange-50"
          iconClassName="text-orange-600"
        />
        <CustomerSummaryCard
          label="Today's Orders"
          value={executive.todayOrders}
          icon={Package}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
        />
        <CustomerSummaryCard
          label="Total Assisted Orders"
          value={executive.totalOrders}
          icon={CheckCircle2}
          iconContainerClassName="bg-purple-50"
          iconClassName="text-purple-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#1A1A1A]">
              Recent Orders Created
            </h2>
          </div>
          {executive.recentOrders.length === 0 ? (
            <EmptyState
              title="No Assisted Orders"
              description="This executive has not created any orders yet."
              className="py-10"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase">
                      Order ID
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">
                      Customer
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">Hub</TableHead>
                    <TableHead className="text-[10px] uppercase">
                      Source
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executive.recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-gray-100">
                      <TableCell className="font-medium">
                        #{order.orderId}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="text-[#64748B]">
                        {order.hub}
                      </TableCell>
                      <TableCell>
                        <OrderSourceBadge source={order.orderSource} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            ORDER_STATUS_STYLES[order.status] ??
                              "bg-gray-50 text-gray-600",
                          )}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#1A1A1A]">
            Live Activity
          </h2>
          <ol className="space-y-4">
            {executive.recentOrders.slice(0, 4).map((order, index) => (
              <li key={order.id} className="relative flex gap-3 pb-2">
                {index < Math.min(executive.recentOrders.length, 4) - 1 ? (
                  <span
                    className="absolute top-3 left-[7px] h-full w-px bg-gray-200"
                    aria-hidden
                  />
                ) : null}
                <span className="bg-primary relative z-10 mt-1 size-3.5 shrink-0 rounded-full ring-4 ring-white" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Order Created
                  </p>
                  <p className="text-xs text-[#64748B]">
                    #{order.orderId} · {formatAmount(order.amount)}
                  </p>
                  <time className="text-xs text-gray-400">
                    {formatDate(order.date)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() =>
              notify.success("Weekly Logs", "Activity logs panel opened.")
            }
          >
            View Weekly Logs
          </Button>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1A1A1A]">
              Assigned Customers
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Customers currently assigned to this executive.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                notify.success("Export", "Customer list exported.")
              }
            >
              Export List
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                notify.success("Add New", "Customer assignment opened.")
              }
            >
              Add New
            </Button>
          </div>
        </div>

        {executive.assignedCustomerRows.length === 0 ? (
          <EmptyState
            title="No Assigned Customers"
            description="Assign customers to this executive from the customer list."
            className="py-12"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#FAFAF8] hover:bg-[#FAFAF8]">
                    <TableHead className="text-[10px] uppercase">
                      Customer Name
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">
                      Contact Info
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">
                      City
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">
                      Last Order
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">
                      Assigned Since
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] uppercase">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-gray-100">
                      <TableCell className="font-medium">
                        {customer.customerName}
                      </TableCell>
                      <TableCell className="text-[#64748B]">
                        {customer.phone}
                      </TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell className="text-[#64748B]">
                        {customer.lastOrderDate
                          ? formatDate(customer.lastOrderDate)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-[#64748B]">
                        {formatDate(customer.assignedSince)}
                      </TableCell>
                      <TableCell>
                        <CustomerStatusDot status={customer.status} />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${ROUTES.USER_MANAGEMENT_CUSTOMERS}/${customer.id}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          View Profile
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={customerPage}
              totalPages={totalCustomerPages}
              pageSize={CUSTOMER_PAGE_SIZE}
              totalItems={executive.assignedCustomerRows.length}
              onPageChange={setCustomerPage}
              itemLabel="customers"
            />
          </>
        )}
      </section>
    </div>
  );
}
