export type CategoryVisibility = "VISIBLE" | "NOT_VISIBLE";

export interface Category {
  id: string;
  thumbnailUrl: string;
  name: string;
  displayOrder: number;
  productCount: number;
  isVisible: boolean;
  lastUpdated: string;
}

export interface CategoryStats {
  totalCategories: number;
  empty: number;
  visible: number;
  notVisible: number;
}
