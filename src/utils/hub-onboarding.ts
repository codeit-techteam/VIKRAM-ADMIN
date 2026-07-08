import {
  CAPACITY_MT_BY_TIER,
  EXISTING_HUB_MANAGERS,
  hubTypeLabel,
} from "@/mock/hub-onboarding";
import { generateId } from "@/store/warehouse-erp-helpers";
import type { HubInventoryEntry, SubHub } from "@/types/erp.types";
import type { CreateHubResult, HubDraft } from "@/types/hub-onboarding.types";
import type { FleetDriver, FleetVehicle } from "@/types/warehouse.types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveManager(draft: HubDraft) {
  if (draft.manager.mode === "existing") {
    const existing = EXISTING_HUB_MANAGERS.find(
      (manager) => manager.id === draft.manager.existingManagerId,
    );
    if (existing) {
      return {
        managerName: existing.fullName,
        managerPhone: `+91 ${existing.phone}`,
        managerEmail: existing.email,
        employeeId: existing.employeeId,
      };
    }
  }

  return {
    managerName: draft.manager.fullName || "Unassigned",
    managerPhone: draft.manager.phone
      ? `+91 ${draft.manager.phone.replace(/\s+/g, "")}`
      : undefined,
    managerEmail: draft.manager.email || undefined,
    employeeId: draft.manager.employeeId || undefined,
  };
}

function resolveCapacityMt(draft: HubDraft): number {
  if (draft.basic.capacityTier === "custom") {
    return draft.basic.customCapacityMt;
  }
  return CAPACITY_MT_BY_TIER[draft.basic.capacityTier];
}

function nextNodeId(existing: SubHub[]): string {
  const nums = existing
    .map((hub) => Number(String(hub.nodeId).replace(/\D/g, "")) || 0)
    .filter(Boolean);
  const max = nums.length ? Math.max(...nums) : 100;
  return `H-${max + 1}`;
}

export function buildHubFromDraft(
  draft: HubDraft,
  existingHubs: SubHub[],
): {
  hub: SubHub;
  inventory: HubInventoryEntry[];
  drivers: FleetDriver[];
  vehicles: FleetVehicle[];
  result: CreateHubResult;
} {
  const now = new Date().toISOString();
  const manager = resolveManager(draft);
  const slug = slugify(draft.basic.hubName) || "new-hub";
  const hubId = `hub-${slug}-${Date.now().toString().slice(-4)}`;
  const capacityMt = resolveCapacityMt(draft);
  const workingHours = `${draft.basic.shiftStart} - ${draft.basic.shiftEnd}`;

  const hub: SubHub = {
    id: hubId,
    name: draft.basic.hubName.trim(),
    city: draft.basic.city.trim(),
    region: draft.basic.state,
    managerName: manager.managerName,
    nodeId: draft.basic.hubCode || nextNodeId(existingHubs),
    isActive: draft.basic.isActive,
    lastInventorySync: now,
    address: [
      draft.basic.detailedAddress,
      draft.basic.city,
      draft.basic.state,
      draft.basic.pincode,
    ]
      .filter(Boolean)
      .join(", "),
    managerPhone: manager.managerPhone,
    managerEmail: manager.managerEmail,
    hubSince: draft.basic.openingDate
      ? new Date(draft.basic.openingDate).toISOString()
      : now,
    capacityMt,
    capacitySqFt: Math.round(capacityMt * 5),
    workingHours,
    hubType: draft.basic.hubType,
    hubTypeLabel: hubTypeLabel(draft.basic.hubType),
    coverageRadiusKm: draft.coverage.radiusKm,
    linkedWarehouseId: draft.warehouse.warehouseId,
    linkedWarehouseName: draft.warehouse.warehouseName,
    fulfillmentPriority: draft.basic.fulfillmentPriority,
    servicePincodes: draft.coverage.pincodes,
    deliverySlots: draft.fleet.deliverySlots,
    autoRestocking: draft.warehouse.autoRestocking,
    allowedCategories: draft.warehouse.allowedCategories,
  };

  const inventory: HubInventoryEntry[] = draft.inventory.skus
    .filter((sku) => sku.selected)
    .map((sku) => ({
      hubId,
      hubName: hub.name,
      materialId: sku.materialId,
      materialName: sku.productName,
      sku: sku.sku,
      quantity: sku.openingStock,
      minimumRequired: sku.reorderLevel,
      purchasePrice: 0,
      unit: sku.unit,
      lastUpdated: now,
      reservedQty: 0,
      category: sku.category,
      safetyStock: sku.safetyStock,
      maxStock: sku.maxStock,
      reorderLevel: sku.reorderLevel,
    }));

  const drivers: FleetDriver[] = draft.fleet.drivers.map((driver) => ({
    id: generateId("drv"),
    name: driver.name,
    employeeId: `DRV-${driver.licenseNo.slice(-4)}`,
    licenseType: "LMV",
    experienceYears: 5,
    rating: 4.6,
    status: "ready",
    phone: driver.phone,
    avatarInitials: driver.avatarInitials,
    hubId,
  }));

  const vehicles: FleetVehicle[] = draft.fleet.vehicles.map((vehicle) => ({
    id: generateId("veh"),
    vehicleNumber: vehicle.regNumber,
    vehicleType: vehicle.vehicleType,
    capacityKg: 10_000,
    location: hub.city,
    availability: "now",
    status: vehicle.status === "maintenance" ? "maintenance" : "idle",
    hubId,
  }));

  return {
    hub,
    inventory,
    drivers,
    vehicles,
    result: {
      hubId,
      hubCode: hub.nodeId,
      hubName: hub.name,
    },
  };
}
