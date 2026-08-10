export type BannerStatus = "LIVE" | "DRAFT";

export type ModificationStatus = "ACTIVE" | "SCHEDULED";

export interface Banner {
  id: string;
  thumbnailUrl: string;
  title: string;
  subtitle?: string | null;
  location: string;
  ctaLabel: string;
  ctaPath: string;
  status: BannerStatus;
  startsAt?: string | null;
  endsAt?: string | null;
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
