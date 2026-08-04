export type VideoStatus =
  "PUBLISHED" | "SCHEDULED" | "DRAFT" | "INACTIVE" | "EXPIRED";

export type CtaDestinationType = "product" | "category" | "offer" | "external";

export type VideoPlacementFilter =
  | "ALL"
  | "HOME_HERO_VIDEO"
  | "HOME"
  | "HOME_SECONDARY"
  | "OFFERS"
  | "PRODUCT"
  | "CATEGORY"
  | "TUTORIALS"
  | "TRAINING";

export interface VideoCta {
  enabled: boolean;
  label: string;
  path: string;
  destinationType: CtaDestinationType;
}

export interface Video {
  id: string;
  /** R2 poster; empty/null when missing — UI must use SafeRemoteImage/placeholder */
  thumbnailUrl: string | null;
  /** R2 playback URL — same source Customer App uses */
  videoUrl: string;
  title: string;
  status: VideoStatus;
  placement: string;
  published: boolean;
  isVisible: boolean;
  /** True when this row would be eligible for Customer App home hero */
  liveOnApp: boolean;
  duration: string;
  tags: string[];
  views?: number;
  likes?: number;
  scheduledDate?: string;
  lastEditedLabel?: string;
  cta: VideoCta;
}

export type ViewMode = "grid" | "list";
