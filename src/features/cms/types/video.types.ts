import type { LucideIcon } from "lucide-react";

export type VideoStatus = "PUBLISHED" | "SCHEDULED" | "DRAFT";

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
}

export type CtrTrend = "up" | "down" | "flat";

export type AnalyticsStatus = "TOP_PERFORMER" | "STEADY" | "NEEDS_REVIEW";

export interface AnalyticsCategory {
  id: string;
  name: string;
  accentColor: string;
  accentBarClass: string;
  totalViews: number;
  ctr: number;
  ctrTrend: CtrTrend;
  watchEfficiencyPercent: number;
  status: AnalyticsStatus;
}

export interface Playlist {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  videoCount: number;
  lastUpdateLabel: string;
}

export type ViewMode = "grid" | "list";
