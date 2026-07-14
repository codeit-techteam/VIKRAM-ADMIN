"use client";

import { Box, CheckCircle2, Clock, Eye, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TransferStatusBadge } from "@/components/transfers/TransferStatusBadge";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import {
  computeDispatchStats,
  isDispatchedToday,
  TRANSFER_WAREHOUSE_OPTIONS,
} from "@/mock/transfers";
import { useTransferListStore } from "@/store/transfer-list-store";
import type { TransferListItem, TransferStatus } from "@/types/warehouse.types";
import {
  DISPATCH_QUEUE_STATUSES,
  getDispatchRowAction,
  getPriorityLabel,
  getPriorityStyles,
  getTransferActionLabel,
} from "@/utils/transfer-actions";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

type DispatchFilterStatus = TransferStatus | "all" | "dispatched-today";

type DispatchStatKey =
  "pending-dispatch" | "loading" | "ready-to-dispatch" | "dispatched-today";

const DISPATCH_STAT_FILTER_MAP = {
  "pending-dispatch": "TRANSFER_CREATED",
  loading: "LOADING",
  "ready-to-dispatch": "READY_FOR_DISPATCH",
  "dispatched-today": "dispatched-today",
} as const satisfies Record<DispatchStatKey, DispatchFilterStatus>;

const DISPATCH_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "TRANSFER_CREATED", label: "Pending Dispatch" },
  { value: "LOADING", label: "Loading" },
  { value: "READY_FOR_DISPATCH", label: "Ready to Dispatch" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "dispatched-today", label: "Dispatched Today" },
] as const;

function DispatchStatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  isLoading,
  isActive = false,
  onClick,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  variant?: "default" | "warning";
  isLoading?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
        <div className="mt-3 h-8 w-12 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  const content = (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.01] hover:shadow-md",
        isActive
          ? "border-primary bg-primary/5 ring-primary/20 ring-2"
          : "border-gray-100",
        !isActive && variant === "warning" ? "bg-orange-50/60" : null,
        !isActive && variant !== "warning" ? "bg-white" : null,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold tracking-tight",
              variant === "warning" ? "text-primary" : "text-[#1A1A1A]",
            )}
          >
            {value}
          </p>
        </div>
        <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="text-primary size-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        aria-label={`Filter by ${label}`}
        className="w-full text-left"
      >
        {content}
      </button>
    );
  }

  return content;
}

function getDispatchActionHref(
  transfer: TransferListItem,
  action: ReturnType<typeof getDispatchRowAction>,
): string {
  const base = `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}`;
  switch (action) {
    case "start-loading":
      return base;
    case "complete-loading":
      return `${base}/loading`;
    case "dispatch-now":
      return `${base}/confirm`;
    default:
      return base;
  }
}

export function DispatchControl() {
  const router = useRouter();
  const transfers = useTransferListStore((state) => state.transfers);
  const startLoading = useTransferListStore((state) => state.startLoading);

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DispatchFilterStatus>("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(() => computeDispatchStats(transfers), [transfers]);

  const queueTransfers = useMemo(() => {
    return transfers
      .filter((t) => DISPATCH_QUEUE_STATUSES.includes(t.status))
      .filter((t) => {
        if (statusFilter === "dispatched-today") {
          if (t.status !== "IN_TRANSIT" || !isDispatchedToday(t)) return false;
        } else if (statusFilter !== "all" && t.status !== statusFilter) {
          return false;
        }
        if (
          warehouseFilter !== "all" &&
          t.sourceWarehouseId !== warehouseFilter
        ) {
          return false;
        }
        if (priorityFilter !== "all") {
          const priority = t.priority ?? t.transferType ?? "standard";
          if (priority !== priorityFilter) return false;
        }
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          return (
            t.transferId.toLowerCase().includes(q) ||
            t.destinationHub.toLowerCase().includes(q) ||
            (t.vehicleNumber?.toLowerCase().includes(q) ?? false) ||
            (t.assignedDriver?.name.toLowerCase().includes(q) ?? false)
          );
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [transfers, statusFilter, warehouseFilter, priorityFilter, search]);

  const handleStatCardClick = useCallback((statId: DispatchStatKey) => {
    const nextStatus = DISPATCH_STAT_FILTER_MAP[statId];
    setStatusFilter((current) => (current === nextStatus ? "all" : nextStatus));
  }, []);

  const handleRowAction = useCallback(
    (transfer: TransferListItem) => {
      const action = getDispatchRowAction(transfer);
      if (!action) return;

      if (action === "start-loading") {
        try {
          startLoading(transfer.transferId);
          notify.success(
            "Loading started",
            `${transfer.transferId} is now loading.`,
          );
          router.push(
            `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}/loading`,
          );
        } catch (error) {
          notify.error(
            "Action failed",
            error instanceof Error ? error.message : "Unable to start loading.",
          );
        }
        return;
      }

      router.push(getDispatchActionHref(transfer, action));
    },
    [router, startLoading],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DispatchStatCard
          label="Pending Dispatch"
          value={String(stats.pendingDispatch).padStart(2, "0")}
          icon={Clock}
          variant="warning"
          isLoading={isLoading}
          isActive={
            statusFilter === DISPATCH_STAT_FILTER_MAP["pending-dispatch"]
          }
          onClick={() => handleStatCardClick("pending-dispatch")}
        />
        <DispatchStatCard
          label="Loading"
          value={String(stats.loading).padStart(2, "0")}
          icon={Truck}
          isLoading={isLoading}
          isActive={statusFilter === DISPATCH_STAT_FILTER_MAP.loading}
          onClick={() => handleStatCardClick("loading")}
        />
        <DispatchStatCard
          label="Ready to Dispatch"
          value={String(stats.readyForDispatch).padStart(2, "0")}
          icon={Box}
          isLoading={isLoading}
          isActive={
            statusFilter === DISPATCH_STAT_FILTER_MAP["ready-to-dispatch"]
          }
          onClick={() => handleStatCardClick("ready-to-dispatch")}
        />
        <DispatchStatCard
          label="Dispatched Today"
          value={String(stats.dispatchedToday).padStart(2, "0")}
          icon={CheckCircle2}
          isLoading={isLoading}
          isActive={
            statusFilter === DISPATCH_STAT_FILTER_MAP["dispatched-today"]
          }
          onClick={() => handleStatCardClick("dispatched-today")}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="space-y-4 border-b border-gray-100 p-5">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Transfer ID or Hub..."
              className="h-10 border-gray-200 bg-[#F8F9FB] pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#64748B]">Filter by:</span>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                v && setStatusFilter(v as DispatchFilterStatus)
              }
            >
              <SelectTrigger className="h-9 w-[160px] border-gray-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPATCH_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={warehouseFilter}
              onValueChange={(v) => v && setWarehouseFilter(v)}
            >
              <SelectTrigger className="h-9 w-[180px] border-gray-200 text-sm">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {TRANSFER_WAREHOUSE_OPTIONS.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(v) => v && setPriorityFilter(v)}
            >
              <SelectTrigger className="h-9 w-[140px] border-gray-200 text-sm">
                <SelectValue placeholder="Priority: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Priority: All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="express">High</SelectItem>
                <SelectItem value="standard">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-5">
            <DataTableSkeleton columns={8} rows={6} />
          </div>
        ) : queueTransfers.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[#64748B]">
            No transfers in the dispatch queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>Destination Hub</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueTransfers.map((transfer) => {
                  const action = getDispatchRowAction(transfer);
                  const material =
                    transfer.material ??
                    transfer.materials[0]?.split(" x")[0] ??
                    "—";
                  const qty = transfer.quantity
                    ? `${transfer.quantity} ${transfer.quantityUnit ?? ""}`
                    : "—";
                  const driverInitials =
                    transfer.assignedDriver?.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() ?? "";

                  return (
                    <TableRow
                      key={transfer.id}
                      className="cursor-pointer hover:bg-gray-50/80"
                      onClick={() =>
                        router.push(
                          `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}`,
                        )
                      }
                    >
                      <TableCell className="text-primary font-semibold">
                        {transfer.transferId}
                      </TableCell>
                      <TableCell>{transfer.destinationHub}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="size-4 text-[#64748B]" />
                          <span className="text-sm">
                            {transfer.vehicleNumber ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transfer.assignedDriver ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full text-[10px] font-semibold">
                              {driverInitials}
                            </span>
                            <span className="text-sm">
                              {transfer.assignedDriver.name}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm">
                        {material}
                      </TableCell>
                      <TableCell className="text-sm">{qty}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase",
                            getPriorityStyles(transfer),
                          )}
                        >
                          {getPriorityLabel(transfer)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <TransferStatusBadge
                          transfer={transfer}
                          forceDispatchedToday={
                            statusFilter === "dispatched-today"
                          }
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-8 text-[#64748B]"
                            nativeButton={false}
                            render={
                              <Link
                                href={`${ROUTES.CENTRAL_WAREHOUSE}/transfers/${transfer.transferId}`}
                              />
                            }
                          >
                            <Eye className="size-4" />
                          </Button>
                          {action ? (
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                action === "dispatch-now" ? "default" : "ghost"
                              }
                              className={cn(
                                "h-8 text-xs font-semibold",
                                action !== "dispatch-now" &&
                                  "text-primary hover:bg-orange-50",
                              )}
                              onClick={() => handleRowAction(transfer)}
                            >
                              {getTransferActionLabel(action)}
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
