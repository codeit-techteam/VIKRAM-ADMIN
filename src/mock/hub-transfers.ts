import type { PaginationMeta } from "@/types/api";
import type {
  HubTransfer,
  HubTransferFilters,
  HubTransferFleetDriver,
  HubTransferFleetVehicle,
  HubTransferPriority,
  HubTransferProduct,
  HubTransferQueryParams,
  HubTransferStats,
  HubTransferStatus,
  HubTransferTimelineEvent,
  HubTransferTimelineKey,
} from "@/types/hub-transfer.types";

export const HUB_TRANSFER_PAGE_SIZE = 10;

export const EMPTY_HUB_TRANSFER_FILTERS: HubTransferFilters = {
  hubId: "all",
  customer: "",
  orderId: "",
  driver: "",
  vehicle: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
  priority: "all",
};

const HUB_OPTIONS = [
  {
    id: "hub-gurgaon-north",
    name: "Gurgaon North",
    manager: "Amit Sharma",
    counter: "Dispatch Bay A",
  },
  {
    id: "hub-noida-62",
    name: "Noida Sector 62",
    manager: "Sneha Reddy",
    counter: "Dispatch Bay B",
  },
  {
    id: "hub-manesar",
    name: "Manesar Plant",
    manager: "Vijay Kumar",
    counter: "Loading Dock 2",
  },
  {
    id: "hub-dwarka",
    name: "Dwarka Expressway Site",
    manager: "Deepak Gupta",
    counter: "Dispatch Bay C",
  },
  {
    id: "hub-gurgaon-west",
    name: "Gurgaon West",
    manager: "Priya Singh",
    counter: "Dispatch Bay D",
  },
] as const;

const PRODUCT_TEMPLATES = [
  {
    name: "UltraTech Cement OPC 53",
    sku: "MT-00102",
    unitPrice: 410,
    weightKg: 50,
  },
  {
    name: "TMT Steel Rods 12mm",
    sku: "STL-TMT-12MM-001",
    unitPrice: 62000,
    weightKg: 1000,
  },
  {
    name: "PPC Bricks Standard",
    sku: "BRK-PPC-STD",
    unitPrice: 8,
    weightKg: 2.8,
  },
  {
    name: "River Sand Fine Grade",
    sku: "SND-RVR-FN",
    unitPrice: 1800,
    weightKg: 1600,
  },
  {
    name: "Industrial Paint White",
    sku: "PNT-IND-WHT",
    unitPrice: 320,
    weightKg: 20,
  },
] as const;

const CUSTOMERS = [
  {
    id: "cust-101",
    name: "Sharma Construction Pvt Ltd",
    mobile: "+91 98100 12345",
  },
  {
    id: "cust-102",
    name: "Patel Builders",
    mobile: "+91 98100 23456",
  },
  {
    id: "cust-103",
    name: "Gupta Infra Solutions",
    mobile: "+91 98100 34567",
  },
  {
    id: "cust-104",
    name: "Reddy Housing",
    mobile: "+91 98100 45678",
  },
  {
    id: "cust-105",
    name: "Khan Contractors",
    mobile: "+91 98100 56789",
  },
  {
    id: "cust-106",
    name: "Mehta Realty",
    mobile: "+91 98100 67890",
  },
  {
    id: "cust-107",
    name: "Singh Developers",
    mobile: "+91 98100 78901",
  },
  {
    id: "cust-108",
    name: "Agarwal Constructions",
    mobile: "+91 98100 89012",
  },
] as const;

const ADDRESSES = [
  { address: "Plot 45, Industrial Area, Ghaziabad", pincode: "201001" },
  { address: "B-12, Saket, New Delhi", pincode: "110017" },
  { address: "Tower B, Sector 62, Noida", pincode: "201309" },
  { address: "DLF Phase 3, Gurgaon", pincode: "122002" },
  { address: "Sector 21C, Faridabad", pincode: "121001" },
  { address: "Greater Kailash II, New Delhi", pincode: "110048" },
  { address: "Vaishali, Ghaziabad", pincode: "201010" },
  { address: "Sector 18, Noida", pincode: "201301" },
] as const;

const now = new Date();
const hoursAgo = (h: number) =>
  new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const hoursFromNow = (h: number) =>
  new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

function isSameDay(isoA: string, isoB: Date = now): boolean {
  const a = new Date(isoA);
  return (
    a.getFullYear() === isoB.getFullYear() &&
    a.getMonth() === isoB.getMonth() &&
    a.getDate() === isoB.getDate()
  );
}

function buildProducts(index: number): HubTransferProduct[] {
  const template = PRODUCT_TEMPLATES[index % PRODUCT_TEMPLATES.length];
  const qty = 10 + (index % 8) * 5;
  const reserved = qty;

  return [
    {
      productId: `prod-${index}`,
      name: template.name,
      sku: template.sku,
      quantity: qty,
      reservedQuantity: reserved,
      weightKg: template.weightKg,
      unitPrice: template.unitPrice,
      amount: qty * template.unitPrice,
    },
    ...(index % 3 === 0
      ? [
          {
            productId: `prod-${index}-b`,
            name: PRODUCT_TEMPLATES[(index + 1) % PRODUCT_TEMPLATES.length]
              .name,
            sku: PRODUCT_TEMPLATES[(index + 1) % PRODUCT_TEMPLATES.length].sku,
            quantity: 5,
            reservedQuantity: 5,
            weightKg:
              PRODUCT_TEMPLATES[(index + 1) % PRODUCT_TEMPLATES.length]
                .weightKg,
            unitPrice:
              PRODUCT_TEMPLATES[(index + 1) % PRODUCT_TEMPLATES.length]
                .unitPrice,
            amount:
              5 *
              PRODUCT_TEMPLATES[(index + 1) % PRODUCT_TEMPLATES.length]
                .unitPrice,
          },
        ]
      : []),
  ];
}

function timelineEvent(
  key: HubTransferTimelineKey,
  title: string,
  updatedBy: string,
  timestamp: string,
  completed: boolean,
  remarks?: string,
): HubTransferTimelineEvent {
  return {
    id: `${key}-${timestamp}`,
    key,
    title,
    updatedBy,
    timestamp,
    remarks,
    completed,
  };
}

function buildBaseTimeline(
  orderDate: string,
  acceptedBy: string,
): HubTransferTimelineEvent[] {
  const reservedAt = new Date(orderDate);
  reservedAt.setMinutes(reservedAt.getMinutes() + 18);

  return [
    timelineEvent(
      "ORDER_ACCEPTED",
      "Order Accepted",
      acceptedBy,
      orderDate,
      true,
      "Nearest hub auto-assigned by routing engine.",
    ),
    timelineEvent(
      "INVENTORY_RESERVED",
      "Inventory Reserved",
      "Inventory System",
      reservedAt.toISOString(),
      true,
      "Stock reserved at dispatch counter.",
    ),
  ];
}

function buildTransfer(
  index: number,
  overrides: Partial<HubTransfer> = {},
): HubTransfer {
  const hub = HUB_OPTIONS[index % HUB_OPTIONS.length];
  const customer = CUSTOMERS[index % CUSTOMERS.length];
  const address = ADDRESSES[index % ADDRESSES.length];
  const products = buildProducts(index);
  const totalAmount = products.reduce((sum, item) => sum + item.amount, 0);
  const totalWeightKg = products.reduce(
    (sum, item) => sum + item.weightKg * item.quantity,
    0,
  );
  const priorities: HubTransferPriority[] = [
    "critical",
    "high",
    "medium",
    "low",
  ];
  const priority = priorities[index % priorities.length];
  const orderDate = hoursAgo(24 + index * 3);
  const transferId = `HT-${2600 + index}`;
  const orderId = `ORD-${88400 + index}`;

  return {
    id: `ht-${index}`,
    transferId,
    orderId,
    customerId: customer.id,
    customerName: customer.name,
    customerMobile: customer.mobile,
    deliveryAddress: address.address,
    pincode: address.pincode,
    orderValue: totalAmount,
    orderDate,
    hubId: hub.id,
    hubName: hub.name,
    hubManager: hub.manager,
    dispatchCounter: hub.counter,
    reservedInventoryLabel: products
      .map((p) => `${p.reservedQuantity} × ${p.name}`)
      .join(", "),
    vehicleId: null,
    vehicleNumber: null,
    vehicleType: null,
    vehicleCapacityKg: null,
    driverId: null,
    driverName: null,
    driverMobile: null,
    licenseStatus: null,
    dispatchTime: null,
    expectedDelivery: hoursFromNow(4 + (index % 6)),
    estimatedArrival: null,
    status: "PENDING_DISPATCH",
    priority,
    isDelayed: false,
    products,
    totalWeightKg,
    totalAmount,
    timeline: buildBaseTimeline(orderDate, hub.manager),
    createdAt: orderDate,
    ...overrides,
  };
}

export const HUB_TRANSFER_FLEET_VEHICLES: HubTransferFleetVehicle[] = [
  {
    id: "hfv-001",
    vehicleNumber: "HR-55-AN-1024",
    vehicleType: "10-Ton Trailer",
    capacityKg: 10000,
    assignedHub: "Gurgaon North",
    currentTrips: 1,
    status: "assigned",
  },
  {
    id: "hfv-002",
    vehicleNumber: "DL-01-AB-4421",
    vehicleType: "8-Ton Truck",
    capacityKg: 8000,
    assignedHub: "Noida Sector 62",
    currentTrips: 0,
    status: "available",
  },
  {
    id: "hfv-003",
    vehicleNumber: "HR-26-BK-7783",
    vehicleType: "12-Ton Flatbed",
    capacityKg: 12000,
    assignedHub: "Manesar Plant",
    currentTrips: 2,
    status: "running",
  },
  {
    id: "hfv-004",
    vehicleNumber: "UP-16-CD-3309",
    vehicleType: "6-Ton LCV",
    capacityKg: 6000,
    assignedHub: "Dwarka Expressway Site",
    currentTrips: 0,
    status: "available",
  },
  {
    id: "hfv-005",
    vehicleNumber: "HR-12-EF-5512",
    vehicleType: "15-Ton Trailer",
    capacityKg: 15000,
    assignedHub: "Gurgaon West",
    currentTrips: 1,
    status: "assigned",
  },
  {
    id: "hfv-006",
    vehicleNumber: "DL-05-NP-6677",
    vehicleType: "6-Ton LCV",
    capacityKg: 6500,
    assignedHub: "Gurgaon North",
    currentTrips: 0,
    status: "available",
  },
  {
    id: "hfv-007",
    vehicleNumber: "HR-10-LM-3345",
    vehicleType: "12-Ton Flatbed",
    capacityKg: 12000,
    assignedHub: "Noida Sector 62",
    currentTrips: 1,
    status: "available",
  },
];

export const HUB_TRANSFER_FLEET_DRIVERS: HubTransferFleetDriver[] = [
  {
    id: "hfd-001",
    name: "Rajesh Kumar",
    mobile: "+91 98765 43210",
    employeeId: "DRV-1001",
    assignedHub: "Gurgaon North",
    licenseExpiry: hoursFromNow(365 * 24),
    licenseStatus: "valid",
    availability: "on_trip",
    tripsToday: 2,
  },
  {
    id: "hfd-002",
    name: "Mohit Verma",
    mobile: "+91 98765 43211",
    employeeId: "DRV-1002",
    assignedHub: "Noida Sector 62",
    licenseExpiry: hoursFromNow(90 * 24),
    licenseStatus: "valid",
    availability: "available",
    tripsToday: 1,
  },
  {
    id: "hfd-003",
    name: "Suresh Yadav",
    mobile: "+91 98765 43212",
    employeeId: "DRV-1003",
    assignedHub: "Manesar Plant",
    licenseExpiry: hoursFromNow(20 * 24),
    licenseStatus: "expiring",
    availability: "on_trip",
    tripsToday: 3,
  },
  {
    id: "hfd-004",
    name: "Amit Singh",
    mobile: "+91 98765 43213",
    employeeId: "DRV-1004",
    assignedHub: "Gurgaon West",
    licenseExpiry: hoursFromNow(400 * 24),
    licenseStatus: "valid",
    availability: "available",
    tripsToday: 0,
  },
  {
    id: "hfd-005",
    name: "Anil Chauhan",
    mobile: "+91 98765 43214",
    employeeId: "DRV-1005",
    assignedHub: "Dwarka Expressway Site",
    licenseExpiry: hoursFromNow(-5 * 24),
    licenseStatus: "expired",
    availability: "on_leave",
    tripsToday: 0,
  },
  {
    id: "hfd-006",
    name: "Ramesh Patel",
    mobile: "+91 98765 43215",
    employeeId: "DRV-1006",
    assignedHub: "Noida Sector 62",
    licenseExpiry: hoursFromNow(200 * 24),
    licenseStatus: "valid",
    availability: "available",
    tripsToday: 2,
  },
];

export const HUB_TRANSFER_LIST: HubTransfer[] = [
  buildTransfer(1, {
    transferId: "HT-2601",
    orderId: "ORD-88401",
    status: "PENDING_DISPATCH",
    expectedDelivery: hoursFromNow(5),
    isDelayed: false,
  }),
  buildTransfer(2, {
    transferId: "HT-2602",
    orderId: "ORD-88402",
    status: "PENDING_DISPATCH",
    priority: "critical",
    expectedDelivery: hoursAgo(1),
    isDelayed: true,
  }),
  buildTransfer(3, {
    transferId: "HT-2603",
    orderId: "ORD-88403",
    status: "VEHICLE_ASSIGNED",
    vehicleId: "hfv-002",
    vehicleNumber: "DL-01-AB-4421",
    vehicleType: "8-Ton Truck",
    vehicleCapacityKg: 8000,
    timeline: [
      ...buildBaseTimeline(hoursAgo(10), "Sneha Reddy"),
      timelineEvent(
        "VEHICLE_ASSIGNED",
        "Vehicle Assigned",
        "Dispatch Supervisor",
        hoursAgo(6),
        true,
        "DL-01-AB-4421 assigned for Noida delivery route.",
      ),
    ],
  }),
  buildTransfer(4, {
    transferId: "HT-2604",
    orderId: "ORD-88404",
    status: "DRIVER_ASSIGNED",
    vehicleId: "hfv-006",
    vehicleNumber: "DL-05-NP-6677",
    vehicleType: "6-Ton LCV",
    vehicleCapacityKg: 6500,
    driverId: "hfd-004",
    driverName: "Amit Singh",
    driverMobile: "+91 98765 43213",
    licenseStatus: "valid",
    timeline: [
      ...buildBaseTimeline(hoursAgo(12), "Amit Sharma"),
      timelineEvent(
        "VEHICLE_ASSIGNED",
        "Vehicle Assigned",
        "Dispatch Supervisor",
        hoursAgo(8),
        true,
      ),
      timelineEvent(
        "DRIVER_ASSIGNED",
        "Driver Assigned",
        "Fleet Manager",
        hoursAgo(5),
        true,
        "Amit Singh assigned with valid license.",
      ),
    ],
  }),
  buildTransfer(5, {
    transferId: "HT-2605",
    orderId: "ORD-88405",
    status: "PACKED",
    vehicleId: "hfv-004",
    vehicleNumber: "UP-16-CD-3309",
    vehicleType: "6-Ton LCV",
    vehicleCapacityKg: 6000,
    driverId: "hfd-005",
    driverName: "Anil Chauhan",
    driverMobile: "+91 98765 43214",
    licenseStatus: "expired",
    timeline: [
      ...buildBaseTimeline(hoursAgo(14), "Deepak Gupta"),
      timelineEvent(
        "VEHICLE_ASSIGNED",
        "Vehicle Assigned",
        "Ops",
        hoursAgo(9),
        true,
      ),
      timelineEvent(
        "DRIVER_ASSIGNED",
        "Driver Assigned",
        "Ops",
        hoursAgo(7),
        true,
      ),
      timelineEvent(
        "PACKED",
        "Packed",
        "Warehouse Packer",
        hoursAgo(3),
        true,
        "Materials packed and labelled.",
      ),
    ],
  }),
  buildTransfer(6, {
    transferId: "HT-2606",
    orderId: "ORD-88406",
    status: "LOADED",
    vehicleId: "hfv-003",
    vehicleNumber: "HR-26-BK-7783",
    vehicleType: "12-Ton Flatbed",
    vehicleCapacityKg: 12000,
    driverId: "hfd-003",
    driverName: "Suresh Yadav",
    driverMobile: "+91 98765 43212",
    licenseStatus: "expiring",
    timeline: [
      ...buildBaseTimeline(hoursAgo(16), "Vijay Kumar"),
      timelineEvent(
        "VEHICLE_ASSIGNED",
        "Vehicle Assigned",
        "Ops",
        hoursAgo(11),
        true,
      ),
      timelineEvent(
        "DRIVER_ASSIGNED",
        "Driver Assigned",
        "Ops",
        hoursAgo(9),
        true,
      ),
      timelineEvent("PACKED", "Packed", "Packer", hoursAgo(5), true),
      timelineEvent("LOADED", "Loaded", "Loading Team", hoursAgo(2), true),
    ],
  }),
  buildTransfer(7, {
    transferId: "HT-2607",
    orderId: "ORD-88407",
    status: "DISPATCHED",
    dispatchTime: hoursAgo(2),
    vehicleId: "hfv-001",
    vehicleNumber: "HR-55-AN-1024",
    vehicleType: "10-Ton Trailer",
    vehicleCapacityKg: 10000,
    driverId: "hfd-001",
    driverName: "Rajesh Kumar",
    driverMobile: "+91 98765 43210",
    licenseStatus: "valid",
    expectedDelivery: hoursFromNow(2),
    timeline: [
      ...buildBaseTimeline(hoursAgo(20), "Amit Sharma"),
      timelineEvent(
        "VEHICLE_ASSIGNED",
        "Vehicle Assigned",
        "Ops",
        hoursAgo(14),
        true,
      ),
      timelineEvent(
        "DRIVER_ASSIGNED",
        "Driver Assigned",
        "Ops",
        hoursAgo(12),
        true,
      ),
      timelineEvent("PACKED", "Packed", "Packer", hoursAgo(6), true),
      timelineEvent("LOADED", "Loaded", "Loading Team", hoursAgo(4), true),
      timelineEvent(
        "DISPATCHED",
        "Dispatched",
        "Dispatch Manager",
        hoursAgo(2),
        true,
        "Vehicle departed from Gurgaon North hub.",
      ),
    ],
  }),
  buildTransfer(8, {
    transferId: "HT-2608",
    orderId: "ORD-88408",
    status: "REACHED_CUSTOMER_AREA",
    dispatchTime: hoursAgo(4),
    vehicleId: "hfv-005",
    vehicleNumber: "HR-12-EF-5512",
    vehicleType: "15-Ton Trailer",
    vehicleCapacityKg: 15000,
    driverId: "hfd-004",
    driverName: "Amit Singh",
    driverMobile: "+91 98765 43213",
    licenseStatus: "valid",
    expectedDelivery: hoursFromNow(1),
    timeline: [
      ...buildBaseTimeline(hoursAgo(22), "Priya Singh"),
      timelineEvent("DISPATCHED", "Dispatched", "Ops", hoursAgo(4), true),
      timelineEvent(
        "REACHED_CUSTOMER_AREA",
        "Reached Customer Area",
        "Rajesh Kumar (GPS)",
        hoursAgo(1),
        true,
        "Driver reached customer locality.",
      ),
    ],
  }),
  buildTransfer(9, {
    transferId: "HT-2609",
    orderId: "ORD-88409",
    status: "DELIVERED",
    dispatchTime: hoursAgo(8),
    vehicleId: "hfv-007",
    vehicleNumber: "HR-10-LM-3345",
    vehicleType: "12-Ton Flatbed",
    vehicleCapacityKg: 12000,
    driverId: "hfd-006",
    driverName: "Ramesh Patel",
    driverMobile: "+91 98765 43215",
    licenseStatus: "valid",
    expectedDelivery: hoursAgo(1),
    timeline: [
      ...buildBaseTimeline(hoursAgo(26), "Sneha Reddy"),
      timelineEvent("DISPATCHED", "Dispatched", "Ops", hoursAgo(8), true),
      timelineEvent(
        "DELIVERED",
        "Delivered",
        "Ramesh Patel",
        hoursAgo(1),
        true,
        "POD captured with customer signature.",
      ),
    ],
  }),
  buildTransfer(10, {
    transferId: "HT-2610",
    orderId: "ORD-88410",
    status: "COMPLETED",
    dispatchTime: hoursAgo(12),
    vehicleId: "hfv-002",
    vehicleNumber: "DL-01-AB-4421",
    vehicleType: "8-Ton Truck",
    vehicleCapacityKg: 8000,
    driverId: "hfd-002",
    driverName: "Mohit Verma",
    driverMobile: "+91 98765 43211",
    licenseStatus: "valid",
    expectedDelivery: hoursAgo(4),
    timeline: [
      ...buildBaseTimeline(hoursAgo(30), "Sneha Reddy"),
      timelineEvent("DELIVERED", "Delivered", "Mohit Verma", hoursAgo(5), true),
      timelineEvent(
        "COMPLETED",
        "Completed",
        "System",
        hoursAgo(4),
        true,
        "Invoice generated and order closed.",
      ),
    ],
  }),
  buildTransfer(11, {
    transferId: "HT-2611",
    orderId: "ORD-88411",
    status: "CANCELLED",
    expectedDelivery: hoursFromNow(8),
    timeline: [
      ...buildBaseTimeline(hoursAgo(6), "Deepak Gupta"),
      timelineEvent(
        "ORDER_ACCEPTED",
        "Cancelled",
        "Customer Executive",
        hoursAgo(2),
        true,
        "Customer cancelled before dispatch.",
      ),
    ],
  }),
  buildTransfer(12, {
    transferId: "HT-2612",
    orderId: "ORD-88412",
    status: "DISPATCHED",
    dispatchTime: hoursAgo(1),
    priority: "critical",
    vehicleId: "hfv-003",
    vehicleNumber: "HR-26-BK-7783",
    vehicleType: "12-Ton Flatbed",
    vehicleCapacityKg: 12000,
    driverId: "hfd-003",
    driverName: "Suresh Yadav",
    driverMobile: "+91 98765 43212",
    licenseStatus: "expiring",
    expectedDelivery: hoursAgo(2),
    isDelayed: true,
    timeline: [
      ...buildBaseTimeline(hoursAgo(18), "Vijay Kumar"),
      timelineEvent(
        "DISPATCHED",
        "Dispatched",
        "Ops",
        hoursAgo(1),
        true,
        "Delayed due to traffic on NH-48.",
      ),
    ],
  }),
  ...Array.from({ length: 6 }, (_, i) =>
    buildTransfer(13 + i, {
      transferId: `HT-${2613 + i}`,
      orderId: `ORD-${88413 + i}`,
      status: i % 2 === 0 ? "PENDING_DISPATCH" : "VEHICLE_ASSIGNED",
      vehicleId: i % 2 === 1 ? "hfv-002" : null,
      vehicleNumber: i % 2 === 1 ? "DL-01-AB-4421" : null,
      vehicleType: i % 2 === 1 ? "8-Ton Truck" : null,
      vehicleCapacityKg: i % 2 === 1 ? 8000 : null,
    }),
  ),
];

export const HUB_TRANSFER_STATUS_LABELS: Record<HubTransferStatus, string> = {
  PENDING_DISPATCH: "Pending Dispatch",
  VEHICLE_ASSIGNED: "Vehicle Assigned",
  DRIVER_ASSIGNED: "Driver Assigned",
  PACKED: "Packed",
  LOADED: "Loaded",
  DISPATCHED: "Dispatched",
  REACHED_CUSTOMER_AREA: "Reached Customer Area",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const HUB_TRANSFER_STATUS_OPTIONS = Object.entries(
  HUB_TRANSFER_STATUS_LABELS,
).map(([value, label]) => ({
  value: value as HubTransferStatus,
  label,
}));

export function computeHubTransferStats(
  items: HubTransfer[],
  referenceDate: Date = now,
): HubTransferStats {
  const inTransitStatuses: HubTransferStatus[] = [
    "DISPATCHED",
    "REACHED_CUSTOMER_AREA",
  ];

  return {
    todaysDispatches: items.filter(
      (item) =>
        item.dispatchTime && isSameDay(item.dispatchTime, referenceDate),
    ).length,
    pendingVehicleAssignment: items.filter(
      (item) =>
        item.status === "PENDING_DISPATCH" ||
        (item.status === "PACKED" && !item.vehicleId),
    ).length,
    inTransit: items.filter((item) => inTransitStatuses.includes(item.status))
      .length,
    deliveredToday: items.filter(
      (item) =>
        (item.status === "DELIVERED" || item.status === "COMPLETED") &&
        item.timeline.some(
          (event) =>
            (event.key === "DELIVERED" || event.key === "COMPLETED") &&
            isSameDay(event.timestamp, referenceDate),
        ),
    ).length,
    delayedDeliveries: items.filter((item) => item.isDelayed).length,
  };
}

export function collectHubNames(items: HubTransfer[]): string[] {
  return Array.from(new Set(items.map((item) => item.hubName))).sort();
}

function matchesFilters(
  item: HubTransfer,
  filters: Partial<HubTransferFilters>,
): boolean {
  if (filters.hubId && filters.hubId !== "all") {
    if (item.hubId !== filters.hubId) return false;
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

  if (filters.orderId?.trim()) {
    if (
      !item.orderId.toLowerCase().includes(filters.orderId.trim().toLowerCase())
    ) {
      return false;
    }
  }

  if (filters.driver?.trim()) {
    const query = filters.driver.trim().toLowerCase();
    if (!(item.driverName ?? "").toLowerCase().includes(query)) return false;
  }

  if (filters.vehicle?.trim()) {
    const query = filters.vehicle.trim().toLowerCase();
    if (!(item.vehicleNumber ?? "").toLowerCase().includes(query)) return false;
  }

  if (filters.status && filters.status !== "all") {
    if (item.status !== filters.status) return false;
  }

  if (filters.priority && filters.priority !== "all") {
    if (item.priority !== filters.priority) return false;
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    from.setHours(0, 0, 0, 0);
    if (new Date(item.createdAt) < from) return false;
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    if (new Date(item.createdAt) > to) return false;
  }

  return true;
}

export function filterHubTransfers(
  items: HubTransfer[],
  params: HubTransferQueryParams,
): HubTransfer[] {
  const filters = params.filters ?? {};

  return items
    .filter((item) => matchesFilters(item, filters))
    .filter((item) => {
      if (!params.search?.trim()) return true;
      const query = params.search.trim().toLowerCase();
      const haystack = [
        item.transferId,
        item.orderId,
        item.customerName,
        item.customerMobile,
        item.hubName,
        item.driverName,
        item.vehicleNumber,
        item.deliveryAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function paginateHubTransfers(
  items: HubTransfer[],
  page: number,
  limit: number,
): { data: HubTransfer[]; meta: PaginationMeta } {
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

export function fetchHubTransfers(
  items: HubTransfer[],
  params: HubTransferQueryParams = {},
): {
  data: HubTransfer[];
  meta: PaginationMeta;
  stats: HubTransferStats;
} {
  const page = params.page ?? 1;
  const limit = params.limit ?? HUB_TRANSFER_PAGE_SIZE;
  const filtered = filterHubTransfers(items, params);
  const paginated = paginateHubTransfers(filtered, page, limit);

  return {
    ...paginated,
    stats: computeHubTransferStats(items),
  };
}

export function formatHubTransferDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatHubTransferCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getHubTransferById(
  items: HubTransfer[],
  id: string,
): HubTransfer | undefined {
  return items.find((item) => item.id === id || item.transferId === id);
}

export function getAvailableVehiclesForHub(
  vehicles: HubTransferFleetVehicle[],
  hubName: string,
): HubTransferFleetVehicle[] {
  return vehicles.filter(
    (vehicle) =>
      vehicle.assignedHub === hubName &&
      (vehicle.status === "available" || vehicle.status === "assigned"),
  );
}

export function getAvailableDriversForHub(
  drivers: HubTransferFleetDriver[],
  hubName: string,
): HubTransferFleetDriver[] {
  return drivers.filter(
    (driver) =>
      driver.assignedHub === hubName &&
      driver.availability !== "on_leave" &&
      driver.licenseStatus !== "expired",
  );
}

export const HUB_TRANSFER_HUB_OPTIONS = HUB_OPTIONS.map((hub) => ({
  id: hub.id,
  name: hub.name,
}));
