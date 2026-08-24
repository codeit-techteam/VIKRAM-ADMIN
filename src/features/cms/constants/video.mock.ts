import type { Video } from "@/features/cms/types/video.types";

/** @deprecated Unused — Video Management loads from GET /admin/videos */
export const VIDEO_STAT_CARDS = [
  { label: "Total Videos", value: "0" },
  { label: "Published", value: "0" },
  { label: "Drafts", value: "0" },
] as const;

/** @deprecated Unused — do not import for the library UI */
export const VIDEOS: Video[] = [];
