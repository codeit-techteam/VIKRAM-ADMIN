"use client";

import {
  ArrowRightLeft,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  KeyRound,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ManagerStatusBadge } from "@/features/user-management/components/sub-hub-manager/ManagerStatusBadge";
import { TransferHubModal } from "@/features/user-management/components/sub-hub-manager/TransferHubModal";
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
import { ROUTES } from "@/constants/routes";
import { useLogisticsStore } from "@/store/logistics-store";
import { useSubHubManagerStore } from "@/store/sub-hub-manager-store";
import { normalizeHubInventory } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import { formatDate } from "@/utils/format-date";
import { enrichManagersWithOps } from "@/utils/manager-ops-metrics";
import { notify } from "@/utils/notify";
import { cn } from "@/lib/utils";

interface ManagerProfileContentProps {
  managerId: string;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-72" />
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border border-red-100",
  MEDIUM: "bg-amber-50 text-amber-700 border border-amber-100",
  LOW: "bg-slate-50 text-slate-600 border border-slate-200",
};

const DISPATCH_STATUS_STYLES: Record<string, string> = {
  READY: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  LOADING: "bg-blue-50 text-blue-700 border border-blue-100",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
};

const DRIVER_STATUS_STYLES: Record<string, { label: string; style: string }> = {
  AVAILABLE: {
    label: "Available",
    style: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  ON_ROUTE: {
    label: "On Route",
    style: "bg-blue-50 text-blue-700 border border-blue-100",
  },
  LOADING: {
    label: "Loading",
    style: "bg-orange-50 text-orange-700 border border-orange-100",
  },
  LEAVE: {
    label: "Leave",
    style: "bg-red-50 text-red-600 border border-red-100",
  },
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconContainerClassName,
  iconClassName,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconContainerClassName: string;
  iconClassName: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1A1A1A]">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            iconContainerClassName,
          )}
        >
          <Icon className={cn("size-5", iconClassName)} />
        </div>
      </div>
    </div>
  );
}

export function ManagerProfileContent({
  managerId,
}: ManagerProfileContentProps) {
  const getManagerProfile = useSubHubManagerStore(
    (state) => state.getManagerProfile,
  );
  const transferHub = useSubHubManagerStore((state) => state.transferHub);
  const deactivateManager = useSubHubManagerStore(
    (state) => state.deactivateManager,
  );
  const managers = useSubHubManagerStore((state) => state.managers);

  const hubInventory = useWarehouseErpStore((state) => state.hubInventory);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const transfers = useWarehouseErpStore((state) => state.transfers);
  const drivers = useLogisticsStore((state) => state.drivers);

  const [isLoading, setIsLoading] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [managerId]);

  const profile = useMemo(() => {
    const base = getManagerProfile(managerId);
    if (!base) return null;

    const [enriched] = enrichManagersWithOps([base], {
      hubInventory: normalizeHubInventory(hubInventory),
      requisitions,
      transfers,
      drivers,
    });

    return {
      ...base,
      ...enriched,
      hub: {
        ...base.hub,
        pendingRequisitions: enriched.pendingRequisitions,
        pendingDispatches: enriched.pendingDispatches,
        todayOrders: enriched.todayOrders,
        lowStockItems: enriched.lowStockItems,
        drivers: enriched.totalDrivers,
      },
    };
  }, [
    getManagerProfile,
    managerId,
    managers,
    hubInventory,
    requisitions,
    transfers,
    drivers,
  ]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "User Management", href: ROUTES.USER_MANAGEMENT },
            {
              label: "Sub-Hub Managers",
              href: ROUTES.SUB_HUB_MANAGERS,
            },
            { label: "Manager Profile" },
          ]}
        />
        <EmptyState
          title="Manager not found"
          description="The requested manager profile could not be located."
        />
      </div>
    );
  }

  const { hub } = profile;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "User Management", href: ROUTES.USER_MANAGEMENT },
          { label: "Sub-Hub Managers", href: ROUTES.SUB_HUB_MANAGERS },
          { label: profile.name },
        ]}
      />

      {/* Profile header */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-16 shrink-0 items-center justify-center rounded-xl text-xl font-bold",
                getAvatarColor(profile.id),
              )}
            >
              {getInitials(profile.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1A1A1A]">
                  {profile.name}
                </h1>
                <Badge
                  variant="outline"
                  className="rounded-full border-pink-200 bg-pink-50 px-2.5 py-0.5 text-[10px] font-semibold text-pink-700 uppercase"
                >
                  {profile.employeeId}
                </Badge>
                <ManagerStatusBadge status={profile.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#64748B]">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-4" />
                  {profile.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-4" />
                  {profile.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {profile.hubName} · {profile.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Warehouse className="size-4" />
                  {profile.warehouse}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  {profile.region}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  Joined {formatDate(profile.joiningDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() =>
                notify.success("Edit", "Manager edit form opened.")
              }
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setIsTransferOpen(true)}
            >
              <ArrowRightLeft className="size-4" />
              Transfer Hub
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
              onClick={() => {
                deactivateManager(profile.id);
                notify.success("Deactivated", `${profile.name} deactivated.`);
              }}
            >
              <Ban className="size-4" />
              Deactivate
            </Button>
          </div>
        </div>
      </div>

      {/* Operational summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Pending Requisitions"
          value={profile.pendingRequisitions}
          icon={ClipboardList}
          iconContainerClassName="bg-amber-50"
          iconClassName="text-amber-600"
        />
        <SummaryCard
          label="Pending Dispatches"
          value={profile.pendingDispatches}
          icon={Truck}
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-600"
        />
        <SummaryCard
          label="Today's Orders"
          value={profile.todayOrders}
          icon={Package}
          iconContainerClassName="bg-emerald-50"
          iconClassName="text-emerald-600"
        />
        <SummaryCard
          label="Drivers Available"
          value={`${profile.availableDrivers} / ${profile.totalDrivers}`}
          icon={Users}
          iconContainerClassName="bg-purple-50"
          iconClassName="text-purple-600"
        />
      </div>

      {/* Hub information + Activity */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Hub info */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#1A1A1A]">
            Assigned Hub Information
          </h2>
          <div className="space-y-3">
            {[
              { label: "Hub Name", value: hub.hubName },
              { label: "Hub Code", value: hub.hubCode },
              { label: "Warehouse Linked", value: hub.warehouse },
              { label: "Coverage Radius", value: hub.coverageRadius },
              { label: "City", value: hub.city },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">{label}</span>
                <span className="text-sm font-medium text-[#1A1A1A]">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <Link
              href={`${ROUTES.SUB_HUB_NETWORK}/${hub.hubId}`}
              className={buttonVariants({ size: "sm", className: "gap-2" })}
            >
              <Building2 className="size-4" />
              Open Hub Dashboard
            </Link>
          </div>
        </section>

        {/* Activity timeline */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#1A1A1A]">
            Recent Operational Activity
          </h2>
          <div className="max-h-72 overflow-y-auto">
            <ol className="space-y-4 pr-2">
              {profile.recentActivity.map((event, index) => (
                <li key={event.id} className="relative flex gap-3 pb-2">
                  {index < profile.recentActivity.length - 1 ? (
                    <span
                      className="absolute top-3 left-[7px] h-full w-px bg-gray-200"
                      aria-hidden
                    />
                  ) : null}
                  <span className="bg-primary relative z-10 mt-1 size-3.5 shrink-0 rounded-full ring-4 ring-white" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {event.title}
                    </p>
                    {event.description ? (
                      <p className="text-xs text-[#64748B]">
                        {event.description}
                      </p>
                    ) : null}
                    <time className="text-xs text-gray-400">{event.time}</time>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* Pending Requisitions */}
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Pending Requisitions
          </h2>
          <Badge variant="outline">
            {profile.pendingRequisitionRows.length}
          </Badge>
        </div>
        {profile.pendingRequisitionRows.length === 0 ? (
          <EmptyState
            title="No Pending Requisitions"
            description="All requisitions have been completed."
            className="py-10"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAFAF8] hover:bg-[#FAFAF8]">
                  {["REQ ID", "MATERIAL", "QTY", "PRIORITY", "STATUS", ""].map(
                    (h) => (
                      <TableHead key={h} className="text-[10px] uppercase">
                        {h}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.pendingRequisitionRows.map((req) => (
                  <TableRow key={req.id} className="border-gray-100">
                    <TableCell className="font-medium">#{req.reqId}</TableCell>
                    <TableCell>{req.material}</TableCell>
                    <TableCell>{req.requestedQty} units</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          PRIORITY_STYLES[req.priority] ??
                            "bg-gray-50 text-gray-600",
                        )}
                      >
                        {req.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 uppercase">
                        {req.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          notify.success(
                            "View Requisition",
                            `Viewing ${req.reqId}`,
                          )
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Pending Dispatches */}
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Pending Dispatches
          </h2>
          <Badge variant="outline">{profile.pendingDispatchRows.length}</Badge>
        </div>
        {profile.pendingDispatchRows.length === 0 ? (
          <EmptyState
            title="No Pending Dispatches"
            description="All dispatches are completed."
            className="py-10"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAFAF8] hover:bg-[#FAFAF8]">
                  {[
                    "DISPATCH ID",
                    "CUSTOMER",
                    "VEHICLE",
                    "DRIVER",
                    "STATUS",
                    "",
                  ].map((h) => (
                    <TableHead key={h} className="text-[10px] uppercase">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.pendingDispatchRows.map((dispatch) => (
                  <TableRow key={dispatch.id} className="border-gray-100">
                    <TableCell className="font-medium">
                      #{dispatch.dispatchId}
                    </TableCell>
                    <TableCell>{dispatch.customer}</TableCell>
                    <TableCell className="text-[#64748B]">
                      {dispatch.vehicle}
                    </TableCell>
                    <TableCell>{dispatch.driver}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          DISPATCH_STATUS_STYLES[dispatch.status] ??
                            "bg-gray-50 text-gray-600",
                        )}
                      >
                        {dispatch.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          notify.success(
                            "View Dispatch",
                            `Viewing ${dispatch.dispatchId}`,
                          )
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Drivers */}
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">Drivers</h2>
          <Badge variant="outline">
            {profile.availableDrivers} available / {profile.totalDrivers} total
          </Badge>
        </div>
        {profile.driverRows.length === 0 ? (
          <EmptyState
            title="No Drivers Assigned"
            description="No drivers are currently assigned to this hub."
            className="py-10"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAFAF8] hover:bg-[#FAFAF8]">
                  {["DRIVER", "VEHICLE", "STATUS", "TODAY'S TRIPS"].map((h) => (
                    <TableHead key={h} className="text-[10px] uppercase">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.driverRows.map((driver) => {
                  const driverStatus =
                    DRIVER_STATUS_STYLES[driver.currentStatus];
                  return (
                    <TableRow key={driver.id} className="border-gray-100">
                      <TableCell className="font-medium">
                        {driver.driverName}
                      </TableCell>
                      <TableCell className="text-[#64748B]">
                        {driver.vehicle}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            driverStatus?.style ?? "bg-gray-50 text-gray-600",
                          )}
                        >
                          {driverStatus?.label ?? driver.currentStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{driver.todayTrips}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <TransferHubModal
        manager={profile}
        open={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onTransfer={(managerId, newHubId, reason, effectiveDate) => {
          transferHub({ managerId, newHubId, reason, effectiveDate });
          notify.success(
            "Manager Transferred",
            "Manager transferred successfully to new hub.",
          );
          setIsTransferOpen(false);
        }}
      />
    </div>
  );
}
