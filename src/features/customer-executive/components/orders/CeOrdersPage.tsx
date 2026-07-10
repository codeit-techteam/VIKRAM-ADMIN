"use client";

import {
  Eye,
  MessageSquareWarning,
  MoreHorizontal,
  Plus,
  Truck,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  CE_ORDERS_IN_TRANSIT_STATUSES,
  ORDERS_IN_TRANSIT_STATUS_GROUP,
} from "@/constants/orders.constants";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
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
import { NAV_FILTER_PRESETS } from "@/constants/navigation-filters";
import { CeMetricCard } from "@/features/customer-executive/components/shared/CeMetricCard";
import { CePageShell } from "@/features/customer-executive/components/shared/CePageShell";
import { CeSearchFilter } from "@/features/customer-executive/components/shared/CeSearchFilter";
import { CeStatusBadge } from "@/features/customer-executive/components/shared/CeStatusBadge";
import { CeTableSkeleton } from "@/features/customer-executive/components/shared/CeTableSkeleton";
import { HighlightText } from "@/features/customer-executive/utils/highlight";
import { useCeLoading } from "@/features/customer-executive/hooks/use-ce-loading";
import {
  CE_PAGE_SIZE,
  EMPTY_ORDER_FILTERS,
  type CeOrderFilters,
} from "@/features/customer-executive/types";
import { useCustomerExecutiveStore } from "@/store/customer-executive-store";
import { formatCurrency } from "@/utils/format-currency";
import { notify } from "@/utils/notify";

export function CeOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading } = useCeLoading();
  const queryOrders = useCustomerExecutiveStore((s) => s.queryOrders);
  const orders = useCustomerExecutiveStore((s) => s.orders);

  const [draftFilters, setDraftFilters] =
    useState<CeOrderFilters>(EMPTY_ORDER_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<CeOrderFilters>(EMPTY_ORDER_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const orderParam = searchParams.get("order");
    const statusParam = searchParams.get("status");
    const statusGroupParam = searchParams.get("statusGroup");
    const sourceParam = searchParams.get("orderSource");

    if (orderParam || statusParam || statusGroupParam || sourceParam) {
      const filters: CeOrderFilters = {
        ...EMPTY_ORDER_FILTERS,
        ...(orderParam ? { search: orderParam } : {}),
        ...(statusParam
          ? { status: statusParam.toUpperCase() as CeOrderFilters["status"] }
          : {}),
        ...(statusGroupParam?.toUpperCase() === ORDERS_IN_TRANSIT_STATUS_GROUP
          ? { statusGroup: ORDERS_IN_TRANSIT_STATUS_GROUP }
          : {}),
        ...(sourceParam
          ? {
              orderSource:
                sourceParam.toUpperCase() as CeOrderFilters["orderSource"],
            }
          : {}),
      };
      setDraftFilters(filters);
      setAppliedFilters(filters);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const queryResult = useMemo(
    () =>
      queryOrders({
        page: currentPage,
        limit: CE_PAGE_SIZE,
        filters: appliedFilters,
      }),
    [queryOrders, currentPage, appliedFilters, orders],
  );

  const stats = useMemo(
    () => ({
      active: orders.filter((o) => o.status === "ACTIVE").length,
      inTransit: orders.filter((o) =>
        CE_ORDERS_IN_TRANSIT_STATUSES.includes(o.status),
      ).length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    }),
    [orders],
  );

  return (
    <CePageShell
      breadcrumbs={[
        { label: "Customer Executive", href: ROUTES.CUSTOMER_EXECUTIVE },
        { label: "Orders" },
      ]}
      title="Active Orders"
      subtitle="Manage and track ongoing procurement cycles for B2B clients."
      actions={
        <Button
          render={<Link href={`${ROUTES.CUSTOMER_EXECUTIVE}/orders/new`} />}
        >
          <Plus className="size-4" />
          Create Order
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CeMetricCard
          label="Active Orders"
          value={stats.active}
          isLoading={isLoading}
          href={NAV_FILTER_PRESETS.ordersByStatus("ACTIVE")}
        />
        <CeMetricCard
          label="In Transit"
          value={stats.inTransit}
          isLoading={isLoading}
          href={NAV_FILTER_PRESETS.ordersInTransit()}
        />
        <CeMetricCard
          label="Delivered"
          value={stats.delivered}
          isLoading={isLoading}
          href={NAV_FILTER_PRESETS.ordersByStatus("DELIVERED")}
        />
        <CeMetricCard
          label="Cancelled"
          value={stats.cancelled}
          isLoading={isLoading}
        />
      </div>

      <CeSearchFilter
        sticky
        search={draftFilters.search}
        onSearchChange={(v) => setDraftFilters((f) => ({ ...f, search: v }))}
        searchPlaceholder="Search orders, customers..."
        filters={[
          {
            key: "status",
            label: "Status",
            value: draftFilters.status,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                status: v as CeOrderFilters["status"],
                statusGroup: "ALL",
              })),
            options: [
              { label: "All Status", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "In Transit", value: "IN_TRANSIT" },
              { label: "Delivered", value: "DELIVERED" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Hub Processing", value: "HUB_PROCESSING" },
            ],
          },
          {
            key: "source",
            label: "Source",
            value: draftFilters.orderSource,
            onChange: (v) =>
              setDraftFilters((f) => ({
                ...f,
                orderSource: v as CeOrderFilters["orderSource"],
              })),
            options: [
              { label: "All Sources", value: "ALL" },
              { label: "App", value: "APP" },
              { label: "Executive", value: "EXECUTIVE" },
            ],
          },
        ]}
        onClear={() => {
          setDraftFilters(EMPTY_ORDER_FILTERS);
          setAppliedFilters(EMPTY_ORDER_FILTERS);
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

      {isLoading ? (
        <CeTableSkeleton columns={7} />
      ) : queryResult.items.length === 0 ? (
        <EmptyState title="No orders found" />
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-orange-50/50 hover:bg-orange-50/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryResult.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-primary font-medium">
                    #
                    <HighlightText
                      text={order.orderNumber}
                      query={appliedFilters.search}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{order.company}</p>
                    <p className="text-xs text-[#64748B]">
                      <HighlightText
                        text={order.customerName}
                        query={appliedFilters.search}
                      />
                    </p>
                  </TableCell>
                  <TableCell>{formatCurrency(order.amount)}</TableCell>
                  <TableCell>
                    <CeStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <CeStatusBadge status={order.orderSource} />
                  </TableCell>
                  <TableCell className="text-sm text-[#64748B]">
                    {order.eta ?? "—"}
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
                              `${ROUTES.CUSTOMER_EXECUTIVE}/tracking?order=${order.orderNumber}`,
                            )
                          }
                        >
                          <Eye className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `${ROUTES.CUSTOMER_EXECUTIVE}/tracking?order=${order.orderNumber}`,
                            )
                          }
                        >
                          <Truck className="size-4" />
                          Track
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `${ROUTES.CUSTOMER_EXECUTIVE}/payments?order=${order.orderNumber}`,
                            )
                          }
                        >
                          <CreditCard className="size-4" />
                          Payment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `${ROUTES.CUSTOMER_EXECUTIVE}/complaints?order=${order.orderNumber}`,
                            )
                          }
                        >
                          <MessageSquareWarning className="size-4" />
                          Complaint
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
            itemLabel="orders"
          />
        </div>
      )}

      <Button
        size="icon-lg"
        className="fixed right-6 bottom-6 size-14 rounded-full shadow-lg"
        render={<Link href={`${ROUTES.CUSTOMER_EXECUTIVE}/orders/new`} />}
      >
        <Plus className="size-6" />
      </Button>
    </CePageShell>
  );
}
