import type { Video } from "@/features/cms/types/video.types";

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
    cta: {
      enabled: true,
      label: "Shop TMT Bars",
      path: "/category/tmt-bars",
      destinationType: "category",
    },
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
    cta: {
      enabled: true,
      label: "View Bulk Offers",
      path: "/offers/bulk-2024",
      destinationType: "offer",
    },
  },
  {
    id: "3",
    thumbnailUrl: "https://picsum.photos/seed/safety-protocols/640/360",
    title: "On-Site Safety Protocols",
    status: "DRAFT",
    duration: "08:20",
    tags: ["Training"],
    lastEditedLabel: "Last edited 2h ago",
    cta: {
      enabled: false,
      label: "Start Safety Course",
      path: "/training/safety",
      destinationType: "external",
    },
  },
];
