import { FileText, Shield } from "lucide-react";

import type {
  AnalyticsCategory,
  Playlist,
  Video,
} from "@/features/cms/types/video.types";

export const VIDEO_STAT_CARDS = [
  { label: "Total Videos", value: "48" },
  { label: "Published", value: "32" },
  { label: "Drafts", value: "12" },
] as const;

export const VIDEOS: Video[] = [
  {
    id: "1",
    thumbnailUrl: "https://picsum.photos/seed/tmt-bar-strength/640/360",
    title: "TMT Bar Strength Test",
    status: "PUBLISHED",
    duration: "04:15",
    tags: ["Home Screen", "Tutorial"],
    views: 12400,
    likes: 1200,
  },
  {
    id: "2",
    thumbnailUrl: "https://picsum.photos/seed/bulk-offers-2024/640/360",
    title: "Exclusive Bulk Offers 2024",
    status: "SCHEDULED",
    duration: "02:45",
    tags: ["Offers"],
    views: 0,
    scheduledDate: "12 May",
  },
  {
    id: "3",
    thumbnailUrl: "https://picsum.photos/seed/safety-protocols/640/360",
    title: "On-Site Safety Protocols",
    status: "DRAFT",
    duration: "08:20",
    tags: ["Training"],
    lastEditedLabel: "Last edited 2h ago",
  },
];

export const ANALYTICS_CATEGORIES: AnalyticsCategory[] = [
  {
    id: "1",
    name: "Construction Tips",
    accentColor: "bg-orange-500",
    accentBarClass: "bg-orange-500",
    totalViews: 82450,
    ctr: 14.2,
    ctrTrend: "up",
    watchEfficiencyPercent: 90,
    status: "TOP_PERFORMER",
  },
  {
    id: "2",
    name: "Product Demos",
    accentColor: "bg-blue-500",
    accentBarClass: "bg-blue-500",
    totalViews: 45120,
    ctr: 8.5,
    ctrTrend: "up",
    watchEfficiencyPercent: 60,
    status: "STEADY",
  },
  {
    id: "3",
    name: "Market Insights",
    accentColor: "bg-purple-500",
    accentBarClass: "bg-purple-500",
    totalViews: 22100,
    ctr: 3.2,
    ctrTrend: "flat",
    watchEfficiencyPercent: 30,
    status: "NEEDS_REVIEW",
  },
];

export const PLAYLISTS: Playlist[] = [
  {
    id: "1",
    icon: FileText,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Product Demonstrations",
    videoCount: 12,
    lastUpdateLabel: "2d ago",
  },
  {
    id: "2",
    icon: Shield,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Safety Training",
    videoCount: 8,
    lastUpdateLabel: "5d ago",
  },
];
