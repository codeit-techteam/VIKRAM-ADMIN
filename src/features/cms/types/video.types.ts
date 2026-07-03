export type VideoStatus = "PUBLISHED" | "SCHEDULED" | "DRAFT";

export type CtaDestinationType = "product" | "category" | "offer" | "external";

export interface VideoCta {
  enabled: boolean;
  label: string;
  path: string;
  destinationType: CtaDestinationType;
}

export interface Video {
  id: string;
  thumbnailUrl: string;
  title: string;
  status: VideoStatus;
  duration: string;
  tags: string[];
  views?: number;
  likes?: number;
  scheduledDate?: string;
  lastEditedLabel?: string;
  cta: VideoCta;
}

export type ViewMode = "grid" | "list";
