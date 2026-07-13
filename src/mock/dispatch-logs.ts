import type { PaginationMeta } from "@/types/api";
import type {
  DispatchLog,
  DispatchLogFilters,
  DispatchLogOperationalFilter,
  DispatchLogOrderLine,
  DispatchLogQueryParams,
  DispatchLogStats,
  DispatchLogStatus,
  DispatchLogTimelineEvent,
} from "@/types/dispatch-log.types";

export const DISPATCH_LOG_PAGE_SIZE = 10;

export const EMPTY_DISPATCH_LOG_FILTERS: DispatchLogFilters = {
  hubId: "all",
  customer: "",
  vehicle: "",
  driver: "",
  status: "all",
  date: "",
};

export const DISPATCH_LOG_STATUS_LABELS: Record<DispatchLogStatus, string> = {
  READY_FOR_DISPATCH: "Ready",
  ASSIGNED: "Assigned",
  DISPATCHED: "Dispatched",
  REACHED_AREA: "Reached Area",
  DELIVERED: "Delivered",
};

export const DISPATCH_LOG_OPERATIONAL_FILTER_LABELS: Record<
  DispatchLogOperationalFilter,
  string
> = {
  "pending-dispatch": "Pending Dispatch",
  "vehicle-pending": "Vehicle Pending",
  "driver-pending": "Driver Pending",
};

/** Orders accepted by hub but not yet dispatched. */
export const PENDING_DISPATCH_STATUSES: DispatchLogStatus[] = [
  "READY_FOR_DISPATCH",
];

/** Entity status options for the Update Status modal. */
export const DISPATCH_LOG_STATUS_OPTIONS = (
  Object.entries(DISPATCH_LOG_STATUS_LABELS) as Array<
    [DispatchLogStatus, string]
  >
).map(([value, label]) => ({ value, label }));

/** Operational filter options for the filter bar. */
export const DISPATCH_LOG_FILTER_OPTIONS = [
  ...Object.entries(DISPATCH_LOG_OPERATIONAL_FILTER_LABELS).map(
    ([value, label]) => ({
      value: value as DispatchLogOperationalFilter,
      label,
    }),
  ),
  ...DISPATCH_LOG_STATUS_OPTIONS.filter(
    (option) =>
      option.value !== "READY_FOR_DISPATCH" && option.value !== "ASSIGNED",
  ),
  { value: "ASSIGNED" as DispatchLogStatus, label: "Assigned" },
];

export function isPendingDispatchLog(item: DispatchLog): boolean {
  return PENDING_DISPATCH_STATUSES.includes(item.status);
}

export function matchesDispatchOperationalFilter(
  item: DispatchLog,
  filter: DispatchLogOperationalFilter,
): boolean {
  switch (filter) {
    case "pending-dispatch":
      return isPendingDispatchLog(item);
    case "vehicle-pending":
      return isPendingDispatchLog(item) && !item.vehicleId;
    case "driver-pending":
      return isPendingDispatchLog(item) && !item.driverId;
    default:
      return false;
  }
}

export function computePendingDispatchCount(items: DispatchLog[]): number {
  return items.filter(isPendingDispatchLog).length;
}

export const DISPATCH_LOG_HUB_OPTIONS = [
  { id: "hub-gurgaon-north", name: "Gurgaon North" },
  { id: "hub-noida-62", name: "Noida Sector 62" },
  { id: "hub-manesar", name: "Manesar Plant" },
  { id: "hub-dwarka", name: "Dwarka Expressway Site" },
  { id: "hub-gurgaon-west", name: "Gurgaon West" },
] as const;

const now = new Date();
const hoursAgo = (h: number) =>
  new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const hoursFromNow = (h: number) =>
  new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();

const CUSTOMERS = [
  {
    id: "cust-101",
    name: "Sharma Construction Pvt Ltd",
    mobile: "+91 98100 12345",
  },
  { id: "cust-102", name: "Patel Builders", mobile: "+91 98100 23456" },
  {
    id: "cust-103",
    name: "Gupta Infra Solutions",
    mobile: "+91 98100 34567",
  },
  { id: "cust-104", name: "Reddy Housing", mobile: "+91 98100 45678" },
  { id: "cust-105", name: "Khan Contractors", mobile: "+91 98100 56789" },
  { id: "cust-106", name: "Mehta Realty", mobile: "+91 98100 67890" },
] as const;

const ADDRESSES = [
  { address: "Plot 45, Industrial Area, Ghaziabad", pincode: "201001" },
  { address: "B-12, Saket, New Delhi", pincode: "110017" },
  { address: "Tower B, Sector 62, Noida", pincode: "201309" },
  { address: "DLF Phase 3, Gurgaon", pincode: "122002" },
  { address: "Sector 21C, Faridabad", pincode: "121001" },
  { address: "Greater Kailash II, New Delhi", pincode: "110048" },
] as const;

const VEHICLES = [
  {
    id: "v-001",
    number: "HR-55-AN-1024",
    type: "10-Ton Trailer",
    hub: "Gurgaon North",
  },
  {
    id: "v-002",
    number: "DL-01-AB-4421",
    type: "8-Ton Truck",
    hub: "Noida Sector 62",
  },
  {
    id: "v-003",
    number: "HR-26-BK-7783",
    type: "12-Ton Flatbed",
    hub: "Manesar Plant",
  },
  {
    id: "v-004",
    number: "UP-16-CD-3309",
    type: "6-Ton LCV",
    hub: "Dwarka Expressway Site",
  },
  {
    id: "v-005",
    number: "HR-12-EF-5512",
    type: "15-Ton Trailer",
    hub: "Gurgaon West",
  },
] as const;

const DRIVERS = [
  {
    id: "d-001",
    name: "Rajesh Kumar",
    mobile: "+91 98765 43210",
    hub: "Gurgaon North",
  },
  {
    id: "d-002",
    name: "Mohit Verma",
    mobile: "+91 98765 43211",
    hub: "Noida Sector 62",
  },
  {
    id: "d-003",
    name: "Suresh Yadav",
    mobile: "+91 98765 43212",
    hub: "Manesar Plant",
  },
  {
    id: "d-004",
    name: "Amit Singh",
    mobile: "+91 98765 43213",
    hub: "Gurgaon West",
  },
  {
    id: "d-005",
    name: "Ramesh Patel",
    mobile: "+91 98765 43215",
    hub: "Noida Sector 62",
  },
] as const;

export const DISPATCH_ASSIGNMENT_VEHICLES = VEHICLES.map((vehicle) => ({
  id: vehicle.id,
  label: `${vehicle.number} · ${vehicle.type}`,
  number: vehicle.number,
  type: vehicle.type,
  hub: vehicle.hub,
}));

export const DISPATCH_ASSIGNMENT_DRIVERS = DRIVERS.map((driver) => ({
  id: driver.id,
  label: driver.name,
  name: driver.name,
  mobile: driver.mobile,
  hub: driver.hub,
}));

function isSameDay(iso: string, ref: Date = now): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function timelineEvent(
  status: DispatchLogStatus,
  updatedBy: string,
  timestamp: string,
  remarks?: string,
  isManual = true,
): DispatchLogTimelineEvent {
  return {
    id: `tl-${status}-${timestamp}`,
    status,
    title: DISPATCH_LOG_STATUS_LABELS[status],
    updatedBy,
    timestamp,
    remarks,
    isManual,
  };
}

function buildOrderLines(index: number): DispatchLogOrderLine[] {
  const templates = [
    { name: "UltraTech Cement OPC 53", sku: "MT-00102", unit: "Bags" },
    { name: "TMT Steel Rods 12mm", sku: "STL-TMT-12MM", unit: "Tons" },
    { name: "PPC Bricks Standard", sku: "BRK-PPC-STD", unit: "Units" },
  ];
  const t = templates[index % templates.length];
  return [
    {
      productId: `p-${index}`,
      name: t.name,
      sku: t.sku,
      quantity: 10 + (index % 5) * 5,
      unit: t.unit,
    },
  ];
}

function buildDispatchLog(
  index: number,
  overrides: Partial<DispatchLog> = {},
): DispatchLog {
  const hub = DISPATCH_LOG_HUB_OPTIONS[index % DISPATCH_LOG_HUB_OPTIONS.length];
  const customer = CUSTOMERS[index % CUSTOMERS.length];
  const address = ADDRESSES[index % ADDRESSES.length];
  const vehicle = VEHICLES[index % VEHICLES.length];
  const driver = DRIVERS[index % DRIVERS.length];
  const createdAt = hoursAgo(20 + index * 2);
  const orderLines = buildOrderLines(index);
  const orderValue = 45000 + index * 8500;

  return {
    id: `dl-${index}`,
    dispatchId: `DSP-${9100 + index}`,
    orderId: `ORD-${88500 + index}`,
    customerId: customer.id,
    customerName: customer.name,
    customerMobile: customer.mobile,
    deliveryAddress: address.address,
    pincode: address.pincode,
    hubId: hub.id,
    hubName: hub.name,
    vehicleId: vehicle.id,
    vehicleNumber: vehicle.number,
    vehicleType: vehicle.type,
    driverId: driver.id,
    driverName: driver.name,
    driverMobile: driver.mobile,
    dispatchTime: null,
    expectedDelivery: hoursFromNow(3 + (index % 5)),
    status: "READY_FOR_DISPATCH",
    isDelayed: false,
    lastUpdated: createdAt,
    deliveryNotes: "",
    orderLines,
    orderValue,
    timeline: [
      timelineEvent(
        "READY_FOR_DISPATCH",
        hub.name + " Supervisor",
        createdAt,
        "Order ready for dispatch at hub.",
        false,
      ),
    ],
    createdAt,
    ...overrides,
  };
}

export const DISPATCH_LOG_LIST: DispatchLog[] = [
  buildDispatchLog(1, {
    dispatchId: "DSP-9101",
    status: "READY_FOR_DISPATCH",
    dispatchTime: null,
    lastUpdated: hoursAgo(3),
  }),
  buildDispatchLog(2, {
    dispatchId: "DSP-9102",
    status: "READY_FOR_DISPATCH",
    timeline: [
      timelineEvent(
        "READY_FOR_DISPATCH",
        "Dispatch Supervisor",
        hoursAgo(4),
        "Materials staged and ready for dispatch.",
      ),
    ],
    lastUpdated: hoursAgo(4),
  }),
  buildDispatchLog(3, {
    dispatchId: "DSP-9103",
    status: "READY_FOR_DISPATCH",
    timeline: [
      timelineEvent(
        "READY_FOR_DISPATCH",
        "Loading Team",
        hoursAgo(3),
        "Vehicle loaded — awaiting dispatch confirmation.",
      ),
    ],
    lastUpdated: hoursAgo(3),
  }),
  buildDispatchLog(4, {
    dispatchId: "DSP-9104",
    status: "DISPATCHED",
    dispatchTime: hoursAgo(2),
    timeline: [
      timelineEvent(
        "READY_FOR_DISPATCH",
        "Supervisor",
        hoursAgo(12),
        undefined,
        false,
      ),
      timelineEvent(
        "DISPATCHED",
        "Dispatch Manager",
        hoursAgo(2),
        "Manual dispatch confirmed.",
      ),
    ],
    lastUpdated: hoursAgo(2),
  }),
  buildDispatchLog(5, {
    dispatchId: "DSP-9105",
    status: "REACHED_AREA",
    dispatchTime: hoursAgo(5),
    timeline: [
      timelineEvent("DISPATCHED", "Ops", hoursAgo(5), undefined),
      timelineEvent(
        "REACHED_AREA",
        "Rajesh Kumar",
        hoursAgo(1),
        "Driver reported arrival at customer locality.",
      ),
    ],
    lastUpdated: hoursAgo(1),
  }),
  buildDispatchLog(6, {
    dispatchId: "DSP-9106",
    status: "DELIVERED",
    dispatchTime: hoursAgo(8),
    deliveryNotes: "Delivered to site supervisor. POD collected.",
    timeline: [
      timelineEvent("DISPATCHED", "Ops", hoursAgo(8), undefined),
      timelineEvent(
        "REACHED_AREA",
        "Mohit Verma",
        hoursAgo(3),
        "Arrived at site area.",
      ),
      timelineEvent(
        "DELIVERED",
        "Mohit Verma",
        hoursAgo(1),
        "Customer signed delivery challan.",
      ),
    ],
    lastUpdated: hoursAgo(1),
  }),
  buildDispatchLog(7, {
    dispatchId: "DSP-9107",
    status: "DELIVERED",
    dispatchTime: hoursAgo(14),
    deliveryNotes: "Invoice generated. Order closed.",
    timeline: [
      timelineEvent("DISPATCHED", "Ops", hoursAgo(14), undefined),
      timelineEvent("DELIVERED", "Driver", hoursAgo(5), "Dispatch closed."),
    ],
    lastUpdated: hoursAgo(5),
  }),
  buildDispatchLog(8, {
    dispatchId: "DSP-9108",
    status: "DISPATCHED",
    dispatchTime: hoursAgo(1),
    isDelayed: true,
    expectedDelivery: hoursAgo(2),
    timeline: [
      timelineEvent(
        "DISPATCHED",
        "Ops",
        hoursAgo(1),
        "Delayed — traffic on NH-48 reported manually.",
      ),
    ],
    lastUpdated: hoursAgo(1),
  }),
  buildDispatchLog(9, {
    dispatchId: "DSP-9109",
    status: "READY_FOR_DISPATCH",
    vehicleId: null,
    vehicleNumber: null,
    vehicleType: null,
    driverId: null,
    driverName: null,
    driverMobile: null,
    timeline: [
      timelineEvent(
        "READY_FOR_DISPATCH",
        "Supervisor",
        hoursAgo(1),
        "Awaiting vehicle assignment.",
      ),
    ],
    lastUpdated: hoursAgo(1),
  }),
  buildDispatchLog(10, {
    dispatchId: "DSP-9110",
    status: "READY_FOR_DISPATCH",
    dispatchTime: null,
    timeline: [
      timelineEvent(
        "READY_FOR_DISPATCH",
        "Loading Team",
        hoursAgo(2),
        "Ready for dispatch confirmation.",
      ),
    ],
    lastUpdated: hoursAgo(2),
  }),
  ...Array.from({ length: 5 }, (_, i) =>
    buildDispatchLog(11 + i, {
      dispatchId: `DSP-${9111 + i}`,
      status: ([
        "READY_FOR_DISPATCH",
        "READY_FOR_DISPATCH",
        "DISPATCHED",
        "REACHED_AREA",
        "DELIVERED",
      ][i] ?? "READY_FOR_DISPATCH") as DispatchLogStatus,
      dispatchTime: i >= 2 ? hoursAgo(3 + i) : null,
    }),
  ),
];

export function getDispatchAssignmentStatusLabel(
  item: DispatchLog,
): "Ready" | "Assigned" {
  return item.status === "ASSIGNED" ? "Assigned" : "Ready";
}

export function isAssignableDispatchLog(item: DispatchLog): boolean {
  return item.status === "READY_FOR_DISPATCH";
}

export function isAssignedDispatchLog(item: DispatchLog): boolean {
  return item.status === "ASSIGNED";
}

const IN_PROGRESS_STATUSES: DispatchLogStatus[] = [
  "READY_FOR_DISPATCH",
  "ASSIGNED",
  "DISPATCHED",
  "REACHED_AREA",
];

export function computeDispatchLogStats(
  items: DispatchLog[],
  ref: Date = now,
): DispatchLogStats {
  return {
    todaysDispatch: items.filter(
      (item) => item.dispatchTime && isSameDay(item.dispatchTime, ref),
    ).length,
    inProgress: items.filter((item) =>
      IN_PROGRESS_STATUSES.includes(item.status),
    ).length,
    delivered: items.filter((item) => item.status === "DELIVERED").length,
    delayed: items.filter((item) => item.isDelayed).length,
  };
}

function matchesFilters(
  item: DispatchLog,
  filters: Partial<DispatchLogFilters>,
): boolean {
  if (
    filters.hubId &&
    filters.hubId !== "all" &&
    item.hubId !== filters.hubId
  ) {
    return false;
  }
  if (filters.customer?.trim()) {
    if (
      !item.customerName
        .toLowerCase()
        .includes(filters.customer.trim().toLowerCase())
    ) {
      return false;
    }
  }
  if (filters.vehicle?.trim()) {
    const q = filters.vehicle.trim().toLowerCase();
    if (!(item.vehicleNumber ?? "").toLowerCase().includes(q)) return false;
  }
  if (filters.driver?.trim()) {
    const q = filters.driver.trim().toLowerCase();
    if (!(item.driverName ?? "").toLowerCase().includes(q)) return false;
  }
  if (filters.status && filters.status !== "all") {
    const operationalFilters = Object.keys(
      DISPATCH_LOG_OPERATIONAL_FILTER_LABELS,
    ) as DispatchLogOperationalFilter[];

    if (
      operationalFilters.includes(
        filters.status as DispatchLogOperationalFilter,
      )
    ) {
      if (
        !matchesDispatchOperationalFilter(
          item,
          filters.status as DispatchLogOperationalFilter,
        )
      ) {
        return false;
      }
    } else if (item.status !== filters.status) {
      return false;
    }
  }
  if (filters.date && !isSameDay(item.createdAt, new Date(filters.date))) {
    return false;
  }
  return true;
}

export function filterDispatchLogs(
  items: DispatchLog[],
  params: DispatchLogQueryParams,
): DispatchLog[] {
  const filters = params.filters ?? {};
  const search = params.search?.trim().toLowerCase();

  return items
    .filter((item) => matchesFilters(item, filters))
    .filter((item) => {
      if (!search) return true;
      const haystack = [
        item.dispatchId,
        item.orderId,
        item.customerName,
        item.hubName,
        item.vehicleNumber,
        item.driverName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    })
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    );
}

export function paginateDispatchLogs(
  items: DispatchLog[],
  page: number,
  limit: number,
): { data: DispatchLog[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

export function fetchDispatchLogs(
  items: DispatchLog[],
  params: DispatchLogQueryParams = {},
): {
  data: DispatchLog[];
  meta: PaginationMeta;
  stats: DispatchLogStats;
} {
  const page = params.page ?? 1;
  const limit = params.limit ?? DISPATCH_LOG_PAGE_SIZE;
  const filtered = filterDispatchLogs(items, params);
  const paginated = paginateDispatchLogs(filtered, page, limit);

  return {
    ...paginated,
    stats: computeDispatchLogStats(items),
  };
}

export function formatDispatchLogDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDispatchLogCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
