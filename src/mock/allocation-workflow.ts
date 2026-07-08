import type { PaginationMeta } from "@/types/api";
import type { InventoryItem } from "@/types/inventory.types";
import type {
  AllocationWorkflowFormValues,
  AllocationWorkflowResult,
  MaterialBatch,
  MaterialWorkflowDetail,
  RequisitionListItem,
  RequisitionPriority,
  WarehouseStockStatus,
  WorkflowWarehouse,
} from "@/types/warehouse.types";

import { getAvailableStock, INVENTORY_ITEMS } from "@/mock/inventory";
import { getInventoryItem } from "@/mock/allocations";
import {
  formatRequisitionQuantity,
  REQUISITION_LIST,
} from "@/mock/requisitions";
import { ROUTES } from "@/constants/routes";

export const WORKFLOW_REQUISITION_PAGE_SIZE = 5;

export const WORKFLOW_STEP_LABELS = [
  "Select Request",
  "Source Stock",
  "Quantities",
  "Logistics",
  "Summary",
] as const;

const WORKFLOW_WAREHOUSES: Omit<WorkflowWarehouse, "stock" | "status">[] = [
  {
    id: "wh-central-sector-62",
    name: "Central Warehouse - Sector 62",
    location: "Noida, UP",
    leadTimeHours: 24,
    insight:
      "Sector 62 has high throughput. Estimated dispatch: Today, 4:00 PM.",
  },
  {
    id: "wh-auxiliary-okhla",
    name: "Auxiliary Depot - Okhla",
    location: "Delhi, South",
    leadTimeHours: 36,
    insight: "Moderate throughput. Estimated dispatch: Tomorrow, 10:00 AM.",
  },
  {
    id: "wh-gurgaon-yard-4",
    name: "Gurgaon Yard 4",
    location: "Haryana",
    leadTimeHours: 48,
  },
];

const MATERIAL_DETAILS: Record<string, MaterialWorkflowDetail> = {
  "inv-002": {
    materialId: "inv-002",
    name: "UltraTech Cement",
    spec: "OPC 53 Grade",
    sku: "MT-00102",
    grade: "OPC 53 Grade",
    category: "cement",
    categoryLabel: "CEMENT",
    specifications: [
      "Type: OPC 53 Grade",
      "Pack Size: 50 kg Bags",
      "Manufacturer: UltraTech",
    ],
    unit: "Bags",
    unitDensity: 50,
  },
  "inv-005": {
    materialId: "inv-005",
    name: "TMT Steel Rods",
    spec: "12mm",
    sku: "MT-00234",
    grade: "Fe 500D High Strength",
    category: "steel-rebar",
    categoryLabel: "STEEL",
    specifications: [
      "Diameter: 12mm",
      "Standard Length: 12 Meters",
      "Manufacturer: Jindal Panther",
    ],
    unit: "Bundles",
    unitDensity: 12,
  },
  "inv-004": {
    materialId: "inv-004",
    name: "PPC Bricks",
    spec: "Standard",
    sku: "MT-00318",
    grade: "Class A",
    category: "masonry",
    categoryLabel: "MASONRY",
    specifications: [
      "Type: Premium Masonry",
      "Strength: Class A",
      "Standard Size: 230 x 110 x 75 mm",
    ],
    unit: "Units",
  },
  "inv-001": {
    materialId: "inv-001",
    name: "Steel Rebar FE 500D",
    spec: "12mm",
    sku: "MT-00089",
    grade: "FE 500D",
    category: "steel-rebar",
    categoryLabel: "STEEL",
    specifications: [
      "Diameter: 12mm",
      "Grade: FE 500D",
      "Standard Length: 12 Meters",
    ],
    unit: "kg",
    unitDensity: 1,
  },
  "inv-007": {
    materialId: "inv-007",
    name: "Industrial Paint",
    spec: "White",
    sku: "MT-00421",
    grade: "Exterior Emulsion",
    category: "paint",
    categoryLabel: "PAINT",
    specifications: [
      "Finish: Matte White",
      "Coverage: 120 sq.ft/L",
      "Manufacturer: Asian Paints",
    ],
    unit: "Ltrs",
  },
};

const WORKFLOW_PINNED_REQUISITIONS: Partial<RequisitionListItem>[] = [
  {
    id: "req-8812",
    requestId: "#REQ-8812",
    hubName: "Gurgaon North",
    hubId: "hub-gurgaon-north",
    material: "UltraTech Cement",
    materialSpec: "OPC 53 Grade",
    materialId: "inv-002",
    requestedQty: 500,
    unit: "Bags",
    priority: "critical",
    status: "APPROVED",
    allocationStatus: "PENDING",
    createdAt: new Date("2023-10-24T09:00:00").toISOString(),
  },
  {
    id: "req-8810",
    requestId: "#REQ-8810",
    hubName: "Noida Sector 62",
    hubId: "hub-noida-62",
    material: "TMT Steel Rods",
    materialSpec: "12mm",
    materialId: "inv-005",
    requestedQty: 450,
    unit: "Bundles",
    priority: "medium",
    status: "APPROVED",
    allocationStatus: "PENDING",
    createdAt: new Date("2023-10-23T14:30:00").toISOString(),
  },
  {
    id: "req-8808",
    requestId: "#REQ-8808",
    hubName: "Delhi South",
    hubId: "hub-delhi-south",
    material: "PPC Bricks",
    materialSpec: "Standard",
    materialId: "inv-004",
    requestedQty: 2500,
    unit: "Units",
    priority: "low",
    status: "APPROVED",
    allocationStatus: "PENDING",
    createdAt: new Date("2023-10-22T11:15:00").toISOString(),
  },
  {
    id: "req-8805",
    requestId: "#REQ-8805",
    hubName: "Manesar Plant",
    hubId: "hub-manesar",
    material: "Steel Rebar FE 500D",
    materialSpec: "12mm",
    materialId: "inv-001",
    requestedQty: 2500,
    unit: "kg",
    priority: "critical",
    status: "APPROVED",
    allocationStatus: "PENDING",
    createdAt: new Date("2023-10-21T08:45:00").toISOString(),
  },
  {
    id: "req-8802",
    requestId: "#REQ-8802",
    hubName: "Faridabad East",
    hubId: "hub-faridabad-east",
    material: "Industrial Paint",
    materialSpec: "White",
    materialId: "inv-007",
    requestedQty: 180,
    unit: "Ltrs",
    priority: "medium",
    status: "APPROVED",
    allocationStatus: "PENDING",
    createdAt: new Date("2023-10-20T16:00:00").toISOString(),
  },
];

function buildWorkflowRequisition(
  index: number,
  overrides: Partial<RequisitionListItem> = {},
): RequisitionListItem {
  const id = `req-wf-${8800 + index}`;
  const requestId = `#REQ-${8800 + index}`;
  const materials = Object.values(MATERIAL_DETAILS);
  const material = materials[index % materials.length];
  const hubs = [
    { id: "hub-gurgaon-north", label: "Gurgaon North" },
    { id: "hub-noida-62", label: "Noida Sector 62" },
    { id: "hub-delhi-south", label: "Delhi South" },
    { id: "hub-manesar", label: "Manesar Plant" },
    { id: "hub-faridabad-east", label: "Faridabad East" },
    { id: "hub-dwarka", label: "Dwarka Expressway Site" },
  ];
  const hub = hubs[index % hubs.length];
  const priorities: RequisitionPriority[] = [
    "critical",
    "high",
    "medium",
    "low",
  ];
  const dayOffset = (index % 14) + 5;

  return {
    id,
    requestId,
    requestedBy: { name: "Workflow User", role: "Site Supervisor" },
    hubName: hub.label,
    hubId: hub.id,
    warehouseId: "wh-noida-central",
    warehouseName: "Noida Central Warehouse",
    materialId: material.materialId,
    material: material.name,
    materialSpec: material.spec,
    requestedQty: 200 + (index % 8) * 100,
    unit: material.unit,
    priority: priorities[index % priorities.length],
    status: "APPROVED",
    allocationStatus: "PENDING",
    createdAt: new Date(
      Date.now() - dayOffset * 24 * 60 * 60 * 1000,
    ).toISOString(),
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/${id}`,
    ...overrides,
  };
}

function mergePinnedRequisitions(
  base: RequisitionListItem[],
): RequisitionListItem[] {
  const pinnedIds = new Set(
    WORKFLOW_PINNED_REQUISITIONS.map((item) => item.id),
  );
  const withoutPinned = base.filter((item) => !pinnedIds.has(item.id));

  const pinned = WORKFLOW_PINNED_REQUISITIONS.map((partial, index) =>
    buildWorkflowRequisition(index + 100, partial),
  );

  return [...pinned, ...withoutPinned];
}

export function getWorkflowRequisitionSeed(): RequisitionListItem[] {
  const approvedPending = REQUISITION_LIST.filter(
    (item) => item.status === "APPROVED" && item.allocationStatus === "PENDING",
  );

  const generated = Array.from({ length: 37 }, (_, index) =>
    buildWorkflowRequisition(index),
  );

  return mergePinnedRequisitions([...approvedPending, ...generated]);
}

export function formatWorkflowDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getWarehouseStockForMaterial(
  warehouseId: string,
  materialId: string,
  inventory: InventoryItem[],
): number {
  const item = inventory.find((entry) => entry.id === materialId);
  if (!item) return 0;

  const centralAvailable = getAvailableStock(item);

  if (warehouseId === "wh-central-sector-62") {
    return warehouseId === "wh-central-sector-62"
      ? Math.max(centralAvailable, 3200)
      : centralAvailable;
  }

  if (warehouseId === "wh-auxiliary-okhla") {
    return Math.floor(centralAvailable * 0.35) || 750;
  }

  if (warehouseId === "wh-gurgaon-yard-4") {
    return materialId === "inv-004" ? Math.floor(centralAvailable * 0.2) : 0;
  }

  return Math.floor(centralAvailable * 0.5);
}

function resolveWarehouseStatus(
  stock: number,
  requestedQty: number,
): WarehouseStockStatus {
  if (stock === 0) return "EMPTY";
  if (stock < requestedQty) return "LOW";
  if (stock >= requestedQty * 2) return "OPTIMAL";
  return "MODERATE";
}

export function getWorkflowWarehouses(
  materialId: string,
  requestedQty: number,
  inventory: InventoryItem[] = INVENTORY_ITEMS,
): WorkflowWarehouse[] {
  return WORKFLOW_WAREHOUSES.map((warehouse) => {
    const stock = getWarehouseStockForMaterial(
      warehouse.id,
      materialId,
      inventory,
    );

    return {
      ...warehouse,
      stock,
      status: resolveWarehouseStatus(stock, requestedQty),
    };
  });
}

export function getMaterialWorkflowDetail(
  materialId: string,
  requisition?: RequisitionListItem,
): MaterialWorkflowDetail {
  const base = MATERIAL_DETAILS[materialId];
  const inventory = getInventoryItem(materialId);

  if (base) {
    return {
      ...base,
      unit: requisition?.unit ?? base.unit,
      name: requisition?.material ?? base.name,
      spec: requisition?.materialSpec ?? base.spec,
    };
  }

  return {
    materialId,
    name: requisition?.material ?? inventory?.productName ?? "Material",
    spec: requisition?.materialSpec,
    sku: inventory?.sku ?? "N/A",
    grade: inventory?.category ?? "Standard",
    category: inventory?.categorySlug ?? "cement",
    categoryLabel: (inventory?.category ?? "MATERIAL").toUpperCase(),
    specifications: [],
    unit: requisition?.unit ?? inventory?.unit ?? "Units",
  };
}

export function getMaterialBatches(
  materialId: string,
  warehouseId: string,
  inventory: InventoryItem[] = INVENTORY_ITEMS,
): MaterialBatch[] {
  const warehouseStock = getWorkflowWarehouses(materialId, 1, inventory).find(
    (warehouse) => warehouse.id === warehouseId,
  )?.stock;

  const available = warehouseStock ?? 0;

  return [
    {
      id: "batch-oct-01",
      label: "B-2023-OCT-01",
      available: Math.min(1200, available),
      expiresInDays: 45,
      clearanceNote:
        "Batch expires in 45 days. High-priority clearance recommended.",
    },
    {
      id: "batch-sep-15",
      label: "B-2023-SEP-15",
      available: Math.min(800, Math.max(0, available - 1200)),
      expiresInDays: 20,
      clearanceNote: "Near expiry. Prioritize for dispatch.",
    },
    {
      id: "batch-aug-28",
      label: "B-2023-AUG-28",
      available: Math.max(0, available - 2000),
      expiresInDays: 5,
      clearanceNote: "Critical expiry window. Immediate clearance required.",
    },
  ].filter((batch) => batch.available > 0);
}

export function filterWorkflowRequisitions(
  items: RequisitionListItem[],
  search?: string,
  priority?: RequisitionPriority | "all",
): RequisitionListItem[] {
  return items
    .filter(
      (item) =>
        item.status === "APPROVED" && item.allocationStatus === "PENDING",
    )
    .filter((item) => {
      if (!search?.trim()) return true;
      const query = search.trim().toLowerCase();
      const haystack = [
        item.requestId,
        item.hubName,
        item.material,
        item.materialSpec,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .filter((item) => {
      if (!priority || priority === "all") return true;
      return item.priority === priority;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function paginateWorkflowRequisitions(
  items: RequisitionListItem[],
  page: number,
  limit: number,
): { data: RequisitionListItem[]; meta: PaginationMeta } {
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

export function fetchWorkflowRequisitions(
  items: RequisitionListItem[],
  params: {
    page?: number;
    limit?: number;
    search?: string;
    priority?: RequisitionPriority | "all";
  } = {},
): { data: RequisitionListItem[]; meta: PaginationMeta } {
  const filtered = filterWorkflowRequisitions(
    items,
    params.search,
    params.priority,
  );
  return paginateWorkflowRequisitions(
    filtered,
    params.page ?? 1,
    params.limit ?? WORKFLOW_REQUISITION_PAGE_SIZE,
  );
}

function generateAllocationId(): string {
  const suffix = Math.floor(9000 + Math.random() * 1000);
  return `ALC-${suffix}`;
}

export function confirmWorkflowAllocation(
  requisition: RequisitionListItem,
  form: AllocationWorkflowFormValues,
  inventory: InventoryItem[],
  warehouses: WorkflowWarehouse[],
): {
  requisitions: RequisitionListItem[];
  inventory: InventoryItem[];
  result: AllocationWorkflowResult;
} {
  const warehouse = warehouses.find(
    (entry) => entry.id === form.warehouseSourceId,
  );
  const batches = getMaterialBatches(
    requisition.materialId,
    form.warehouseSourceId,
    inventory,
  );
  const batch = batches.find((entry) => entry.id === form.batchId);

  if (!warehouse) {
    throw new Error("Selected warehouse not found.");
  }

  if (warehouse.stock < form.allocationQty) {
    throw new Error("Allocation quantity exceeds available warehouse stock.");
  }

  if (form.allocationQty > requisition.requestedQty) {
    throw new Error("Allocation quantity exceeds requested quantity.");
  }

  const materialDetail = getMaterialWorkflowDetail(
    requisition.materialId,
    requisition,
  );
  const warehouseRemaining = warehouse.stock - form.allocationQty;
  const allocationId = generateAllocationId();

  const updatedInventory = inventory.map((item) => {
    if (item.id !== requisition.materialId) return item;
    return {
      ...item,
      committedStock: item.committedStock + form.allocationQty,
    };
  });

  const updatedRequisition: RequisitionListItem = {
    ...requisition,
    allocationStatus: "ALLOCATED",
  };

  const baseWeight = materialDetail.unitDensity
    ? materialDetail.unitDensity * form.allocationQty
    : undefined;

  return {
    requisitions: [updatedRequisition],
    inventory: updatedInventory,
    result: {
      allocationId,
      requestId: requisition.requestId,
      destinationHub: requisition.hubName,
      quantity: form.allocationQty,
      unit: requisition.unit,
      material: `${materialDetail.name}${materialDetail.spec ? ` (${materialDetail.spec})` : ""}`,
      warehouseName: warehouse.name,
      batchLabel: batch?.label ?? form.batchId,
      warehouseRemaining,
      baseWeight,
      status: "COMPLETED",
      inventoryReserved: true,
    },
  };
}

export function formatWorkflowQuantity(qty: number, unit: string): string {
  return formatRequisitionQuantity(qty, unit);
}

export function getApprovalNote(requestedQty: number, unit: string): string {
  const threshold = 2000;
  if (requestedQty > threshold) {
    return `Bulk allocations over ${threshold.toLocaleString("en-IN")} ${unit} require regional supervisor approval.`;
  }
  return `Bulk allocations over 2,000 ${unit} require regional supervisor approval. Current request (${requestedQty.toLocaleString("en-IN")}) is within auto-approval limits.`;
}
