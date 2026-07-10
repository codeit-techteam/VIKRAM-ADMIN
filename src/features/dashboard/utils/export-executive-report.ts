import * as XLSX from "xlsx";

import {
  DASHBOARD_DATE_RANGE_LABELS,
  fetchExecutiveDashboardData,
  type DashboardDateFilter,
} from "@/mock/executive-dashboard";

function getPeriodLabel(filter: DashboardDateFilter): string {
  if (filter.range === "custom" && filter.customFrom && filter.customTo) {
    return `${filter.customFrom} to ${filter.customTo}`;
  }

  return DASHBOARD_DATE_RANGE_LABELS[filter.range];
}

export function exportExecutiveDashboardReport(
  filter: DashboardDateFilter,
): void {
  const data = fetchExecutiveDashboardData(filter);
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const periodLabel = getPeriodLabel(filter);

  const summaryRows: (string | number)[][] = [
    ["Bajriwala Executive Dashboard Report"],
    ["Generated At", generatedAt],
    ["Period", periodLabel],
    [],
    ["Key Metrics"],
    ["Metric", "Value", "Notes"],
    ...data.statCards.map((card) => [card.label, card.value, card.subtext]),
    [],
    ["Critical Pending Actions"],
    ["Title", "Count", "Priority", "Notes"],
    ...data.pendingActions.map((action) => [
      action.title,
      action.count,
      action.priority,
      action.subtitle ?? "",
    ]),
  ];

  const ordersRows = data.recentOrders.map((order) => ({
    "Order ID": order.orderId,
    Customer: order.customer,
    Source: order.source,
    "Assigned Hub": order.assignedHub,
    Payment: order.paymentStatus,
    Status: order.status,
  }));

  const notificationRows = data.notifications.map((notification) => ({
    Title: notification.title,
    Description: notification.description,
    Time: notification.time,
    Status: notification.isUnread ? "Unread" : "Read",
  }));

  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  const ordersSheet = XLSX.utils.json_to_sheet(ordersRows);
  const notificationsSheet = XLSX.utils.json_to_sheet(notificationRows);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, ordersSheet, "Recent Orders");
  XLSX.utils.book_append_sheet(workbook, notificationsSheet, "Notifications");

  const filename = `executive-dashboard-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
