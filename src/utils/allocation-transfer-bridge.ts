import type {
  AllocationWorkflowResult,
  TransferWorkflowContext,
} from "@/types/warehouse.types";
import {
  TRANSFER_HUB_OPTIONS,
  TRANSFER_WAREHOUSE_OPTIONS,
} from "@/mock/transfers";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";

export const ALLOCATION_TRANSFER_CONTEXT_KEY = "bq-allocation-transfer-context";

function resolveWarehouseId(name: string): string {
  const match = TRANSFER_WAREHOUSE_OPTIONS.find(
    (option) =>
      option.label.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(option.label.toLowerCase()),
  );
  return match?.id ?? TRANSFER_WAREHOUSE_OPTIONS[0].id;
}

function resolveHubId(name: string): string {
  const match = TRANSFER_HUB_OPTIONS.find(
    (option) =>
      option.label.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(option.label.toLowerCase()),
  );
  return match?.id ?? TRANSFER_HUB_OPTIONS[1].id;
}

function extractSku(material: string): string {
  if (material.toLowerCase().includes("tmt")) return "STL-TMT-12MM-001";
  if (material.toLowerCase().includes("cement")) return "MT-00102";
  return "SKU-GEN-001";
}

export function persistAllocationForTransfer(
  result: AllocationWorkflowResult,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    ALLOCATION_TRANSFER_CONTEXT_KEY,
    JSON.stringify(result),
  );
}

export function setActiveAllocationForTransfer(
  result: AllocationWorkflowResult,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    ALLOCATION_TRANSFER_CONTEXT_KEY,
    JSON.stringify(result),
  );
}

export function resolveAllocationForTransfer(
  allocationId?: string | null,
): AllocationWorkflowResult | null {
  const fromSession = readAllocationForTransfer();
  if (fromSession) return fromSession;

  if (!allocationId) return null;

  return (
    useWarehouseErpStore.getState().getAllocationById(allocationId) ?? null
  );
}

export function readAllocationForTransfer(): AllocationWorkflowResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ALLOCATION_TRANSFER_CONTEXT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AllocationWorkflowResult;
  } catch {
    return null;
  }
}

export function clearAllocationTransferContext(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ALLOCATION_TRANSFER_CONTEXT_KEY);
}

export function mapAllocationToTransferContext(
  result: AllocationWorkflowResult,
): TransferWorkflowContext {
  const estimatedWeightKg =
    result.baseWeight ?? Math.round(result.quantity * 12);

  return {
    allocationId: result.allocationId,
    requisitionId: result.requestId,
    material: result.material,
    sku: extractSku(result.material),
    quantity: result.quantity,
    unit: result.unit,
    sourceWarehouse: result.warehouseName,
    sourceWarehouseId: resolveWarehouseId(result.warehouseName),
    destinationHub: result.destinationHub,
    destinationHubId: resolveHubId(result.destinationHub),
    estimatedWeightKg,
  };
}
