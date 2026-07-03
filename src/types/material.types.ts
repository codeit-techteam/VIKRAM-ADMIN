export type ProductStatus = "active" | "inactive" | "draft";

export type SkuStatus = "active" | "inactive";

export type InventoryTracking = "yes" | "no";

export interface MaterialImage {
  id: string;
  url: string;
  name: string;
  isMain?: boolean;
}

export interface MaterialSku {
  id: string;
  skuCode: string;
  skuName: string;
  variant: string;
  size: string;
  unit: string;
  minimumStock: number;
  maximumStock: number;
  barcode: string;
  weight: string;
  dimensions: string;
  status: SkuStatus;
}

export interface MaterialFormData {
  materialName: string;
  productDisplayName: string;
  shortDescription: string;
  longDescription: string;
  mainImage: MaterialImage | null;
  galleryImages: MaterialImage[];
  brand: string;
  manufacturer: string;
  hsnCode: string;
  gstPercent: number;
  productStatus: ProductStatus;

  category: string;
  subCategory: string;
  tags: string[];
  searchKeywords: string;

  skus: MaterialSku[];

  purchasePrice: number;
  sellingPrice: number;
  dealerPrice: number;
  bulkPrice: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
  discountPercent: number;
  gstIncluded: boolean;

  warehouse: string;
  defaultLocation: string;
  rackNumber: string;
  binNumber: string;
  shelfNumber: string;
  openingStock: number;
  warehouseMinimumStock: number;
  warehouseMaximumStock: number;
  reorderLevel: number;
  lowStockAlert: boolean;
  allowInventoryTracking: InventoryTracking;
}

export interface MaterialWizardStep {
  id: number;
  label: string;
  shortLabel: string;
}
