"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Wrench,
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
import { LogisticsFilterBar } from "@/features/logistics/components/LogisticsFilterBar";
import {
  LogisticsMetricCard,
  type LogisticsMetricCardData,
} from "@/features/logistics/components/LogisticsMetricCard";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { useLogisticsLoading } from "@/features/logistics/hooks/use-logistics-loading";
import {
  EMPTY_MAINTENANCE_FILTERS,
  formatLogisticsDate,
  getMaintenanceStats,
  LOGISTICS_PAGE_SIZE,
  queryMaintenance,
} from "@/mock/logistics";
import { useLogisticsStore } from "@/store/logistics-store";
import type { MaintenanceFilters } from "@/types/logistics.types";
import { notify } from "@/utils/notify";

export function MaintenancePage() {
  const { isLoading } = useLogisticsLoading();
  const maintenanceRecords = useLogisticsStore((s) => s.maintenanceRecords);
  const updateMaintenanceStatus = useLogisticsStore(
    (s) => s.updateMaintenanceStatus,
  );
  const rescheduleMaintenance = useLogisticsStore(
    (s) => s.rescheduleMaintenance,
  );

  const [filters, setFilters] = useState<MaintenanceFilters>(
    EMPTY_MAINTENANCE_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);

  const stats = useMemo(
    () => getMaintenanceStats(maintenanceRecords),
    [maintenanceRecords],
  );

  const kpiCards = useMemo<LogisticsMetricCardData[]>(
    () => [
      {
        id: "scheduled",
        label: "Scheduled",
        value: String(stats.scheduled),
        icon: Clock,
      },
      {
        id: "in-maintenance",
        label: "In Maintenance",
        value: String(stats.inMaintenance),
        variant: "warning",
        icon: Wrench,
      },
      {
        id: "completed",
        label: "Completed",
        value: String(stats.completed),
        variant: "success",
        icon: CheckCircle2,
      },
      {
        id: "overdue",
        label: "Overdue",
        value: String(stats.overdue),
        variant: "critical",
        icon: AlertTriangle,
      },
    ],
    [stats],
  );

  const queryResult = useMemo(
    () =>
      queryMaintenance(
        maintenanceRecords,
        currentPage,
        LOGISTICS_PAGE_SIZE,
        filters,
      ),
    [maintenanceRecords, currentPage, filters],
  );

  const filterConfigs = [
    {
      label: "Status",
      value: filters.status,
      onChange: (v: string) => setFilters((f) => ({ ...f, status: v })),
      options: [
        { value: "all", label: "All Statuses" },
        { value: "scheduled", label: "Scheduled" },
        { value: "in_maintenance", label: "In Maintenance" },
        { value: "completed", label: "Completed" },
        { value: "overdue", label: "Overdue" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
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
        searchPlaceholder="Vehicle number, issue, garage..."
        searchValue={filters.search}
        onSearchChange={(v) => {
          setFilters((f) => ({ ...f, search: v }));
          setCurrentPage(1);
        }}
        filters={filterConfigs}
        onReset={() => {
          setFilters(EMPTY_MAINTENANCE_FILTERS);
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
              title="No Maintenance Records"
              description="No maintenance records match your filters."
              icon={<Wrench className="size-8" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8F9FB] hover:bg-[#F8F9FB]">
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Issue
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Garage
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-400 uppercase">
                    Expected Completion
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
                {queryResult.data.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      {record.vehicleNumber}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-[#64748B]">
                      {record.issue}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-[#64748B]">
                      {record.garage}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {formatLogisticsDate(record.expectedCompletion)}
                    </TableCell>
                    <TableCell>
                      <LogisticsStatusBadge status={record.status} />
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
                            onClick={() =>
                              notify.info(
                                "Maintenance Details",
                                `${record.vehicleNumber}: ${record.issue}`,
                              )
                            }
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              updateMaintenanceStatus(record.id, "completed");
                              notify.success("Maintenance Completed");
                            }}
                          >
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const newDate = new Date(
                                Date.now() + 7 * 24 * 60 * 60 * 1000,
                              ).toISOString();
                              rescheduleMaintenance(record.id, newDate);
                              notify.success("Maintenance Rescheduled");
                            }}
                          >
                            Reschedule
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
            itemLabel="records"
          />
        ) : null}
      </div>
    </div>
  );
}
