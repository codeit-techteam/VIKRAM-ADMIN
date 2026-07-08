import { INVENTORY_ITEMS } from "@/mock/inventory";
import type { HubInventoryEntry, SubHub } from "@/types/erp.types";

function daysAgoIso(days: number, hour = 10, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function yearsAgoIso(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setMonth(0);
  date.setDate(15);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}

function managerEmail(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, ".")}@bajriwala.in`;
}

export const SUB_HUBS: SubHub[] = [
  {
    id: "hub-gurgaon-north",
    name: "Gurgaon Central",
    city: "Gurgaon",
    region: "NCR North",
    managerName: "Amit Sharma",
    nodeId: "H-101",
    isActive: true,
    lastInventorySync: daysAgoIso(0, 8, 30),
    address: "Sector 44, Gurgaon, Haryana, 122003",
    managerPhone: "+91 98100 11201",
    managerEmail: managerEmail("Amit Sharma"),
    hubSince: yearsAgoIso(4),
    capacityMt: 5000,
    capacitySqFt: 25_000,
    workingHours: "09:00 - 20:00",
  },
  {
    id: "hub-noida-62",
    name: "Noida Sector 62",
    city: "Noida",
    region: "NCR East",
    managerName: "Sneha Reddy",
    nodeId: "H-102",
    isActive: true,
    lastInventorySync: daysAgoIso(0, 7, 15),
    address: "Sector 62, Noida, Uttar Pradesh, 201301",
    managerPhone: "+91 98100 11202",
    managerEmail: managerEmail("Sneha Reddy"),
    hubSince: yearsAgoIso(3),
    capacityMt: 4200,
    capacitySqFt: 22_000,
    workingHours: "08:30 - 19:30",
  },
  {
    id: "hub-manesar",
    name: "Manesar Plant",
    city: "Manesar",
    region: "NCR West",
    managerName: "Vijay Kumar",
    nodeId: "H-103",
    isActive: true,
    lastInventorySync: daysAgoIso(1, 16, 45),
    address: "IMT Manesar, Gurugram, Haryana, 122050",
    managerPhone: "+91 98100 11203",
    managerEmail: managerEmail("Vijay Kumar"),
    hubSince: yearsAgoIso(5),
    capacityMt: 6500,
    capacitySqFt: 32_000,
    workingHours: "08:00 - 20:00",
  },
  {
    id: "hub-manesar-site",
    name: "Manesar Site Hub",
    city: "Manesar",
    region: "NCR West",
    managerName: "Vijay Kumar",
    nodeId: "H-103B",
    isActive: true,
    lastInventorySync: daysAgoIso(2, 11, 0),
    address: "Site Yard B, IMT Manesar, Haryana, 122050",
    managerPhone: "+91 98100 11203",
    managerEmail: managerEmail("Vijay Kumar"),
    hubSince: yearsAgoIso(2),
    capacityMt: 2800,
    capacitySqFt: 14_000,
    workingHours: "08:00 - 18:00",
  },
  {
    id: "hub-dwarka",
    name: "Dwarka Expressway",
    city: "New Delhi",
    region: "NCR South-West",
    managerName: "Deepak Gupta",
    nodeId: "H-104",
    isActive: true,
    lastInventorySync: daysAgoIso(3, 9, 20),
    address: "Dwarka Expressway, New Delhi, 110075",
    managerPhone: "+91 98100 11204",
    managerEmail: managerEmail("Deepak Gupta"),
    hubSince: yearsAgoIso(3),
    capacityMt: 3800,
    capacitySqFt: 18_500,
    workingHours: "09:00 - 19:00",
  },
  {
    id: "hub-noida-north",
    name: "Noida North",
    city: "Noida",
    region: "NCR North",
    managerName: "Priya Singh",
    nodeId: "H-105",
    isActive: true,
    lastInventorySync: daysAgoIso(0, 14, 10),
    address: "Sector 1, Noida, Uttar Pradesh, 201301",
    managerPhone: "+91 98100 11205",
    managerEmail: managerEmail("Priya Singh"),
    hubSince: yearsAgoIso(2),
    capacityMt: 3500,
    capacitySqFt: 16_000,
    workingHours: "09:00 - 20:00",
  },
  {
    id: "hub-gurgaon-west",
    name: "Gurgaon West",
    city: "Gurgaon",
    region: "NCR West",
    managerName: "Rajesh Mehta",
    nodeId: "H-106",
    isActive: true,
    lastInventorySync: daysAgoIso(1, 13, 30),
    address: "Sector 83, Gurgaon, Haryana, 122004",
    managerPhone: "+91 98100 11206",
    managerEmail: managerEmail("Rajesh Mehta"),
    hubSince: yearsAgoIso(3),
    capacityMt: 4000,
    capacitySqFt: 20_000,
    workingHours: "09:00 - 19:30",
  },
  {
    id: "hub-delhi-south",
    name: "Delhi South",
    city: "New Delhi",
    region: "NCR South",
    managerName: "Anita Desai",
    nodeId: "H-107",
    isActive: true,
    lastInventorySync: daysAgoIso(4, 10, 0),
    address: "Okhla Industrial Area, New Delhi, 110020",
    managerPhone: "+91 98100 11207",
    managerEmail: managerEmail("Anita Desai"),
    hubSince: yearsAgoIso(6),
    capacityMt: 3200,
    capacitySqFt: 15_000,
    workingHours: "08:30 - 18:30",
  },
  {
    id: "hub-faridabad-east",
    name: "Faridabad East",
    city: "Faridabad",
    region: "NCR East",
    managerName: "Rohit Verma",
    nodeId: "H-108",
    isActive: true,
    lastInventorySync: daysAgoIso(0, 6, 50),
    address: "Sector 15A, Faridabad, Haryana, 121007",
    managerPhone: "+91 98100 11208",
    managerEmail: managerEmail("Rohit Verma"),
    hubSince: yearsAgoIso(4),
    capacityMt: 3600,
    capacitySqFt: 17_500,
    workingHours: "09:00 - 19:00",
  },
  {
    id: "hub-sohna-road",
    name: "Sohna Road Site",
    city: "Gurgaon",
    region: "NCR South",
    managerName: "Kavita Nair",
    nodeId: "H-109",
    isActive: true,
    lastInventorySync: daysAgoIso(2, 15, 40),
    address: "Sohna Road, Gurgaon, Haryana, 122103",
    managerPhone: "+91 98100 11209",
    managerEmail: managerEmail("Kavita Nair"),
    hubSince: yearsAgoIso(1),
    capacityMt: 2400,
    capacitySqFt: 12_000,
    workingHours: "08:00 - 18:00",
  },
  {
    id: "hub-jaipur-west",
    name: "Jaipur West",
    city: "Jaipur",
    region: "Rajasthan",
    managerName: "Sanjay Joshi",
    nodeId: "H-110",
    isActive: false,
    lastInventorySync: daysAgoIso(30, 8, 0),
    address: "Sitapura Industrial Area, Jaipur, 302022",
    managerPhone: "+91 98100 11210",
    managerEmail: managerEmail("Sanjay Joshi"),
    hubSince: yearsAgoIso(5),
    capacityMt: 3000,
    capacitySqFt: 14_500,
    workingHours: "09:00 - 18:00",
  },
];

function inventoryLookup(materialId: string) {
  return INVENTORY_ITEMS.find((item) => item.id === materialId);
}

function inventoryPrice(materialId: string): number {
  return inventoryLookup(materialId)?.purchasePrice ?? 100;
}

function inventoryCategory(materialId: string): string {
  return inventoryLookup(materialId)?.category ?? "General Materials";
}

function buildEntry(
  hub: SubHub,
  materialId: string,
  materialName: string,
  sku: string,
  quantity: number,
  minimumRequired: number,
  unit: string,
): HubInventoryEntry {
  return {
    hubId: hub.id,
    hubName: hub.name,
    materialId,
    materialName,
    sku,
    quantity,
    minimumRequired,
    purchasePrice: inventoryPrice(materialId),
    unit,
    lastUpdated: hub.lastInventorySync,
    category: inventoryCategory(materialId),
    safetyStock: Math.max(1, Math.round(minimumRequired * 0.6)),
  };
}

export function buildSeedHubInventory(hubs: SubHub[]): HubInventoryEntry[] {
  const byId = (id: string) => hubs.find((hub) => hub.id === id)!;

  return [
    buildEntry(
      byId("hub-gurgaon-north"),
      "inv-002",
      "OPC 53 Grade Cement",
      "SKU-CEM-0053-ULT",
      480,
      500,
      "bags",
    ),
    buildEntry(
      byId("hub-gurgaon-north"),
      "inv-005",
      "TMT Steel Bars 16mm",
      "SKU-STL-0016-IND",
      26000,
      28000,
      "kg",
    ),
    buildEntry(
      byId("hub-gurgaon-north"),
      "inv-004",
      "Premium Masonry Bricks",
      "SKU-MAS-BRK-CLA",
      14500,
      15000,
      "units",
    ),
    buildEntry(
      byId("hub-noida-62"),
      "inv-002",
      "OPC 53 Grade Cement",
      "SKU-CEM-0053-ULT",
      420,
      500,
      "bags",
    ),
    buildEntry(
      byId("hub-noida-62"),
      "inv-006",
      "PPC Cement 43 Grade",
      "SKU-CEM-0043-STD",
      280,
      350,
      "bags",
    ),
    buildEntry(
      byId("hub-manesar"),
      "inv-005",
      "TMT Steel Bars 16mm",
      "SKU-STL-0016-IND",
      21000,
      28000,
      "kg",
    ),
    buildEntry(
      byId("hub-manesar"),
      "inv-006",
      "PPC Cement 43 Grade",
      "SKU-CEM-0043-STD",
      260,
      350,
      "bags",
    ),
    buildEntry(
      byId("hub-dwarka"),
      "inv-002",
      "OPC 53 Grade Cement",
      "SKU-CEM-0053-ULT",
      280,
      500,
      "bags",
    ),
    buildEntry(
      byId("hub-dwarka"),
      "inv-003",
      "Industrial Copper Wiring",
      "SKU-ELE-WR25-PRM",
      18,
      50,
      "rolls",
    ),
    buildEntry(
      byId("hub-noida-north"),
      "inv-001",
      "Steel Rebar FE 500D",
      "SKU-STL-0012-IND",
      42000,
      45000,
      "kg",
    ),
    buildEntry(
      byId("hub-gurgaon-west"),
      "inv-004",
      "Premium Masonry Bricks",
      "SKU-MAS-BRK-CLA",
      11000,
      15000,
      "units",
    ),
    buildEntry(
      byId("hub-delhi-south"),
      "inv-002",
      "OPC 53 Grade Cement",
      "SKU-CEM-0053-ULT",
      390,
      500,
      "bags",
    ),
    buildEntry(
      byId("hub-faridabad-east"),
      "inv-005",
      "TMT Steel Bars 16mm",
      "SKU-STL-0016-IND",
      19500,
      28000,
      "kg",
    ),
    buildEntry(
      byId("hub-sohna-road"),
      "inv-006",
      "PPC Cement 43 Grade",
      "SKU-CEM-0043-STD",
      310,
      350,
      "bags",
    ),
    buildEntry(
      byId("hub-manesar-site"),
      "inv-002",
      "OPC 53 Grade Cement",
      "SKU-CEM-0053-ULT",
      360,
      500,
      "bags",
    ),
  ];
}

const SEED_HUB_INVENTORY = buildSeedHubInventory(SUB_HUBS);

export function resolveHubMaterialDefaults(
  hubId: string,
  materialId: string,
): Pick<
  HubInventoryEntry,
  "minimumRequired" | "purchasePrice" | "category" | "safetyStock"
> {
  const seed = SEED_HUB_INVENTORY.find(
    (entry) => entry.hubId === hubId && entry.materialId === materialId,
  );

  if (seed) {
    return {
      minimumRequired: seed.minimumRequired,
      purchasePrice: seed.purchasePrice,
      category: seed.category,
      safetyStock: seed.safetyStock,
    };
  }

  const inventoryItem = INVENTORY_ITEMS.find((item) => item.id === materialId);
  const minimumRequired = Math.max(
    1,
    Math.round((inventoryItem?.minimumStock ?? 100) * 0.15),
  );

  return {
    minimumRequired,
    purchasePrice: inventoryItem?.purchasePrice ?? 100,
    category: inventoryItem?.category ?? "General Materials",
    safetyStock: Math.max(1, Math.round(minimumRequired * 0.6)),
  };
}
