import {
  buildSeedHubInventory,
  resolveHubMaterialDefaults,
  SUB_HUBS,
} from "@/mock/sub-hubs";
import type { HubInventoryEntry, SubHub } from "@/types/erp.types";

export function resolveSubHubs(subHubs: SubHub[] | undefined): SubHub[] {
  return subHubs?.length ? subHubs : SUB_HUBS;
}

export function normalizeHubInventory(
  entries: HubInventoryEntry[] | undefined,
): HubInventoryEntry[] {
  if (!entries?.length) {
    return buildSeedHubInventory(SUB_HUBS);
  }

  return entries.map((entry) => {
    const defaults = resolveHubMaterialDefaults(entry.hubId, entry.materialId);

    return {
      ...entry,
      quantity: entry.quantity ?? 0,
      minimumRequired: entry.minimumRequired ?? defaults.minimumRequired,
      purchasePrice: entry.purchasePrice ?? defaults.purchasePrice,
      category: entry.category ?? defaults.category,
      safetyStock: entry.safetyStock ?? defaults.safetyStock,
    };
  });
}

export function needsSubHubNetworkPatch(state: {
  subHubs?: SubHub[];
  hubInventory?: HubInventoryEntry[];
}): boolean {
  if (!state.subHubs?.length) return true;
  if (!Array.isArray(state.hubInventory) || state.hubInventory.length === 0) {
    return true;
  }

  return state.hubInventory.some(
    (entry) =>
      entry.minimumRequired == null ||
      entry.purchasePrice == null ||
      entry.quantity == null,
  );
}

export function patchSubHubNetworkState(state: {
  subHubs?: SubHub[];
  hubInventory?: HubInventoryEntry[];
}): { subHubs: SubHub[]; hubInventory: HubInventoryEntry[] } {
  return {
    subHubs: resolveSubHubs(state.subHubs),
    hubInventory: normalizeHubInventory(state.hubInventory),
  };
}
