"use client";

import { Clock, Map, MoreVertical, Plus, Truck, Users } from "lucide-react";
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
  EMPTY_DISPATCH_FILTERS,
  formatLogisticsDateTime,
  getDispatchStats,
  LOGISTICS_PAGE_SIZE,
  LOGISTICS_WAREHOUSES,
  queryDispatches,
} from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type { DispatchFilters, DispatchRecord } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

export function RouteDispatchPage() {
  const { isLoading } = useLogisticsLoading();
  const dispatches = useLogisticsStore((s) => s.dispatches);
  const generateDispatch = useLogisticsStore((s) => s.generateDispatch);

  const [filters, setFilters] = useState<DispatchFilters>(
    EMPTY_DISPATCH_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState("");

  const stats = useMemo(() => getDispatchStats(dispatches), [dispatches]);

  const kpiCards = useMemo<LogisticsMetricCardData[]>(
    () => [
      {
        id: "pending",
        label: "Pending Dispatches",
        value: String(stats.pending),
        variant: "warning",
        icon: Clock,
      },
      {
        id: "today",
        label: "Today's Dispatches",
        value: String(stats.todaysDispatches),
        icon: Truck,
      },
      {
        id: "drivers",
        label: "Drivers Waiting",
        value: String(stats.driversWaiting),
        icon: Users,
      },
      {
        id: "vehicles",
        label: "Vehicles Waiting",
        value: String(stats.vehiclesWaiting),
        icon: Truck,
      },
    ],
    [stats],
  );

  const queryResult = useMemo(
    () =>
      queryDispatches(dispatches, currentPage, LOGISTICS_PAGE_SIZE, filters),
    [dispatches, currentPage, filters],
  );

  const filterConfigs = [
    {
      label: "Status",
      value: filters.status,
      onChange: (v: string) => setFilters((f) => ({ ...f, status: v })),
      options: [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "assigned", label: "Assigned" },
        { value: "dispatched", label: "Dispatched" },
        { value: "in_transit", label: "In Transit" },
        { value: "completed", label: "Completed" },
      ],
    },
    {
      label: "Source",
      value: filters.source,
      onChange: (v: string) => setFilters((f) => ({ ...f, source: v })),
      options: [
        { value: "all", label: "All Sources" },
        ...LOGISTICS_WAREHOUSES.map((w) => ({ value: w, label: w })),
      ],
    },
  ];

  const handleGenerateDispatch = () => {
    const newDispatch: DispatchRecord = {
      id: `dp-${Date.now()}`,
      dispatchId: `DSP-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      source: LOGISTICS_WAREHOUSES[0]!,
      destination: "South Delhi Hub",
      vehicleId: null,
      vehicleNumber: null,
      driverId: null,
      driverName: null,
      route: "Gurgaon CW → NH-48 → South Delhi",
      eta: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    generateDispatch(newDispatch);
    notify.success(
      "Dispatch Generated",
      `${newDispatch.dispatchId} created successfully.`,
    );
  };

  const handleAction = (action: string, item: DispatchRecord) => {
    if (action === "assign-vehicle") {
      setAssignTargetId(item.dispatchId);
      setAssignVehicleOpen(true);
    } else if (action === "assign-driver") {
      setAssignTargetId(item.dispatchId);
      setAssignDriverOpen(true);
    } else if (action === "view-route") {
      notify.info("View Route", `Route: ${item.route}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <Button onClick={handleGenerateDispatch}>
          <Plus className="mr-2 size-4" />
          Generate Dispatch
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((stat) => (
          <LogisticsMetricCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
          />
        ))}
      </div>

      <LogisticsFilterBar
        searchPlaceholder="Dispatch ID, source, destination..."
        searchValue={filters.search}
        onSearchChange={(v) => {
          setFilters((f) => ({ ...f, search: v }));
          setCurrentPage(1);
        }}
        filters={filterConfigs}
        onReset={() => {
          setFilters(EMPTY_DISPATCH_FILTERS);
          setCurrentPage(1);
        }}
      />

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : queryResult.data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Dispatches"
              description="Generate a dispatch to get started."
              icon={<Map className="size-8" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8F9FB] hover:bg-[#F8F9FB]">
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Dispatch ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Source
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Destination
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Driver
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Route
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    ETA
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
                      {item.dispatchId}
                    </TableCell>
                    <TableCell className="max-w-[130px] truncate text-sm text-[#64748B]">
                      {item.source}
                    </TableCell>
                    <TableCell className="max-w-[130px] truncate text-sm text-[#64748B]">
                      {item.destination}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.vehicleNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.driverName ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm text-[#64748B]">
                      {item.route}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {formatLogisticsDateTime(item.eta)}
                    </TableCell>
                    <TableCell>
                      <LogisticsStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
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
                            onClick={() => handleAction("assign-vehicle", item)}
                          >
                            Assign Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("assign-driver", item)}
                          >
                            Assign Driver
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("view-route", item)}
                          >
                            View Route
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

        {!isLoading && queryResult.meta.total > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={queryResult.meta.totalPages}
            pageSize={LOGISTICS_PAGE_SIZE}
            totalItems={queryResult.meta.total}
            onPageChange={setCurrentPage}
            itemLabel="dispatches"
          />
        ) : null}
      </div>

      <AssignVehicleDialog
        open={assignVehicleOpen}
        onOpenChange={setAssignVehicleOpen}
        targetId={assignTargetId}
        targetType="dispatch"
      />
      <AssignDriverDialog
        open={assignDriverOpen}
        onOpenChange={setAssignDriverOpen}
        targetId={assignTargetId}
        targetType="dispatch"
      />
    </div>
  );
}
