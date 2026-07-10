import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
} from "@/features/notification-center/constants";
import type { EnterpriseNotification } from "@/features/notification-center/types";
import { formatNotificationTime } from "@/features/notification-center/utils/format-notification-time";

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportNotificationsToCsv(
  notifications: EnterpriseNotification[],
  filename = "notification-logs.csv",
): void {
  const headers = [
    "ID",
    "Category",
    "Title",
    "Description",
    "Priority",
    "Status",
    "Time",
    "Action",
    "Link",
  ];

  const rows = notifications.map((notification) => [
    notification.id,
    CATEGORY_CONFIG[notification.category].label,
    notification.title,
    notification.description,
    PRIORITY_CONFIG[notification.priority].label,
    notification.isRead ? "Read" : "Unread",
    formatNotificationTime(notification.createdAt),
    notification.actionLabel,
    notification.href,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(String(cell))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
