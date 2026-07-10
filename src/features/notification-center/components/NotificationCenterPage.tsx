"use client";

import { CheckCheck, Download, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationCard } from "@/features/notification-center/components/NotificationCard";
import {
  NOTIFICATION_CENTER_FILTER_OPTIONS,
  NOTIFICATION_PAGE_SIZE,
} from "@/features/notification-center/constants";
import { queryNotifications } from "@/features/notification-center/mock/queries";
import type {
  EnterpriseNotification,
  NotificationFilterValue,
} from "@/features/notification-center/types";
import { exportNotificationsToCsv } from "@/features/notification-center/utils/export-notifications";
import { useNotificationStore } from "@/store/notification-store";
import { notify } from "@/utils/notify";

type CenterFilterValue = NotificationFilterValue;

const EMPTY_FILTERS: { search: string; filter: CenterFilterValue } = {
  search: "",
  filter: "all",
};

export function NotificationCenterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const initialize = useNotificationStore((state) => state.initialize);
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const bulkMarkAsRead = useNotificationStore((state) => state.bulkMarkAsRead);
  const bulkDelete = useNotificationStore((state) => state.bulkDelete);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  useEffect(() => {
    initialize();
    const timer = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, [initialize]);

  const queryResult = useMemo(
    () =>
      queryNotifications(notifications, {
        search: appliedFilters.search,
        filter: appliedFilters.filter,
        page: currentPage,
        pageSize: NOTIFICATION_PAGE_SIZE,
      }),
    [notifications, appliedFilters, currentPage],
  );

  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.isRead).length;
    const critical = notifications.filter(
      (n) => n.priority === "critical" && !n.isRead,
    ).length;
    const today = notifications.filter((n) => {
      const created = new Date(n.createdAt);
      const now = new Date();
      return created.toDateString() === now.toDateString();
    }).length;

    return { total: notifications.length, unread, critical, today };
  }, [notifications]);

  const allVisibleSelected =
    queryResult.items.length > 0 &&
    queryResult.items.every((item) => selectedIds.includes(item.id));

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleClearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleSelectAllVisible = (checked: boolean) => {
    if (!checked) {
      const visibleIds = new Set(queryResult.items.map((item) => item.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      queryResult.items.forEach((item) => next.add(item.id));
      return Array.from(next);
    });
  };

  const handleSelectOne = (id: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((itemId) => itemId !== id),
    );
  };

  const handleNotificationClick = (notification: EnterpriseNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    router.push(notification.href);
  };

  const handleBulkMarkRead = () => {
    if (selectedIds.length === 0) return;
    bulkMarkAsRead(selectedIds);
    notify.success(
      `${selectedIds.length} notification${selectedIds.length === 1 ? "" : "s"} marked as read`,
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDelete(selectedIds);
    notify.success(
      `${selectedIds.length} notification${selectedIds.length === 1 ? "" : "s"} deleted`,
    );
    setSelectedIds([]);
  };

  const handleExport = () => {
    const exportItems =
      selectedIds.length > 0
        ? notifications.filter((notification) =>
            selectedIds.includes(notification.id),
          )
        : notifications;

    exportNotificationsToCsv(exportItems);
    notify.success(
      `Exported ${exportItems.length} notification log${exportItems.length === 1 ? "" : "s"}`,
    );
  };

  const hasActiveFilters =
    appliedFilters.search.trim() !== "" || appliedFilters.filter !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        subtitle="Monitor enterprise alerts, operational updates, and system events across the network."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-gray-200"
              onClick={() => {
                markAllAsRead();
                notify.success("All notifications marked as read");
              }}
              disabled={stats.unread === 0}
            >
              <CheckCheck className="size-4" />
              Mark All Read
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-gray-200"
              onClick={handleExport}
              disabled={notifications.length === 0}
            >
              <Download className="size-4" />
              Export Logs
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Notifications"
          value={stats.total}
          isLoading={isLoading}
        />
        <StatCard label="Unread" value={stats.unread} isLoading={isLoading} />
        <StatCard
          label="Critical Unread"
          value={stats.critical}
          isLoading={isLoading}
        />
        <StatCard label="Today" value={stats.today} isLoading={isLoading} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={draftFilters.search}
              onChange={(event) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") handleApplyFilters();
              }}
              placeholder="Search notifications..."
              className="border-gray-200 pl-9"
            />
          </div>

          <Select
            value={draftFilters.filter}
            onValueChange={(value) =>
              setDraftFilters((prev) => ({
                ...prev,
                filter: value as CenterFilterValue,
              }))
            }
          >
            <SelectTrigger className="w-full border-gray-200 sm:w-[200px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_CENTER_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={handleApplyFilters}>
              Apply
            </Button>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearFilters}
              >
                <X className="size-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-orange-50/40 px-4 py-3">
            <p className="text-sm font-medium text-[#1A1A1A]">
              {selectedIds.length} selected
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-gray-200 bg-white"
                onClick={handleBulkMarkRead}
              >
                <CheckCheck className="size-3.5" />
                Bulk Mark Read
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                onClick={handleBulkDelete}
              >
                <Trash2 className="size-3.5" />
                Bulk Delete
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Checkbox
            checked={allVisibleSelected}
            onCheckedChange={(checked) =>
              handleSelectAllVisible(checked === true)
            }
            aria-label="Select all visible notifications"
          />
          <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            Select all on this page
          </span>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : queryResult.items.length === 0 ? (
            <EmptyState
              title="No notifications found"
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filter criteria."
                  : "Notifications will appear here as operations unfold."
              }
            />
          ) : (
            <div className="space-y-3">
              {queryResult.items.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  variant="full"
                  selectable
                  selected={selectedIds.includes(notification.id)}
                  onSelect={handleSelectOne}
                  onClick={handleNotificationClick}
                  onAction={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </div>

        {!isLoading && queryResult.total > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={queryResult.totalPages}
            pageSize={NOTIFICATION_PAGE_SIZE}
            totalItems={queryResult.total}
            onPageChange={(page) => {
              setCurrentPage(page);
              setSelectedIds([]);
            }}
            itemLabel="notifications"
          />
        ) : null}
      </div>
    </div>
  );
}
