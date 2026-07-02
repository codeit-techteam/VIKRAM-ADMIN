export type CategoryStatus = "ACTIVE" | "PENDING" | "INACTIVE";

export interface Category {
  id: string;
  thumbnailUrl: string;
  name: string;
  displayOrder: number;
  productCount: number;
  status: CategoryStatus;
  lastUpdated: string;
}
