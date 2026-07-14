import { ROUTES } from "@/constants/routes";
import type {
  InventoryActivity,
  LowStockItem,
  Requisition,
  WarehouseQuickAction,
  WarehouseStat,
} from "@/types/warehouse.types";

// TODO: Replace with warehouse dashboard stats API
export const stats: WarehouseStat[] = [
  {
    id: "total-products",
    label: "Total Products",
    value: "48",
    subtitle: "Products in warehouse catalog",
    icon: "inventory",
    variant: "default",
  },
  {
    id: "pending-requisitions",
    label: "Pending Requisitions",
    value: "118",
    subtitle: "Waiting for approval",
    icon: "requisitions",
    variant: "default",
  },
  {
    id: "todays-dispatch",
    label: "Today's Dispatch",
    value: "26",
    subtitle: "Dispatched today",
    icon: "dispatch",
    variant: "default",
  },
  {
    id: "low-stock-items",
    label: "Low Stock Items",
    value: "17",
    subtitle: "Require replenishment",
    icon: "low-stock",
    variant: "warning",
  },
];

// TODO: Replace with critical requisition queue API
export const requisitions: Requisition[] = [
  {
    id: "req-2041",
    requestId: "#REQ-2041",
    hubName: "Noida North",
    material: "UltraTech PPC Cement",
    quantity: "500 Bags",
    priority: "critical",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/req-2041`,
  },
  {
    id: "req-2038",
    requestId: "#REQ-2038",
    hubName: "Gurgaon West",
    material: "ACC Gold Cement",
    quantity: "320 Bags",
    priority: "high",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/req-2038`,
  },
  {
    id: "req-2035",
    requestId: "#REQ-2035",
    hubName: "Delhi South",
    material: "TMT Steel Bars 12mm",
    quantity: "2.5 Tons",
    priority: "high",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/req-2035`,
  },
  {
    id: "req-2032",
    requestId: "#REQ-2032",
    hubName: "Noida Central",
    material: "River Sand (Fine)",
    quantity: "45 Units",
    priority: "medium",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/req-2032`,
  },
  {
    id: "req-2029",
    requestId: "#REQ-2029",
    hubName: "Faridabad East",
    material: "Ambuja PPC Cement",
    quantity: "280 Bags",
    priority: "critical",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/req-2029`,
  },
];

// TODO: Replace with recent inventory activity API
export const activities: InventoryActivity[] = [
  {
    id: "act-1",
    time: "14:22",
    activity: "Stock Received",
    material: "ACC Gold",
    quantity: "+1200 Bags",
    quantityChange: "positive",
    by: "Rajesh K.",
    status: "completed",
  },
  {
    id: "act-2",
    time: "13:45",
    activity: "Dispatch Out",
    material: "UltraTech PPC",
    quantity: "-500 Bags",
    quantityChange: "negative",
    by: "System",
    status: "verified",
  },
  {
    id: "act-3",
    time: "12:10",
    activity: "Stock Audit",
    material: "TMT Steel 12mm",
    quantity: "0 Variation",
    quantityChange: "neutral",
    by: "Priya S.",
    status: "verified",
  },
  {
    id: "act-4",
    time: "11:30",
    activity: "Transfer In",
    material: "River Sand",
    quantity: "+80 Units",
    quantityChange: "positive",
    by: "Amit V.",
    status: "processing",
  },
  {
    id: "act-5",
    time: "10:15",
    activity: "Requisition Fulfilled",
    material: "Ambuja PPC",
    quantity: "-280 Bags",
    quantityChange: "negative",
    by: "System",
    status: "completed",
  },
  {
    id: "act-6",
    time: "09:40",
    activity: "GRN Pending",
    material: "White Cement",
    quantity: "+150 Bags",
    quantityChange: "positive",
    by: "Rajesh K.",
    status: "pending",
  },
];

// TODO: Replace with low stock alerts API
export const alerts: LowStockItem[] = [
  {
    id: "alert-1",
    productName: "UltraTech Cement",
    currentStock: "22 Bags",
    minimumStock: "100 Bags",
    severity: "critical",
  },
  {
    id: "alert-2",
    productName: "ACC Gold Cement",
    currentStock: "45 Bags",
    minimumStock: "80 Bags",
    severity: "critical",
  },
  {
    id: "alert-3",
    productName: "TMT Steel 12mm",
    currentStock: "1.2 Tons",
    minimumStock: "3 Tons",
    severity: "warning",
  },
  {
    id: "alert-4",
    productName: "River Sand (Fine)",
    currentStock: "12 Units",
    minimumStock: "30 Units",
    severity: "warning",
  },
  {
    id: "alert-5",
    productName: "White Cement",
    currentStock: "8 Bags",
    minimumStock: "50 Bags",
    severity: "critical",
  },
];

// TODO: Replace with warehouse quick actions config API
export const quickActions: WarehouseQuickAction[] = [
  {
    id: "receive-stock",
    label: "Receive Stock",
    icon: "receive-stock",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/receive`,
  },
  {
    id: "approve-requisition",
    label: "Approve Requisition",
    icon: "approve-requisition",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions`,
  },
  {
    id: "allocate-inventory",
    label: "Allocate Inventory",
    icon: "allocate-inventory",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/allocate`,
  },
  {
    id: "create-transfer",
    label: "Create Transfer",
    icon: "create-transfer",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers/new`,
  },
  {
    id: "inventory-management",
    label: "Inventory Mgmt",
    icon: "inventory-management",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/inventory`,
  },
  {
    id: "dispatch-control",
    label: "Dispatch Control",
    icon: "dispatch-control",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
  },
  {
    id: "view-alerts",
    label: "View Alerts",
    icon: "view-alerts",
  },
  {
    id: "hub-receiving",
    label: "Hub Receiving",
    icon: "hub-receiving",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/hub-receiving`,
  },
];
