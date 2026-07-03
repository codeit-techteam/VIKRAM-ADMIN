import type { MaterialFormData } from "@/types/material.types";

// TODO: Replace with materials API
export const WAREHOUSE_OPTIONS = [
  { value: "central-warehouse", label: "Central Warehouse" },
] as const;

export const MATERIAL_DRAFT_STORAGE_KEY = "bq-material-wizard-draft";
export const MATERIAL_DRAFT_SAVED_AT_KEY = "bq-material-wizard-draft-saved-at";

export const EXAMPLE_SKUS = [
  {
    skuCode: "ULT-CEM-50",
    skuName: "UltraTech Cement",
    variant: "50 Bags",
    unit: "bags",
  },
  {
    skuCode: "RB-500",
    skuName: "Red Bricks",
    variant: "500 Pieces",
    unit: "pieces",
  },
  {
    skuCode: "RS-20-CFT",
    skuName: "River Sand",
    variant: "20 CFT",
    unit: "cft",
  },
] as const;

export const MATERIAL_FORM_DEFAULT_VALUES: MaterialFormData = {
  materialName: "",
  productDisplayName: "",
  shortDescription: "",
  longDescription: "",
  mainImage: null,
  galleryImages: [],
  brand: "",
  manufacturer: "",
  hsnCode: "",
  gstPercent: "",
  productStatus: "draft",

  category: "",
  subCategory: "",
  tags: [],
  searchKeywords: "",

  skus: [],

  purchasePrice: "",
  sellingPrice: "",
  dealerPrice: "",
  bulkPrice: "",
  minimumOrderQuantity: "",
  maximumOrderQuantity: "",
  discountPercent: "",
  gstIncluded: true,

  warehouse: "central-warehouse",
  defaultLocation: "",
  rackNumber: "",
  binNumber: "",
  shelfNumber: "",
  openingStock: "",
  warehouseMinimumStock: "",
  warehouseMaximumStock: "",
  reorderLevel: "",
  lowStockAlert: true,
  allowInventoryTracking: "yes",
};

export function createEmptySku(): MaterialFormData["skus"][number] {
  return {
    id: crypto.randomUUID(),
    skuCode: "",
    skuName: "",
    variant: "",
    size: "",
    unit: "",
    minimumStock: 0,
    maximumStock: 0,
    barcode: "",
    weight: "",
    dimensions: "",
    status: "active",
  };
}
