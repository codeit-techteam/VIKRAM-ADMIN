export type BannerStatus = "LIVE" | "DRAFT";

export type ModificationStatus = "ACTIVE" | "SCHEDULED";

export interface Banner {
  id: string;
  thumbnailUrl: string;
  title: string;
  location: string;
  ctaLabel: string;
  ctaPath: string;
  status: BannerStatus;
}

export interface BannerModification {
  id: string;
  thumbnailUrl: string;
  name: string;
  hubTargeting: string;
  status: ModificationStatus;
  clicks: number;
  updatedBy: string;
  updatedByAvatar: string;
}
