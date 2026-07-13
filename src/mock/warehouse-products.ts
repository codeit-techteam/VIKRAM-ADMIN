export interface WarehouseProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  unit: string;
  stockUnits: number;
  status: "ACTIVE" | "INACTIVE" | "LOW_STOCK";
}

export const WAREHOUSE_PRODUCT_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "cement", label: "Cement" },
  { value: "steel", label: "Steel" },
  { value: "aggregates", label: "Aggregates" },
  { value: "bricks-blocks", label: "Bricks & Blocks" },
] as const;

export const WAREHOUSE_PRODUCTS: WarehouseProduct[] = [
  {
    id: "wp-001",
    name: "UltraTech OPC 53 Cement",
    sku: "UT-OPC-53",
    category: "Cement",
    brand: "UltraTech",
    unit: "Bags",
    stockUnits: 2400,
    status: "ACTIVE",
  },
  {
    id: "wp-002",
    name: "TATA Tiscon TMT 12mm",
    sku: "TT-TMT-12",
    category: "Steel",
    brand: "TATA Tiscon",
    unit: "Tons",
    stockUnits: 18,
    status: "LOW_STOCK",
  },
  {
    id: "wp-003",
    name: "Premium Fine Sand",
    sku: "SD-FN-101",
    category: "Aggregates",
    brand: "Bajriwala Local",
    unit: "Units",
    stockUnits: 680,
    status: "ACTIVE",
  },
  {
    id: "wp-004",
    name: "Fly Ash Bricks Standard",
    sku: "BRK-FA-STD",
    category: "Bricks & Blocks",
    brand: "EcoBuild",
    unit: "Units",
    stockUnits: 12000,
    status: "ACTIVE",
  },
  {
    id: "wp-005",
    name: "Ambuja PPC Cement",
    sku: "AB-PPC-43",
    category: "Cement",
    brand: "Ambuja",
    unit: "Bags",
    stockUnits: 0,
    status: "INACTIVE",
  },
  {
    id: "wp-006",
    name: "JSW Neosteel TMT 10mm",
    sku: "JSW-TMT-10",
    category: "Steel",
    brand: "JSW",
    unit: "Tons",
    stockUnits: 42,
    status: "ACTIVE",
  },
];
