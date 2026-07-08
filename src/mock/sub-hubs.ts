import { INVENTORY_ITEMS } from "@/mock/inventory";
import type { HubInventoryEntry, SubHub } from "@/types/erp.types";

function daysAgoIso(days: number, hour = 10, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
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
  },
];

function inventoryPrice(materialId: string): number {
  return (
    INVENTORY_ITEMS.find((item) => item.id === materialId)?.purchasePrice ?? 100
  );
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
): Pick<HubInventoryEntry, "minimumRequired" | "purchasePrice"> {
  const seed = SEED_HUB_INVENTORY.find(
    (entry) => entry.hubId === hubId && entry.materialId === materialId,
  );

  if (seed) {
    return {
      minimumRequired: seed.minimumRequired,
      purchasePrice: seed.purchasePrice,
    };
  }

  const inventoryItem = INVENTORY_ITEMS.find((item) => item.id === materialId);
  return {
    minimumRequired: Math.max(
      1,
      Math.round((inventoryItem?.minimumStock ?? 100) * 0.15),
    ),
    purchasePrice: inventoryItem?.purchasePrice ?? 100,
  };
}
