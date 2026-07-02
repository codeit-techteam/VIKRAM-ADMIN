export type ProductStatus = "LIVE" | "LOW_STOCK" | "DRAFT";

export interface Product {
  id: string;
  thumbnailUrl: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  price: number;
  priceUnit: string;
  stockUnits: number;
  status: ProductStatus;
  isLive: boolean;
}
