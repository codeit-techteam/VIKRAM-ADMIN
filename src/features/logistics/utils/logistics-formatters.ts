/** Shared logistics formatting helpers (no mock data). */

export const LOGISTICS_PAGE_SIZE = 8;

export const EMPTY_WAREHOUSE_FILTERS = {
  search: "",
  warehouse: "all",
  destinationHub: "all",
  priority: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
};

export const EMPTY_CUSTOMER_FILTERS = {
  search: "",
  hub: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
};

export const EMPTY_DISPATCH_FILTERS = {
  search: "",
  source: "all",
  status: "all",
  assignment: "all" as const,
};

export const EMPTY_MAINTENANCE_FILTERS = {
  search: "",
  status: "all",
};

export function formatLogisticsDateTime(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLogisticsDate(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getIssueLabel(issue: string): string {
  const labels: Record<string, string> = {
    vehicle_breakdown: "Vehicle Breakdown",
    traffic_delay: "Traffic Delay",
    driver_unreachable: "Driver Unreachable",
    document_missing: "Unassigned / Incomplete",
    wrong_route: "Wrong Route",
    none: "—",
  };
  return labels[issue] ?? issue;
}

export function getPriorityLabel(priority: string): string {
  if (!priority) return "—";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
