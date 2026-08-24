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
import { useRouter } from "next/navigation";

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
import { AssignDriverDialog } from "@/features/logistics/components/AssignDriverDialog";
import { AssignVehicleDialog } from "@/features/logistics/components/AssignVehicleDialog";
import { LogisticsFilterBar } from "@/features/logistics/components/LogisticsFilterBar";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import {
  useCustomerLogistics,
  useLogisticsFilters,
} from "@/features/logistics/hooks/use-logistics";
import {
  EMPTY_CUSTOMER_FILTERS,
  formatLogisticsDateTime,
  LOGISTICS_PAGE_SIZE,
} from "@/features/logistics/utils/logistics-formatters";
import type {
  CustomerDelivery,
  CustomerDeliveryFilters,
} from "@/types/logistics.types";

export function CustomerLogisticsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CustomerDeliveryFilters>(
    EMPTY_CUSTOMER_FILTERS as CustomerDeliveryFilters,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState("");
  const [assignTargetLabel, setAssignTargetLabel] = useState("");
  const [assignDriverId, setAssignDriverId] = useState<string | null>(null);
  const [assignVehicleId, setAssignVehicleId] = useState<string | null>(null);

  const { data: filterOptions } = useLogisticsFilters();

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      hubId: filters.hub !== "all" ? filters.hub : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      page: currentPage,
      limit: LOGISTICS_PAGE_SIZE,
    }),
    [filters, currentPage],
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useCustomerLogistics(queryParams);

  const stats = data?.stats ?? {
    ordersReady: 0,
    outForDelivery: 0,
    delivered: 0,
    failed: 0,
    returned: 0,
  };

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

  const filterConfigs = [
    {
      label: "Hub",
      value: filters.hub,
      onChange: (v: string) => setFilters((f) => ({ ...f, hub: v })),
      options: [
        { value: "all", label: "All Hubs" },
        ...(filterOptions?.hubs ?? []).map((h) => ({
          value: h.id,
          label: h.name,
        })),
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

  const openAssign = (
    item: CustomerDelivery,
    type: "vehicle" | "driver",
  ) => {
    setAssignTargetId(item.id);
    setAssignTargetLabel(item.orderId);
    setAssignDriverId(item.driverId);
    setAssignVehicleId(item.vehicleId);
    if (type === "vehicle") setAssignVehicleOpen(true);
    else setAssignDriverOpen(true);
  };

  const handleAction = (action: string, item: CustomerDelivery) => {
    if (action === "assign-vehicle" || action === "change-vehicle") {
      openAssign(item, "vehicle");
    } else if (action === "assign-driver") {
      openAssign(item, "driver");
    } else if (action === "track" || action === "view") {
      router.push(
        `${ROUTES.LOGISTICS}/tracking?id=${encodeURIComponent(item.orderId)}`,
      );
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-white p-10 text-center">
        <p className="text-sm font-medium">Unable to load customer deliveries.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          Retry
        </Button>
      </div>
    );
  }

  const rows = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: LOGISTICS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
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
          setFilters(EMPTY_CUSTOMER_FILTERS as CustomerDeliveryFilters);
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
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No customer deliveries found."
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
                {rows.map((item) => (
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
                          <DropdownMenuTrigger
                            render={
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                className="size-8"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
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

        {!isLoading && meta.total > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            pageSize={LOGISTICS_PAGE_SIZE}
            totalItems={meta.total}
            onPageChange={setCurrentPage}
            itemLabel="orders"
          />
        ) : null}
      </div>

      <AssignVehicleDialog
        open={assignVehicleOpen}
        onOpenChange={setAssignVehicleOpen}
        targetId={assignTargetId}
        targetLabel={assignTargetLabel}
        targetType="customer"
        driverId={assignDriverId}
        onAssigned={() => void refetch()}
      />
      <AssignDriverDialog
        open={assignDriverOpen}
        onOpenChange={setAssignDriverOpen}
        targetId={assignTargetId}
        targetLabel={assignTargetLabel}
        targetType="customer"
        vehicleId={assignVehicleId}
        onAssigned={() => void refetch()}
      />
    </div>
  );
}
