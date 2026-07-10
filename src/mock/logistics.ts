import type {
  CriticalShipment,
  CustomerDelivery,
  CustomerDeliveryFilters,
  DispatchFilters,
  DispatchRecord,
  DriverFilters,
  LogisticsDashboardStats,
  LogisticsDriver,
  LogisticsVehicle,
  MaintenanceFilters,
  MaintenanceRecord,
  PaginationMeta,
  ShipmentTimeline,
  TimelineStage,
  VehicleFilters,
  WarehouseShipment,
  WarehouseShipmentFilters,
} from "@/types/logistics.types";

export const LOGISTICS_PAGE_SIZE = 8;
export const LOGISTICS_WAREHOUSES = [
  "Gurgaon Central Warehouse",
  "Noida Central Warehouse",
  "Faridabad Central Warehouse",
  "Mumbai Central Warehouse",
  "Bangalore Central Warehouse",
  "Kolkata Central Warehouse",
];
export const LOGISTICS_HUBS = [
  "South Delhi Hub",
  "Noida Sector 62 Hub",
  "Gurgaon Sector 14 Hub",
  "Faridabad Hub",
  "Ghaziabad Hub",
  "Andheri Hub",
  "Thane Hub",
  "Navi Mumbai Hub",
  "Whitefield Hub",
  "Electronic City Hub",
  "Yelahanka Hub",
  "Salt Lake Hub",
  "Howrah Hub",
  "New Town Hub",
];

export const EMPTY_WAREHOUSE_FILTERS: WarehouseShipmentFilters = {
  search: "",
  warehouse: "all",
  destinationHub: "all",
  priority: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
};

export const EMPTY_CUSTOMER_FILTERS: CustomerDeliveryFilters = {
  search: "",
  hub: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
};

export const EMPTY_VEHICLE_FILTERS: VehicleFilters = {
  search: "",
  status: "all",
  warehouse: "all",
  hub: "all",
};

export const EMPTY_DRIVER_FILTERS: DriverFilters = {
  search: "",
  status: "all",
  hub: "all",
};

export const EMPTY_DISPATCH_FILTERS: DispatchFilters = {
  search: "",
  status: "all",
  source: "all",
};

export const EMPTY_MAINTENANCE_FILTERS: MaintenanceFilters = {
  search: "",
  status: "all",
};

const now = new Date();
const hoursAgo = (h: number) =>
  new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const hoursFromNow = (h: number) =>
  new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
const daysFromNow = (d: number) =>
  new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

export const SEED_VEHICLES: LogisticsVehicle[] = [
  {
    id: "lv-001",
    vehicleNumber: "HR-55-AN-1024",
    vehicleType: "10-Ton Trailer",
    capacityKg: 10000,
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedHub: "Gurgaon Sector 14 Hub",
    assignedDriverId: "ld-001",
    assignedDriverName: "Rajesh Kumar",
    currentShipmentId: "WS-2026-0142",
    fuelType: "Diesel",
    registrationDate: "2022-03-15",
    insuranceExpiry: daysFromNow(120),
    fitnessExpiry: daysFromNow(90),
    status: "running",
  },
  {
    id: "lv-002",
    vehicleNumber: "DL-01-AB-4421",
    vehicleType: "8-Ton Truck",
    capacityKg: 8000,
    assignedWarehouse: "Noida Central Warehouse",
    assignedHub: "Noida Sector 62 Hub",
    assignedDriverId: null,
    assignedDriverName: null,
    currentShipmentId: null,
    fuelType: "Diesel",
    registrationDate: "2021-08-20",
    insuranceExpiry: daysFromNow(200),
    fitnessExpiry: daysFromNow(150),
    status: "available",
  },
  {
    id: "lv-003",
    vehicleNumber: "HR-26-BK-7783",
    vehicleType: "12-Ton Flatbed",
    capacityKg: 12000,
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedHub: "South Delhi Hub",
    assignedDriverId: "ld-003",
    assignedDriverName: "Suresh Yadav",
    currentShipmentId: "WS-2026-0138",
    fuelType: "Diesel",
    registrationDate: "2020-11-10",
    insuranceExpiry: daysFromNow(60),
    fitnessExpiry: daysFromNow(45),
    status: "loading",
  },
  {
    id: "lv-004",
    vehicleNumber: "UP-16-CD-3309",
    vehicleType: "6-Ton LCV",
    capacityKg: 6000,
    assignedWarehouse: "Faridabad Central Warehouse",
    assignedHub: "Faridabad Hub",
    assignedDriverId: null,
    assignedDriverName: null,
    currentShipmentId: null,
    fuelType: "CNG",
    registrationDate: "2023-01-05",
    insuranceExpiry: daysFromNow(300),
    fitnessExpiry: daysFromNow(280),
    status: "maintenance",
  },
  {
    id: "lv-005",
    vehicleNumber: "HR-12-EF-5512",
    vehicleType: "15-Ton Trailer",
    capacityKg: 15000,
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedHub: "Ghaziabad Hub",
    assignedDriverId: "ld-005",
    assignedDriverName: "Amit Singh",
    currentShipmentId: "CD-2026-0891",
    fuelType: "Diesel",
    registrationDate: "2019-06-22",
    insuranceExpiry: daysFromNow(30),
    fitnessExpiry: daysFromNow(25),
    status: "running",
  },
  {
    id: "lv-006",
    vehicleNumber: "DL-09-GH-2290",
    vehicleType: "10-Ton Trailer",
    capacityKg: 10000,
    assignedWarehouse: "Noida Central Warehouse",
    assignedHub: "Noida Sector 62 Hub",
    assignedDriverId: null,
    assignedDriverName: null,
    currentShipmentId: null,
    fuelType: "Diesel",
    registrationDate: "2022-09-18",
    insuranceExpiry: daysFromNow(180),
    fitnessExpiry: daysFromNow(160),
    status: "available",
  },
  {
    id: "lv-007",
    vehicleNumber: "HR-55-AZ-4412",
    vehicleType: "TATA Prima 2525.K",
    capacityKg: 15500,
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedHub: "South Delhi Hub",
    assignedDriverId: "ld-007",
    assignedDriverName: "Vikram Sharma",
    currentShipmentId: null,
    fuelType: "Diesel",
    registrationDate: "2021-04-12",
    insuranceExpiry: daysFromNow(100),
    fitnessExpiry: daysFromNow(80),
    status: "assigned",
  },
  {
    id: "lv-008",
    vehicleNumber: "UP-32-JK-8891",
    vehicleType: "8-Ton Truck",
    capacityKg: 8500,
    assignedWarehouse: "Faridabad Central Warehouse",
    assignedHub: "Faridabad Hub",
    assignedDriverId: null,
    assignedDriverName: null,
    currentShipmentId: null,
    fuelType: "Diesel",
    registrationDate: "2020-07-30",
    insuranceExpiry: daysAgo(10),
    fitnessExpiry: daysFromNow(15),
    status: "inactive",
  },
  {
    id: "lv-009",
    vehicleNumber: "HR-10-LM-3345",
    vehicleType: "12-Ton Flatbed",
    capacityKg: 12000,
    assignedWarehouse: "Noida Central Warehouse",
    assignedHub: "Ghaziabad Hub",
    assignedDriverId: "ld-009",
    assignedDriverName: "Ramesh Patel",
    currentShipmentId: "WS-2026-0145",
    fuelType: "Diesel",
    registrationDate: "2022-12-01",
    insuranceExpiry: daysFromNow(220),
    fitnessExpiry: daysFromNow(190),
    status: "in_transit" as LogisticsVehicle["status"],
  },
  {
    id: "lv-010",
    vehicleNumber: "DL-05-NP-6677",
    vehicleType: "6-Ton LCV",
    capacityKg: 6500,
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedHub: "Gurgaon Sector 14 Hub",
    assignedDriverId: null,
    assignedDriverName: null,
    currentShipmentId: null,
    fuelType: "CNG",
    registrationDate: "2023-05-14",
    insuranceExpiry: daysFromNow(350),
    fitnessExpiry: daysFromNow(320),
    status: "available",
  },
];

// Fix lv-009 status - use running instead of invalid in_transit
SEED_VEHICLES[8]!.status = "running";

export const SEED_DRIVERS: LogisticsDriver[] = [
  {
    id: "ld-001",
    photoUrl: null,
    name: "Rajesh Kumar",
    employeeId: "DRV-1001",
    mobile: "+91 98765 43210",
    licenseNumber: "HR-2020-1234567",
    licenseExpiry: daysFromNow(365),
    assignedHub: "Gurgaon Sector 14 Hub",
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedVehicleId: "lv-001",
    assignedVehicleNumber: "HR-55-AN-1024",
    tripsToday: 2,
    status: "driving",
  },
  {
    id: "ld-002",
    photoUrl: null,
    name: "Mohit Verma",
    employeeId: "DRV-1002",
    mobile: "+91 98765 43211",
    licenseNumber: "DL-2019-7654321",
    licenseExpiry: daysFromNow(200),
    assignedHub: "Noida Sector 62 Hub",
    assignedWarehouse: "Noida Central Warehouse",
    assignedVehicleId: null,
    assignedVehicleNumber: null,
    tripsToday: 0,
    status: "available",
  },
  {
    id: "ld-003",
    photoUrl: null,
    name: "Suresh Yadav",
    employeeId: "DRV-1003",
    mobile: "+91 98765 43212",
    licenseNumber: "HR-2021-9876543",
    licenseExpiry: daysFromNow(150),
    assignedHub: "South Delhi Hub",
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedVehicleId: "lv-003",
    assignedVehicleNumber: "HR-26-BK-7783",
    tripsToday: 1,
    status: "driving",
  },
  {
    id: "ld-004",
    photoUrl: null,
    name: "Deepak Gupta",
    employeeId: "DRV-1004",
    mobile: "+91 98765 43213",
    licenseNumber: "UP-2018-1122334",
    licenseExpiry: daysFromNow(90),
    assignedHub: "Faridabad Hub",
    assignedWarehouse: "Faridabad Central Warehouse",
    assignedVehicleId: null,
    assignedVehicleNumber: null,
    tripsToday: 0,
    status: "on_leave",
  },
  {
    id: "ld-005",
    photoUrl: null,
    name: "Amit Singh",
    employeeId: "DRV-1005",
    mobile: "+91 98765 43214",
    licenseNumber: "HR-2020-5566778",
    licenseExpiry: daysFromNow(300),
    assignedHub: "Ghaziabad Hub",
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedVehicleId: "lv-005",
    assignedVehicleNumber: "HR-12-EF-5512",
    tripsToday: 3,
    status: "driving",
  },
  {
    id: "ld-006",
    photoUrl: null,
    name: "Pradeep Joshi",
    employeeId: "DRV-1006",
    mobile: "+91 98765 43215",
    licenseNumber: "DL-2022-3344556",
    licenseExpiry: daysFromNow(400),
    assignedHub: "Noida Sector 62 Hub",
    assignedWarehouse: "Noida Central Warehouse",
    assignedVehicleId: null,
    assignedVehicleNumber: null,
    tripsToday: 0,
    status: "available",
  },
  {
    id: "ld-007",
    photoUrl: null,
    name: "Vikram Sharma",
    employeeId: "DRV-1007",
    mobile: "+91 98765 43216",
    licenseNumber: "HR-2019-7788990",
    licenseExpiry: daysFromNow(180),
    assignedHub: "South Delhi Hub",
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedVehicleId: "lv-007",
    assignedVehicleNumber: "HR-55-AZ-4412",
    tripsToday: 0,
    status: "available",
  },
  {
    id: "ld-008",
    photoUrl: null,
    name: "Sanjay Mehta",
    employeeId: "DRV-1008",
    mobile: "+91 98765 43217",
    licenseNumber: "UP-2017-2233445",
    licenseExpiry: daysAgo(30),
    assignedHub: "Faridabad Hub",
    assignedWarehouse: "Faridabad Central Warehouse",
    assignedVehicleId: null,
    assignedVehicleNumber: null,
    tripsToday: 0,
    status: "inactive",
  },
  {
    id: "ld-009",
    photoUrl: null,
    name: "Ramesh Patel",
    employeeId: "DRV-1009",
    mobile: "+91 98765 43218",
    licenseNumber: "HR-2021-6677889",
    licenseExpiry: daysFromNow(250),
    assignedHub: "Ghaziabad Hub",
    assignedWarehouse: "Noida Central Warehouse",
    assignedVehicleId: "lv-009",
    assignedVehicleNumber: "HR-10-LM-3345",
    tripsToday: 2,
    status: "driving",
  },
  {
    id: "ld-010",
    photoUrl: null,
    name: "Anil Chauhan",
    employeeId: "DRV-1010",
    mobile: "+91 98765 43219",
    licenseNumber: "DL-2020-9900112",
    licenseExpiry: daysFromNow(320),
    assignedHub: "Gurgaon Sector 14 Hub",
    assignedWarehouse: "Gurgaon Central Warehouse",
    assignedVehicleId: null,
    assignedVehicleNumber: null,
    tripsToday: 1,
    status: "available",
  },
];

export const SEED_WAREHOUSE_SHIPMENTS: WarehouseShipment[] = [
  {
    id: "ws-001",
    shipmentId: "WS-2026-0142",
    warehouse: "Gurgaon Central Warehouse",
    destinationHub: "Gurgaon Sector 14 Hub",
    vehicleId: "lv-001",
    vehicleNumber: "HR-55-AN-1024",
    driverId: "ld-001",
    driverName: "Rajesh Kumar",
    dispatchTime: hoursAgo(3),
    eta: hoursFromNow(1),
    priority: "high",
    status: "in_transit",
    isDelayed: false,
    createdAt: hoursAgo(5),
  },
  {
    id: "ws-002",
    shipmentId: "WS-2026-0143",
    warehouse: "Noida Central Warehouse",
    destinationHub: "Noida Sector 62 Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    dispatchTime: null,
    eta: hoursFromNow(6),
    priority: "medium",
    status: "pending",
    isDelayed: false,
    createdAt: hoursAgo(2),
  },
  {
    id: "ws-003",
    shipmentId: "WS-2026-0138",
    warehouse: "Gurgaon Central Warehouse",
    destinationHub: "South Delhi Hub",
    vehicleId: "lv-003",
    vehicleNumber: "HR-26-BK-7783",
    driverId: "ld-003",
    driverName: "Suresh Yadav",
    dispatchTime: null,
    eta: hoursFromNow(4),
    priority: "high",
    status: "loading",
    isDelayed: false,
    createdAt: hoursAgo(4),
  },
  {
    id: "ws-004",
    shipmentId: "WS-2026-0135",
    warehouse: "Faridabad Central Warehouse",
    destinationHub: "Faridabad Hub",
    vehicleId: "lv-002",
    vehicleNumber: "DL-01-AB-4421",
    driverId: "ld-002",
    driverName: "Mohit Verma",
    dispatchTime: hoursAgo(8),
    eta: hoursAgo(1),
    priority: "critical",
    status: "delayed",
    isDelayed: true,
    createdAt: hoursAgo(10),
  },
  {
    id: "ws-005",
    shipmentId: "WS-2026-0145",
    warehouse: "Noida Central Warehouse",
    destinationHub: "Ghaziabad Hub",
    vehicleId: "lv-009",
    vehicleNumber: "HR-10-LM-3345",
    driverId: "ld-009",
    driverName: "Ramesh Patel",
    dispatchTime: hoursAgo(2),
    eta: hoursFromNow(2),
    priority: "medium",
    status: "in_transit",
    isDelayed: false,
    createdAt: hoursAgo(4),
  },
  {
    id: "ws-006",
    shipmentId: "WS-2026-0130",
    warehouse: "Gurgaon Central Warehouse",
    destinationHub: "Ghaziabad Hub",
    vehicleId: "lv-005",
    vehicleNumber: "HR-12-EF-5512",
    driverId: "ld-005",
    driverName: "Amit Singh",
    dispatchTime: hoursAgo(12),
    eta: hoursAgo(2),
    priority: "low",
    status: "reached_hub",
    isDelayed: false,
    createdAt: hoursAgo(14),
  },
  {
    id: "ws-007",
    shipmentId: "WS-2026-0128",
    warehouse: "Noida Central Warehouse",
    destinationHub: "South Delhi Hub",
    vehicleId: "lv-006",
    vehicleNumber: "DL-09-GH-2290",
    driverId: "ld-006",
    driverName: "Pradeep Joshi",
    dispatchTime: hoursAgo(24),
    eta: hoursAgo(18),
    priority: "medium",
    status: "completed",
    isDelayed: false,
    createdAt: hoursAgo(26),
  },
  {
    id: "ws-008",
    shipmentId: "WS-2026-0144",
    warehouse: "Gurgaon Central Warehouse",
    destinationHub: "South Delhi Hub",
    vehicleId: "lv-007",
    vehicleNumber: "HR-55-AZ-4412",
    driverId: "ld-007",
    driverName: "Vikram Sharma",
    dispatchTime: null,
    eta: hoursFromNow(5),
    priority: "high",
    status: "assigned",
    isDelayed: false,
    createdAt: hoursAgo(1),
  },
  {
    id: "ws-009",
    shipmentId: "WS-2026-0146",
    warehouse: "Faridabad Central Warehouse",
    destinationHub: "Ghaziabad Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    dispatchTime: null,
    eta: hoursFromNow(8),
    priority: "low",
    status: "pending",
    isDelayed: false,
    createdAt: hoursAgo(0.5),
  },
  {
    id: "ws-010",
    shipmentId: "WS-2026-0147",
    warehouse: "Noida Central Warehouse",
    destinationHub: "Faridabad Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    dispatchTime: null,
    eta: hoursFromNow(7),
    priority: "medium",
    status: "pending",
    isDelayed: false,
    createdAt: hoursAgo(1),
  },
];

export const SEED_CUSTOMER_DELIVERIES: CustomerDelivery[] = [
  {
    id: "cd-001",
    orderId: "CD-2026-0891",
    customer: "Sharma Construction Pvt Ltd",
    customerPhone: "+91 98100 12345",
    hub: "Ghaziabad Hub",
    vehicleId: "lv-005",
    vehicleNumber: "HR-12-EF-5512",
    driverId: "ld-005",
    driverName: "Amit Singh",
    deliveryEta: hoursFromNow(2),
    status: "out_for_delivery",
    address: "Plot 45, Industrial Area, Ghaziabad",
    createdAt: hoursAgo(4),
  },
  {
    id: "cd-002",
    orderId: "CD-2026-0892",
    customer: "Patel Builders",
    customerPhone: "+91 98100 23456",
    hub: "South Delhi Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    deliveryEta: hoursFromNow(5),
    status: "packed",
    address: "B-12, Saket, New Delhi",
    createdAt: hoursAgo(2),
  },
  {
    id: "cd-003",
    orderId: "CD-2026-0885",
    customer: "Gupta Infra Solutions",
    customerPhone: "+91 98100 34567",
    hub: "Noida Sector 62 Hub",
    vehicleId: "lv-002",
    vehicleNumber: "DL-01-AB-4421",
    driverId: "ld-002",
    driverName: "Mohit Verma",
    deliveryEta: hoursFromNow(1),
    status: "assigned",
    address: "Tower B, Sector 62, Noida",
    createdAt: hoursAgo(3),
  },
  {
    id: "cd-004",
    orderId: "CD-2026-0878",
    customer: "Reddy Housing",
    customerPhone: "+91 98100 45678",
    hub: "Gurgaon Sector 14 Hub",
    vehicleId: "lv-001",
    vehicleNumber: "HR-55-AN-1024",
    driverId: "ld-001",
    driverName: "Rajesh Kumar",
    deliveryEta: hoursAgo(1),
    status: "delivered",
    address: "DLF Phase 3, Gurgaon",
    createdAt: hoursAgo(8),
  },
  {
    id: "cd-005",
    orderId: "CD-2026-0880",
    customer: "Khan Contractors",
    customerPhone: "+91 98100 56789",
    hub: "Faridabad Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    deliveryEta: hoursAgo(3),
    status: "failed",
    address: "Sector 21C, Faridabad",
    createdAt: hoursAgo(6),
  },
  {
    id: "cd-006",
    orderId: "CD-2026-0888",
    customer: "Mehta Realty",
    customerPhone: "+91 98100 67890",
    hub: "South Delhi Hub",
    vehicleId: "lv-010",
    vehicleNumber: "DL-05-NP-6677",
    driverId: "ld-010",
    driverName: "Anil Chauhan",
    deliveryEta: hoursFromNow(3),
    status: "out_for_delivery",
    address: "Greater Kailash II, New Delhi",
    createdAt: hoursAgo(2),
  },
  {
    id: "cd-007",
    orderId: "CD-2026-0875",
    customer: "Singh Developers",
    customerPhone: "+91 98100 78901",
    hub: "Ghaziabad Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    deliveryEta: hoursAgo(5),
    status: "returned",
    address: "Vaishali, Ghaziabad",
    createdAt: hoursAgo(12),
  },
  {
    id: "cd-008",
    orderId: "CD-2026-0893",
    customer: "Agarwal Constructions",
    customerPhone: "+91 98100 89012",
    hub: "Noida Sector 62 Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    deliveryEta: hoursFromNow(6),
    status: "packed",
    address: "Sector 18, Noida",
    createdAt: hoursAgo(1),
  },
];

export const SEED_CRITICAL_SHIPMENTS: CriticalShipment[] = [
  {
    id: "cs-001",
    shipmentId: "WS-2026-0135",
    shipmentType: "warehouse_transfer",
    source: "Faridabad Central Warehouse",
    destination: "Faridabad Hub",
    vehicleId: "lv-002",
    vehicleNumber: "DL-01-AB-4421",
    driverId: "ld-002",
    driverName: "Mohit Verma",
    eta: hoursAgo(1),
    issue: "traffic_delay",
    priority: "critical",
    status: "Delayed",
  },
  {
    id: "cs-002",
    shipmentId: "WS-2026-0142",
    shipmentType: "warehouse_transfer",
    source: "Gurgaon Central Warehouse",
    destination: "Gurgaon Sector 14 Hub",
    vehicleId: "lv-001",
    vehicleNumber: "HR-55-AN-1024",
    driverId: "ld-001",
    driverName: "Rajesh Kumar",
    eta: hoursFromNow(1),
    issue: "none",
    priority: "high",
    status: "In Transit",
  },
  {
    id: "cs-003",
    shipmentId: "CD-2026-0880",
    shipmentType: "customer_delivery",
    source: "Faridabad Hub",
    destination: "Khan Contractors",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    eta: hoursAgo(3),
    issue: "driver_unreachable",
    priority: "high",
    status: "Failed",
  },
  {
    id: "cs-004",
    shipmentId: "WS-2026-0143",
    shipmentType: "warehouse_transfer",
    source: "Noida Central Warehouse",
    destination: "Noida Sector 62 Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    eta: hoursFromNow(6),
    issue: "document_missing",
    priority: "medium",
    status: "Pending",
  },
  {
    id: "cs-005",
    shipmentId: "CD-2026-0891",
    shipmentType: "customer_delivery",
    source: "Ghaziabad Hub",
    destination: "Sharma Construction Pvt Ltd",
    vehicleId: "lv-005",
    vehicleNumber: "HR-12-EF-5512",
    driverId: "ld-005",
    driverName: "Amit Singh",
    eta: hoursFromNow(2),
    issue: "none",
    priority: "medium",
    status: "Out For Delivery",
  },
  {
    id: "cs-006",
    shipmentId: "WS-2026-0145",
    shipmentType: "warehouse_transfer",
    source: "Noida Central Warehouse",
    destination: "Ghaziabad Hub",
    vehicleId: "lv-009",
    vehicleNumber: "HR-10-LM-3345",
    driverId: "ld-009",
    driverName: "Ramesh Patel",
    eta: hoursFromNow(2),
    issue: "wrong_route",
    priority: "high",
    status: "In Transit",
  },
];

export const SEED_DISPATCHES: DispatchRecord[] = [
  {
    id: "dp-001",
    dispatchId: "DSP-2026-0301",
    source: "Gurgaon Central Warehouse",
    destination: "South Delhi Hub",
    vehicleId: "lv-007",
    vehicleNumber: "HR-55-AZ-4412",
    driverId: "ld-007",
    driverName: "Vikram Sharma",
    route: "Gurgaon → NH-48 → South Delhi",
    eta: hoursFromNow(5),
    status: "assigned",
    createdAt: hoursAgo(1),
  },
  {
    id: "dp-002",
    dispatchId: "DSP-2026-0302",
    source: "Noida Central Warehouse",
    destination: "Noida Sector 62 Hub",
    vehicleId: null,
    vehicleNumber: null,
    driverId: null,
    driverName: null,
    route: "Noida CW → Sector 62",
    eta: hoursFromNow(6),
    status: "pending",
    createdAt: hoursAgo(2),
  },
  {
    id: "dp-003",
    dispatchId: "DSP-2026-0298",
    source: "Gurgaon Central Warehouse",
    destination: "Gurgaon Sector 14 Hub",
    vehicleId: "lv-001",
    vehicleNumber: "HR-55-AN-1024",
    driverId: "ld-001",
    driverName: "Rajesh Kumar",
    route: "Gurgaon CW → Sector 14",
    eta: hoursFromNow(1),
    status: "in_transit",
    createdAt: hoursAgo(5),
  },
  {
    id: "dp-004",
    dispatchId: "DSP-2026-0295",
    source: "Faridabad Central Warehouse",
    destination: "Faridabad Hub",
    vehicleId: "lv-002",
    vehicleNumber: "DL-01-AB-4421",
    driverId: "ld-002",
    driverName: "Mohit Verma",
    route: "Faridabad CW → Hub",
    eta: hoursAgo(1),
    status: "in_transit",
    createdAt: hoursAgo(10),
  },
  {
    id: "dp-005",
    dispatchId: "DSP-2026-0290",
    source: "Noida Central Warehouse",
    destination: "South Delhi Hub",
    vehicleId: "lv-006",
    vehicleNumber: "DL-09-GH-2290",
    driverId: "ld-006",
    driverName: "Pradeep Joshi",
    route: "Noida → DND → South Delhi",
    eta: hoursAgo(18),
    status: "completed",
    createdAt: hoursAgo(26),
  },
  {
    id: "dp-006",
    dispatchId: "DSP-2026-0303",
    source: "Ghaziabad Hub",
    destination: "Sharma Construction Pvt Ltd",
    vehicleId: "lv-005",
    vehicleNumber: "HR-12-EF-5512",
    driverId: "ld-005",
    driverName: "Amit Singh",
    route: "Ghaziabad Hub → Industrial Area",
    eta: hoursFromNow(2),
    status: "dispatched",
    createdAt: hoursAgo(4),
  },
];

export const SEED_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: "mt-001",
    vehicleId: "lv-004",
    vehicleNumber: "UP-16-CD-3309",
    issue: "Engine overhaul required",
    garage: "TATA Service Center, Faridabad",
    expectedCompletion: daysFromNow(3),
    status: "in_maintenance",
    scheduledDate: daysAgo(2),
  },
  {
    id: "mt-002",
    vehicleId: "lv-008",
    vehicleNumber: "UP-32-JK-8891",
    issue: "Insurance renewal pending",
    garage: "Fleet Workshop, Gurgaon",
    expectedCompletion: daysFromNow(7),
    status: "scheduled",
    scheduledDate: daysFromNow(1),
  },
  {
    id: "mt-003",
    vehicleId: "lv-010",
    vehicleNumber: "DL-05-NP-6677",
    issue: "Brake pad replacement",
    garage: "Ashok Leyland Service, Noida",
    expectedCompletion: daysAgo(1),
    status: "overdue",
    scheduledDate: daysAgo(5),
  },
  {
    id: "mt-004",
    vehicleId: "lv-006",
    vehicleNumber: "DL-09-GH-2290",
    issue: "Tire rotation and alignment",
    garage: "Fleet Workshop, Gurgaon",
    expectedCompletion: daysAgo(10),
    status: "completed",
    scheduledDate: daysAgo(12),
  },
  {
    id: "mt-005",
    vehicleId: "lv-002",
    vehicleNumber: "DL-01-AB-4421",
    issue: "Annual fitness certification",
    garage: "RTO Authorized Center, Noida",
    expectedCompletion: daysFromNow(5),
    status: "scheduled",
    scheduledDate: daysFromNow(2),
  },
];

function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages } satisfies PaginationMeta,
  };
}

function matchesSearch(
  query: string,
  ...fields: (string | null | undefined)[]
) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(q));
}

export function computeDashboardStats(
  warehouseShipments: WarehouseShipment[],
  customerDeliveries: CustomerDelivery[],
  vehicles: LogisticsVehicle[],
  drivers: LogisticsDriver[],
): LogisticsDashboardStats {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return {
    warehouseTransfers: warehouseShipments.length,
    hubDeliveries: customerDeliveries.length,
    vehiclesRunning: vehicles.filter((v) => v.status === "running").length,
    driversActive: drivers.filter((d) => d.status === "driving").length,
    delayedShipments: warehouseShipments.filter((s) => s.isDelayed).length,
    todaysDeliveries: customerDeliveries.filter(
      (d) => d.status === "delivered" && new Date(d.createdAt) >= todayStart,
    ).length,
    warehouseHub: {
      inTransit: warehouseShipments.filter((s) => s.status === "in_transit")
        .length,
      pendingDispatch: warehouseShipments.filter(
        (s) => s.status === "pending" || s.status === "assigned",
      ).length,
      delayed: warehouseShipments.filter((s) => s.isDelayed).length,
      completed: warehouseShipments.filter((s) => s.status === "completed")
        .length,
    },
    hubCustomer: {
      readyForDelivery: customerDeliveries.filter(
        (d) => d.status === "packed" || d.status === "assigned",
      ).length,
      outForDelivery: customerDeliveries.filter(
        (d) => d.status === "out_for_delivery",
      ).length,
      delivered: customerDeliveries.filter((d) => d.status === "delivered")
        .length,
      failedDelivery: customerDeliveries.filter((d) => d.status === "failed")
        .length,
      returned: customerDeliveries.filter((d) => d.status === "returned")
        .length,
    },
  };
}

export function queryWarehouseShipments(
  items: WarehouseShipment[],
  page: number,
  limit: number,
  filters: WarehouseShipmentFilters,
) {
  const filtered = items.filter((item) => {
    if (
      !matchesSearch(
        filters.search,
        item.shipmentId,
        item.warehouse,
        item.destinationHub,
        item.vehicleNumber,
        item.driverName,
      )
    )
      return false;
    if (filters.warehouse !== "all" && item.warehouse !== filters.warehouse)
      return false;
    if (
      filters.destinationHub !== "all" &&
      item.destinationHub !== filters.destinationHub
    )
      return false;
    if (filters.priority !== "all" && item.priority !== filters.priority)
      return false;
    if (filters.status !== "all" && item.status !== filters.status)
      return false;
    return true;
  });
  return paginate(filtered, page, limit);
}

export function queryCustomerDeliveries(
  items: CustomerDelivery[],
  page: number,
  limit: number,
  filters: CustomerDeliveryFilters,
) {
  const filtered = items.filter((item) => {
    if (
      !matchesSearch(
        filters.search,
        item.orderId,
        item.customer,
        item.hub,
        item.vehicleNumber,
        item.driverName,
      )
    )
      return false;
    if (filters.hub !== "all" && item.hub !== filters.hub) return false;
    if (filters.status !== "all" && item.status !== filters.status)
      return false;
    return true;
  });
  return paginate(filtered, page, limit);
}

export function queryVehicles(
  items: LogisticsVehicle[],
  page: number,
  limit: number,
  filters: VehicleFilters,
) {
  const filtered = items.filter((item) => {
    if (
      !matchesSearch(
        filters.search,
        item.vehicleNumber,
        item.vehicleType,
        item.assignedDriverName,
        item.assignedWarehouse,
        item.assignedHub,
      )
    )
      return false;
    if (filters.status !== "all" && item.status !== filters.status)
      return false;
    if (
      filters.warehouse !== "all" &&
      item.assignedWarehouse !== filters.warehouse
    )
      return false;
    if (filters.hub !== "all" && item.assignedHub !== filters.hub) return false;
    return true;
  });
  return paginate(filtered, page, limit);
}

export function queryDrivers(
  items: LogisticsDriver[],
  page: number,
  limit: number,
  filters: DriverFilters,
) {
  const filtered = items.filter((item) => {
    if (
      !matchesSearch(
        filters.search,
        item.name,
        item.employeeId,
        item.mobile,
        item.licenseNumber,
        item.assignedHub,
      )
    )
      return false;
    if (filters.status !== "all" && item.status !== filters.status)
      return false;
    if (filters.hub !== "all" && item.assignedHub !== filters.hub) return false;
    return true;
  });
  return paginate(filtered, page, limit);
}

export function queryDispatches(
  items: DispatchRecord[],
  page: number,
  limit: number,
  filters: DispatchFilters,
) {
  const filtered = items.filter((item) => {
    if (
      !matchesSearch(
        filters.search,
        item.dispatchId,
        item.source,
        item.destination,
        item.vehicleNumber,
        item.driverName,
        item.route,
      )
    )
      return false;
    if (filters.status !== "all" && item.status !== filters.status)
      return false;
    if (filters.source !== "all" && item.source !== filters.source)
      return false;
    return true;
  });
  return paginate(filtered, page, limit);
}

export function queryMaintenance(
  items: MaintenanceRecord[],
  page: number,
  limit: number,
  filters: MaintenanceFilters,
) {
  const filtered = items.filter((item) => {
    if (
      !matchesSearch(
        filters.search,
        item.vehicleNumber,
        item.issue,
        item.garage,
      )
    )
      return false;
    if (filters.status !== "all" && item.status !== filters.status)
      return false;
    return true;
  });
  return paginate(filtered, page, limit);
}

export function getShipmentTimeline(
  shipmentId: string,
  warehouseShipments: WarehouseShipment[],
  customerDeliveries: CustomerDelivery[],
): ShipmentTimeline | null {
  const ws = warehouseShipments.find((s) => s.shipmentId === shipmentId);
  const cd = customerDeliveries.find((d) => d.orderId === shipmentId);
  const record = ws ?? cd;
  if (!record) return null;

  const isWarehouse = !!ws;
  const status = ws?.status ?? cd?.status ?? "pending";

  const stageMap: Record<string, TimelineStage> = {
    pending: "shipment_created",
    assigned: "vehicle_assigned",
    loading: "loading",
    dispatched: "dispatched",
    in_transit: "checkpoint",
    reached_hub: "reached_hub",
    completed: "completed",
    packed: "shipment_created",
    out_for_delivery: "dispatched",
    delivered: "completed",
    failed: "checkpoint",
    delayed: "checkpoint",
  };

  const currentStage = stageMap[status] ?? "shipment_created";
  const stages: ShipmentTimeline["stages"] = [
    {
      stage: "shipment_created",
      label: "Shipment Created",
      completedAt: record.createdAt,
      isCurrent: currentStage === "shipment_created",
    },
    {
      stage: "vehicle_assigned",
      label: "Vehicle Assigned",
      completedAt: ws?.vehicleId
        ? hoursAgo(4)
        : cd?.vehicleId
          ? hoursAgo(3)
          : null,
      isCurrent: currentStage === "vehicle_assigned",
    },
    {
      stage: "driver_assigned",
      label: "Driver Assigned",
      completedAt: ws?.driverId
        ? hoursAgo(3.5)
        : cd?.driverId
          ? hoursAgo(2.5)
          : null,
      isCurrent: currentStage === "driver_assigned",
    },
    {
      stage: "loading",
      label: "Loading",
      completedAt:
        status === "loading" ||
        [
          "dispatched",
          "in_transit",
          "reached_hub",
          "completed",
          "out_for_delivery",
          "delivered",
        ].includes(status)
          ? hoursAgo(2)
          : null,
      isCurrent: currentStage === "loading",
    },
    {
      stage: "dispatched",
      label: "Dispatched",
      completedAt:
        ws?.dispatchTime ??
        (cd?.status === "out_for_delivery" ? hoursAgo(1) : null),
      isCurrent: currentStage === "dispatched",
    },
    {
      stage: "checkpoint",
      label: "Checkpoint",
      completedAt: ["in_transit", "out_for_delivery", "delayed"].includes(
        status,
      )
        ? hoursAgo(1)
        : null,
      isCurrent: currentStage === "checkpoint",
    },
    {
      stage: "reached_hub",
      label: "Reached Hub",
      completedAt: status === "reached_hub" ? hoursAgo(0.5) : null,
      isCurrent: currentStage === "reached_hub",
    },
    {
      stage: "completed",
      label: "Completed",
      completedAt: ["completed", "delivered"].includes(status)
        ? hoursAgo(0)
        : null,
      isCurrent: currentStage === "completed",
    },
  ];

  return {
    shipmentId,
    shipmentType: isWarehouse ? "warehouse_transfer" : "customer_delivery",
    currentStage,
    stages,
    vehicleNumber: ws?.vehicleNumber ?? cd?.vehicleNumber ?? null,
    driverName: ws?.driverName ?? cd?.driverName ?? null,
    source: ws?.warehouse ?? cd?.hub ?? "",
    destination: ws?.destinationHub ?? cd?.customer ?? "",
    eta: ws?.eta ?? cd?.deliveryEta ?? "",
    delayMinutes: ws?.isDelayed ? 75 : 0,
    remarks: ws?.isDelayed
      ? "Shipment delayed due to traffic congestion on NH-48."
      : "On schedule. No issues reported.",
  };
}

export function formatLogisticsDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLogisticsDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
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
    document_missing: "Document Missing",
    wrong_route: "Wrong Route",
    none: "—",
  };
  return labels[issue] ?? issue;
}

export function getPriorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getWarehouseStats(shipments: WarehouseShipment[]) {
  return {
    transfersToday: shipments.length,
    pending: shipments.filter((s) => s.status === "pending").length,
    loading: shipments.filter((s) => s.status === "loading").length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    delayed: shipments.filter((s) => s.isDelayed).length,
    completed: shipments.filter((s) => s.status === "completed").length,
  };
}

export function getCustomerStats(deliveries: CustomerDelivery[]) {
  return {
    ordersReady: deliveries.filter(
      (d) => d.status === "packed" || d.status === "assigned",
    ).length,
    outForDelivery: deliveries.filter((d) => d.status === "out_for_delivery")
      .length,
    delivered: deliveries.filter((d) => d.status === "delivered").length,
    failed: deliveries.filter((d) => d.status === "failed").length,
    returned: deliveries.filter((d) => d.status === "returned").length,
  };
}

export function getVehicleStats(vehicles: LogisticsVehicle[]) {
  return {
    total: vehicles.length,
    running: vehicles.filter((v) => v.status === "running").length,
    available: vehicles.filter((v) => v.status === "available").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    inactive: vehicles.filter((v) => v.status === "inactive").length,
  };
}

export function getDriverStats(drivers: LogisticsDriver[]) {
  return {
    total: drivers.length,
    available: drivers.filter((d) => d.status === "available").length,
    onTrip: drivers.filter((d) => d.status === "driving").length,
    onLeave: drivers.filter((d) => d.status === "on_leave").length,
    inactive: drivers.filter((d) => d.status === "inactive").length,
  };
}

export function getDispatchStats(dispatches: DispatchRecord[]) {
  return {
    pending: dispatches.filter((d) => d.status === "pending").length,
    todaysDispatches: dispatches.length,
    driversWaiting: SEED_DRIVERS.filter((d) => d.status === "available").length,
    vehiclesWaiting: SEED_VEHICLES.filter((v) => v.status === "available")
      .length,
  };
}

export function getMaintenanceStats(records: MaintenanceRecord[]) {
  return {
    scheduled: records.filter((r) => r.status === "scheduled").length,
    inMaintenance: records.filter((r) => r.status === "in_maintenance").length,
    completed: records.filter((r) => r.status === "completed").length,
    overdue: records.filter((r) => r.status === "overdue").length,
  };
}

export function globalLogisticsSearch(query: string) {
  const q = query.toLowerCase();
  if (!q.trim()) return [];

  const results: Array<{
    type: string;
    id: string;
    label: string;
    href: string;
  }> = [];

  SEED_WAREHOUSE_SHIPMENTS.forEach((s) => {
    if (
      s.shipmentId.toLowerCase().includes(q) ||
      s.warehouse.toLowerCase().includes(q) ||
      s.destinationHub.toLowerCase().includes(q)
    ) {
      results.push({
        type: "Shipment",
        id: s.shipmentId,
        label: `${s.shipmentId} — ${s.warehouse} → ${s.destinationHub}`,
        href: "/logistics/tracking",
      });
    }
  });
  SEED_VEHICLES.forEach((v) => {
    if (v.vehicleNumber.toLowerCase().includes(q)) {
      results.push({
        type: "Vehicle",
        id: v.vehicleNumber,
        label: v.vehicleNumber,
        href: "/logistics/fleet/vehicles",
      });
    }
  });
  SEED_DRIVERS.forEach((d) => {
    if (
      d.name.toLowerCase().includes(q) ||
      d.employeeId.toLowerCase().includes(q)
    ) {
      results.push({
        type: "Driver",
        id: d.employeeId,
        label: d.name,
        href: "/logistics/fleet/drivers",
      });
    }
  });
  SEED_CUSTOMER_DELIVERIES.forEach((d) => {
    if (
      d.customer.toLowerCase().includes(q) ||
      d.orderId.toLowerCase().includes(q)
    ) {
      results.push({
        type: "Customer",
        id: d.orderId,
        label: `${d.orderId} — ${d.customer}`,
        href: "/logistics/customer",
      });
    }
  });

  return results.slice(0, 10);
}
