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
import {
  useDispatchLogistics,
  useLogisticsFilters,
} from "@/features/logistics/hooks/use-logistics";
import {
  EMPTY_DISPATCH_FILTERS,
  formatLogisticsDateTime,
  LOGISTICS_PAGE_SIZE,
} from "@/features/logistics/utils/logistics-formatters";
import type {
  DispatchFilters,
  DispatchRecord,
  DispatchStatus,
} from "@/types/logistics.types";
import { notify } from "@/utils/notify";

type DispatchStatKey = "pending" | "today" | "drivers" | "vehicles";
type AssignTargetType = "warehouse" | "customer";

const STAT_FILTER_MAP: Record<
  DispatchStatKey,
  Pick<DispatchFilters, "status" | "assignment">
> = {
  pending: { status: "pending", assignment: "all" },
  today: { status: "all", assignment: "all" },
  drivers: { status: "all", assignment: "needs_driver" },
  vehicles: { status: "all", assignment: "needs_vehicle" },
};

const ASSIGNABLE_STATUSES: DispatchStatus[] = ["pending", "assigned"];

function getDispatchTargetType(item: DispatchRecord): AssignTargetType {
  if (item.kind === "warehouse" || item.kind === "customer") return item.kind;
  return item.dispatchId.startsWith("TRN-") ? "warehouse" : "customer";
}

function canAssignVehicle(item: DispatchRecord) {
  return ASSIGNABLE_STATUSES.includes(item.status) && !item.vehicleId;
}

function canAssignDriver(item: DispatchRecord) {
  return (
    ASSIGNABLE_STATUSES.includes(item.status) &&
    Boolean(item.vehicleId) &&
    !item.driverId
  );
}

function canReassignVehicle(item: DispatchRecord) {
  return ASSIGNABLE_STATUSES.includes(item.status) && Boolean(item.vehicleId);
}

function canReassignDriver(item: DispatchRecord) {
  return ASSIGNABLE_STATUSES.includes(item.status) && Boolean(item.driverId);
}

export function RouteDispatchPage() {
  const [filters, setFilters] = useState<DispatchFilters>(EMPTY_DISPATCH_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [assignDriverOpen, setAssignDriverOpen] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState("");
  const [assignTargetLabel, setAssignTargetLabel] = useState("");
  const [assignTargetType, setAssignTargetType] =
    useState<AssignTargetType>("warehouse");
  const [assignDriverId, setAssignDriverId] = useState<string | null>(null);
  const [assignVehicleId, setAssignVehicleId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<DispatchStatKey | null>(null);

  const { data: filterOptions } = useLogisticsFilters();

  const queryParams = useMemo(
    () => ({
      search: filters.search || undefined,
      source: filters.source !== "all" ? filters.source : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      assignment:
        filters.assignment !== "all" ? filters.assignment : undefined,
      page: currentPage,
      limit: LOGISTICS_PAGE_SIZE,
    }),
    [filters, currentPage],
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useDispatchLogistics(queryParams);

  const stats = data?.stats ?? {
    pending: 0,
    todaysDispatches: 0,
    driversWaiting: 0,
    vehiclesWaiting: 0,
  };

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

  const handleStatCardClick = (statId: DispatchStatKey) => {
    if (activeCard === statId) {
      setActiveCard(null);
      setFilters(EMPTY_DISPATCH_FILTERS);
      setCurrentPage(1);
      return;
    }

    const next = STAT_FILTER_MAP[statId];
    setActiveCard(statId);
    setFilters((prev) => ({
      ...prev,
      status: next.status,
      assignment: next.assignment,
    }));
    setCurrentPage(1);
  };

  const sourceOptions = useMemo(() => {
    const warehouses = (filterOptions?.warehouses ?? []).map((w) => ({
      value: w.name,
      label: w.name,
    }));
    const hubs = (filterOptions?.hubs ?? []).map((h) => ({
      value: h.name,
      label: h.name,
    }));
    const seen = new Set<string>();
    return [...warehouses, ...hubs].filter((opt) => {
      if (seen.has(opt.value)) return false;
      seen.add(opt.value);
      return true;
    });
  }, [filterOptions]);

  const filterConfigs = [
    {
      label: "Status",
      value: filters.status,
      onChange: (v: string) => {
        setFilters((f) => ({ ...f, status: v, assignment: "all" }));
        setActiveCard(v === "pending" ? "pending" : null);
        setCurrentPage(1);
      },
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
      onChange: (v: string) => {
        setFilters((f) => ({ ...f, source: v }));
        setCurrentPage(1);
      },
      options: [
        { value: "all", label: "All Sources" },
        ...sourceOptions,
      ],
    },
  ];

  const handleGenerateDispatch = () => {
    notify.info(
      "Generate Dispatch",
      "Dispatches are created via warehouse and hub workflows.",
    );
  };

  const openAssign = (item: DispatchRecord, type: "vehicle" | "driver") => {
    setAssignTargetId(item.id);
    setAssignTargetLabel(item.dispatchId);
    setAssignTargetType(getDispatchTargetType(item));
    setAssignDriverId(item.driverId);
    setAssignVehicleId(item.vehicleId);
    if (type === "vehicle") setAssignVehicleOpen(true);
    else setAssignDriverOpen(true);
  };

  const handleAction = (action: string, item: DispatchRecord) => {
    if (action === "assign-vehicle") {
      openAssign(item, "vehicle");
    } else if (action === "assign-driver") {
      openAssign(item, "driver");
    } else if (action === "view-route") {
      notify.info("View Route", `Route: ${item.route}`);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-white p-10 text-center">
        <p className="text-sm font-medium">Unable to load dispatches.</p>
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
            isActive={activeCard === stat.id}
            onClick={() => handleStatCardClick(stat.id as DispatchStatKey)}
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
          setActiveCard(null);
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
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No dispatches found."
              description="Dispatches are created via warehouse and hub workflows."
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
                {rows.map((item) => {
                  const showAssignVehicle = canAssignVehicle(item);
                  const showAssignDriver = canAssignDriver(item);
                  const showReassignVehicle = canReassignVehicle(item);
                  const showReassignDriver = canReassignDriver(item);

                  return (
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
                            {showAssignVehicle ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction("assign-vehicle", item)
                                }
                              >
                                Assign Vehicle
                              </DropdownMenuItem>
                            ) : null}
                            {showAssignDriver ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction("assign-driver", item)
                                }
                              >
                                Assign Driver
                              </DropdownMenuItem>
                            ) : null}
                            {showReassignVehicle && !showAssignVehicle ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction("assign-vehicle", item)
                                }
                              >
                                Change Vehicle
                              </DropdownMenuItem>
                            ) : null}
                            {showReassignDriver && !showAssignDriver ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAction("assign-driver", item)
                                }
                              >
                                Change Driver
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => handleAction("view-route", item)}
                            >
                              View Route
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
            itemLabel="dispatches"
          />
        ) : null}
      </div>

      <AssignVehicleDialog
        open={assignVehicleOpen}
        onOpenChange={setAssignVehicleOpen}
        targetId={assignTargetId}
        targetLabel={assignTargetLabel}
        targetType={assignTargetType}
        driverId={assignDriverId}
        onAssigned={() => void refetch()}
      />
      <AssignDriverDialog
        open={assignDriverOpen}
        onOpenChange={setAssignDriverOpen}
        targetId={assignTargetId}
        targetLabel={assignTargetLabel}
        targetType={assignTargetType}
        vehicleId={assignVehicleId}
        onAssigned={() => void refetch()}
      />
    </div>
  );
}
