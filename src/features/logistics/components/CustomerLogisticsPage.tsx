"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  MoreVertical,
  Package,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

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
import { AssignDriverDialog } from "@/features/logistics/components/AssignDriverDialog";
import { AssignVehicleDialog } from "@/features/logistics/components/AssignVehicleDialog";
import { LogisticsFilterBar } from "@/features/logistics/components/LogisticsFilterBar";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { useLogisticsLoading } from "@/features/logistics/hooks/use-logistics-loading";
import {
  EMPTY_CUSTOMER_FILTERS,
  formatLogisticsDateTime,
  getCustomerStats,
  LOGISTICS_HUBS,
  LOGISTICS_PAGE_SIZE,
  queryCustomerDeliveries,
} from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type {
  CustomerDelivery,
  CustomerDeliveryFilters,
} from "@/types/logistics.types";
import { notify } from "@/utils/notify";

export function CustomerLogisticsPage() {
  const { isLoading } = useLogisticsLoading();
  const customerDeliveries = useLogisticsStore((s) => s.customerDeliveries);
  const [filters, setFilters] = useState<CustomerDeliveryFilters>(
    EMPTY_CUSTOMER_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState("");

  const stats = useMemo(
    () => getCustomerStats(customerDeliveries),
    [customerDeliveries],
  );

  const kpiCards = useMemo<LogisticsMetricCardData[]>(
    () => [
      {
        id: "orders-ready",
        label: "Orders Ready",
        value: String(stats.ordersReady),
        icon: Package,
      },
      {
        id: "ofd",
        label: "Out For Delivery",
        value: String(stats.outForDelivery),
        variant: "warning",
        icon: Truck,
      },
      {
        id: "delivered",
        label: "Delivered",
        value: String(stats.delivered),
        variant: "success",
        icon: CheckCircle2,
      },
      {
        id: "failed",
        label: "Failed",
        value: String(stats.failed),
        variant: "critical",
        icon: AlertTriangle,
      },
      {
        id: "returned",
        label: "Returned",
        value: String(stats.returned),
        icon: Package,
      },
    ],
    [stats],
  );

  const queryResult = useMemo(
    () =>
      queryCustomerDeliveries(
        customerDeliveries,
        currentPage,
        LOGISTICS_PAGE_SIZE,
        filters,
      ),
    [customerDeliveries, currentPage, filters],
  );

  const filterConfigs = [
    {
      label: "Hub",
      value: filters.hub,
      onChange: (v: string) => setFilters((f) => ({ ...f, hub: v })),
      options: [
        { value: "all", label: "All Hubs" },
        ...LOGISTICS_HUBS.map((h) => ({ value: h, label: h })),
      ],
    },
    {
      label: "Status",
      value: filters.status,
      onChange: (v: string) => setFilters((f) => ({ ...f, status: v })),
      options: [
        { value: "all", label: "All Statuses" },
        { value: "packed", label: "Packed" },
        { value: "assigned", label: "Assigned" },
        { value: "out_for_delivery", label: "Out For Delivery" },
        { value: "delivered", label: "Delivered" },
        { value: "failed", label: "Failed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "returned", label: "Returned" },
      ],
    },
  ];

  const handleAction = (action: string, item: CustomerDelivery) => {
    if (action === "assign-vehicle" || action === "change-vehicle") {
      setAssignTargetId(item.orderId);
      setAssignVehicleOpen(true);
    } else if (action === "assign-driver") {
      setAssignTargetId(item.orderId);
      setAssignDriverOpen(true);
    } else if (action === "track") {
      notify.info("Tracking Delivery", `Opening tracker for ${item.orderId}`);
    } else if (action === "view") {
      notify.info("Order Details", `${item.orderId} — ${item.customer}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((stat) => (
          <LogisticsMetricCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
          />
        ))}
      </div>

      <LogisticsFilterBar
        searchPlaceholder="Order ID, customer, hub..."
        searchValue={filters.search}
        onSearchChange={(v) => {
          setFilters((f) => ({ ...f, search: v }));
          setCurrentPage(1);
        }}
        filters={filterConfigs}
        onReset={() => {
          setFilters(EMPTY_CUSTOMER_FILTERS);
          setCurrentPage(1);
        }}
      />

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : queryResult.data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Deliveries"
              description="No customer deliveries match your filters."
              icon={<Package className="size-8" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8F9FB] hover:bg-[#F8F9FB]">
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Order ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Hub
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Driver
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Delivery ETA
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-gray-400 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResult.data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      {item.orderId}
                    </TableCell>
                    <TableCell className="text-sm">{item.customer}</TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm text-[#64748B]">
                      {item.hub}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.vehicleNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.driverName ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {formatLogisticsDateTime(item.deliveryEta)}
                    </TableCell>
                    <TableCell>
                      <LogisticsStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="size-8"
                          onClick={() => handleAction("view", item)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="size-8"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleAction("view", item)}
                            >
                              View Order
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("track", item)}
                            >
                              Track Delivery
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("assign-driver", item)
                              }
                            >
                              Assign Driver
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("change-vehicle", item)
                              }
                            >
                              Change Vehicle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && queryResult.meta.total > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={queryResult.meta.totalPages}
            pageSize={LOGISTICS_PAGE_SIZE}
            totalItems={queryResult.meta.total}
            onPageChange={setCurrentPage}
            itemLabel="orders"
          />
        ) : null}
      </div>

      <AssignVehicleDialog
        open={assignVehicleOpen}
        onOpenChange={setAssignVehicleOpen}
        targetId={assignTargetId}
        targetType="customer"
      />
      <AssignDriverDialog
        open={assignDriverOpen}
        onOpenChange={setAssignDriverOpen}
        targetId={assignTargetId}
        targetType="customer"
      />
    </div>
  );
}
