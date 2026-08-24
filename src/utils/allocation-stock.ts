import type { InventoryItem } from "@/types/inventory.types";
import type {
  MaterialBatch,
  RequisitionListItem,
  WarehouseStockStatus,
  WorkflowWarehouse,
} from "@/types/warehouse.types";

export function findInventoryMatch(
  selected: Pick<RequisitionListItem, "materialId" | "material" | "sku">,
  inventory: InventoryItem[],
): InventoryItem | null {
  const materialName = selected.material?.trim().toLowerCase() ?? "";
  const sku = selected.sku?.trim().toLowerCase() ?? "";

  return (
    inventory.find(
      (item) =>
        (selected.materialId &&
          (item.productId === selected.materialId ||
            item.id === selected.materialId)) ||
        (sku && item.sku?.toLowerCase() === sku) ||
        (materialName &&
          item.productName.toLowerCase() === materialName),
    ) ?? null
  );
}

export function getAvailableQty(item: InventoryItem | null | undefined): number {
  if (!item) return 0;
  if (typeof item.availableStock === "number") {
    return Math.max(0, item.availableStock);
  }
  return Math.max(0, (item.currentStock ?? 0) - (item.committedStock ?? 0));
}

function resolveWarehouseStatus(
  stock: number,
  requestedQty: number,
): WarehouseStockStatus {
  if (stock <= 0) return "EMPTY";
  if (stock < requestedQty) return "LOW";
  if (stock >= requestedQty * 1.5) return "OPTIMAL";
  return "MODERATE";
}

/**
 * Build the single central-warehouse row used by allocation workflow steps 2–3.
 * Matches inventory by productId / sku / name — never by mock warehouse IDs.
 */
export function buildCentralWarehouseOptions(
  selected: RequisitionListItem,
  inventory: InventoryItem[],
): WorkflowWarehouse[] {
  const match = findInventoryMatch(selected, inventory);
  const available = getAvailableQty(match);
  const requested = selected.requestedQty;

  if (!match) {
    return [
      {
        id: "central-warehouse-unavailable",
        name: "Main Warehouse Gurugram",
        location: "Gurugram · Central Warehouse",
        stock: 0,
        status: "EMPTY",
        leadTimeHours: 4,
        insight:
          "No matching inventory row found for this material. Check Product/SKU linkage.",
      },
    ];
  }

  return [
    {
      id: match.id,
      name: "Main Warehouse Gurugram",
      location: "Gurugram · Central Warehouse",
      stock: available,
      status: resolveWarehouseStatus(available, requested),
      leadTimeHours: 4,
      insight:
        available >= requested
          ? "Sufficient stock available for full allocation"
          : `Only ${available.toLocaleString("en-IN")} ${match.unit} available — partial allocation required`,
    },
  ];
}

/**
 * Single live stock batch for the selected central warehouse inventory row.
 * Avoids mock multi-warehouse batch lookups that break when warehouse id === inventory row id.
 */
export function getCentralStockBatches(
  warehouseId: string,
  availableStock: number,
): MaterialBatch[] {
  if (!warehouseId || availableStock <= 0) return [];

  return [
    {
      id: `batch-central-${warehouseId}`,
      label: "Central Stock",
      available: availableStock,
      expiresInDays: 365,
      clearanceNote: "Live warehouse available quantity for this SKU.",
    },
  ];
}

export function getMaxAllocatable(
  warehouseStock: number,
  batchAvailable: number | undefined,
  requestedQty: number,
): number {
  return Math.max(
    0,
    Math.min(
      warehouseStock,
      batchAvailable ?? warehouseStock,
      requestedQty > 0 ? requestedQty : warehouseStock,
    ),
  );
}
