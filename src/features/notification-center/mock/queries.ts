import type {
  EnterpriseNotification,
  NotificationFilterValue,
  NotificationQueryFilters,
  NotificationQueryResult,
} from "@/features/notification-center/types";

function matchesFilter(
  notification: EnterpriseNotification,
  filter: NotificationFilterValue,
): boolean {
  if (filter === "all") return true;
  if (filter === "unread") return !notification.isRead;
  return notification.category === filter;
}

function matchesSearch(
  notification: EnterpriseNotification,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return (
    notification.title.toLowerCase().includes(query) ||
    notification.description.toLowerCase().includes(query) ||
    notification.actionLabel.toLowerCase().includes(query) ||
    notification.category.toLowerCase().includes(query)
  );
}

export function queryNotifications(
  notifications: EnterpriseNotification[],
  filters: NotificationQueryFilters,
): NotificationQueryResult {
  const filtered = notifications
    .filter((notification) => matchesFilter(notification, filters.filter))
    .filter((notification) => matchesSearch(notification, filters.search))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const start = (page - 1) * filters.pageSize;

  return {
    items: filtered.slice(start, start + filters.pageSize),
    total,
    totalPages,
    unreadCount: notifications.filter((notification) => !notification.isRead)
      .length,
  };
}

export function filterDrawerNotifications(
  notifications: EnterpriseNotification[],
  filter: NotificationFilterValue,
): EnterpriseNotification[] {
  return notifications
    .filter((notification) => matchesFilter(notification, filter))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}
