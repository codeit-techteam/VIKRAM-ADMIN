export type ContentUpdateStatus = "Live" | "Draft" | "Expired";

export interface ContentUpdate {
  id: string;
  assetName: string;
  subtitle: string;
  thumbnailUrl: string;
  type: string;
  status: ContentUpdateStatus;
  updatedBy: string;
  lastModified: string;
  href?: string;
}

export interface CmsStatCardData {
  label: string;
  value: string;
  href?: string;
}

export interface QuickActionData {
  id: string;
  label: string;
  iconName: "shopping-cart" | "upload" | "send" | "tag";
  circleColor: "orange" | "blue" | "indigo" | "green";
  href?: string;
}
