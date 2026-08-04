import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { Video, VideoStatus } from "@/features/cms/types/video.types";
import { env } from "@/config/env";
import { getStoredAccessToken } from "@/store/auth-store";

export const CMS_VIDEOS_QUERY_KEY = "cms-videos" as const;

export interface AdminVideo {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  storageKey?: string | null;
  videoUrl: string;
  publicUrl?: string | null;
  thumbnailUrl?: string | null;
  placement?: string;
  linkUrl?: string | null;
  linkTarget?: string | null;
  ctaLabel?: string | null;
  duration?: number | null;
  displayOrder: number;
  priority?: number;
  mimeType?: string | null;
  sizeBytes?: string | number | null;
  isVisible: boolean;
  published?: boolean;
  status: string;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  updatedAt?: string;
  createdAt?: string;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function isRemoteUrl(value?: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

function mapStatus(
  row: Pick<
    AdminVideo,
    "status" | "isVisible" | "published" | "scheduledAt" | "expiresAt"
  >,
): VideoStatus {
  const now = Date.now();
  if (row.expiresAt && new Date(row.expiresAt).getTime() < now) {
    return "EXPIRED";
  }
  if (row.status === "DRAFT") return "DRAFT";
  if (row.status === "INACTIVE" || (!row.published && !row.isVisible)) {
    return "INACTIVE";
  }
  if (
    row.scheduledAt &&
    new Date(row.scheduledAt).getTime() > now &&
    !row.published
  ) {
    return "SCHEDULED";
  }
  if ((row.status === "ACTIVE" || row.published) && row.isVisible !== false) {
    return "PUBLISHED";
  }
  return "INACTIVE";
}

function isLiveOnApp(row: AdminVideo): boolean {
  const placement = (row.placement || "").toUpperCase();
  const isHero =
    placement === "HOME" ||
    placement === "HOME_HERO_VIDEO" ||
    placement === "HOME_SECONDARY";
  return Boolean(
    row.published &&
    row.isVisible !== false &&
    row.status === "ACTIVE" &&
    isHero &&
    isRemoteUrl(row.publicUrl || row.videoUrl),
  );
}

export function toUiVideo(row: AdminVideo): Video {
  const videoUrl = (row.publicUrl || row.videoUrl || "").trim();
  const thumbnailUrl = isRemoteUrl(row.thumbnailUrl)
    ? row.thumbnailUrl!.trim()
    : null;

  return {
    id: row.id,
    thumbnailUrl,
    videoUrl,
    title: row.title,
    status: mapStatus(row),
    placement: row.placement || "HOME_HERO_VIDEO",
    published: Boolean(row.published),
    isVisible: row.isVisible !== false,
    liveOnApp: isLiveOnApp(row),
    duration: formatDuration(row.duration),
    tags: [row.placement || "HOME_HERO_VIDEO"],
    lastEditedLabel: row.updatedAt
      ? new Date(row.updatedAt).toLocaleString()
      : undefined,
    scheduledDate: row.scheduledAt
      ? new Date(row.scheduledAt).toLocaleString()
      : undefined,
    cta: {
      enabled: Boolean(row.linkUrl || row.linkTarget || row.ctaLabel),
      label: row.ctaLabel || "Shop Now",
      path: row.linkUrl || row.linkTarget || "/",
      destinationType: "external",
    },
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function logVideosDev(rows: AdminVideo[]) {
  if (process.env.NODE_ENV !== "development") return;

  console.info("[cms-videos] Fetched videos", {
    count: rows.length,
    ids: rows.map((r) => r.id),
    rows: rows.map((r) => ({
      id: r.id,
      title: r.title,
      placement: r.placement,
      status: r.status,
      published: r.published,
      isVisible: r.isVisible,
      thumbnailUrl: r.thumbnailUrl,
      videoUrl: r.publicUrl || r.videoUrl,
    })),
  });
}

export type VideoUploadProgress = (percent: number) => void;

export const videosService = {
  list: async (placement?: string): Promise<AdminVideo[]> => {
    const { data } = await api.get<ApiResponse<AdminVideo[]>>(
      API_ENDPOINTS.ADMIN_CMS.VIDEOS,
      {
        params: placement ? { placement } : undefined,
      },
    );
    const rows = data.data ?? [];
    logVideosDev(rows);
    return rows;
  },

  getById: async (id: string): Promise<AdminVideo> => {
    const { data } = await api.get<ApiResponse<AdminVideo>>(
      API_ENDPOINTS.ADMIN_CMS.VIDEO_BY_ID(id),
    );
    return data.data;
  },

  upload: async (
    payload: {
      file: File;
      thumbnailFile?: File | null;
      title: string;
      description?: string;
      placement?: string;
      linkUrl?: string;
      ctaLabel?: string;
      priority?: number;
      publish?: boolean;
      thumbnailUrl?: string;
    },
    onProgress?: VideoUploadProgress,
  ): Promise<AdminVideo> => {
    const form = new FormData();
    form.append("file", payload.file);
    if (payload.thumbnailFile) {
      form.append("thumbnail", payload.thumbnailFile);
    }
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    form.append("placement", payload.placement || "HOME_HERO_VIDEO");
    if (payload.linkUrl) form.append("linkUrl", payload.linkUrl);
    if (payload.ctaLabel) form.append("ctaLabel", payload.ctaLabel);
    if (payload.priority != null) {
      form.append("priority", String(payload.priority));
    }
    form.append("publish", payload.publish ? "true" : "false");
    if (payload.thumbnailUrl && isRemoteUrl(payload.thumbnailUrl)) {
      form.append("thumbnailUrl", payload.thumbnailUrl.trim());
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `${env.apiBaseUrl}${API_ENDPOINTS.ADMIN_CMS.VIDEO_UPLOAD}`,
      );
      const token = getStoredAccessToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText) as ApiResponse<AdminVideo>;
          if (xhr.status >= 200 && xhr.status < 300 && json.data) {
            onProgress?.(100);
            resolve(json.data);
            return;
          }
          reject(new Error(json.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(form);
    });
  },

  create: async (payload: {
    title: string;
    videoUrl: string;
    thumbnailUrl?: string;
    description?: string;
    placement?: string;
    linkUrl?: string;
    ctaLabel?: string;
    duration?: number;
    publish?: boolean;
  }) => {
    const { data } = await api.post<ApiResponse<AdminVideo>>(
      API_ENDPOINTS.ADMIN_CMS.VIDEOS,
      {
        title: payload.title,
        slug: slugify(payload.title) || `video-${Date.now()}`,
        videoUrl: payload.videoUrl,
        thumbnailUrl: payload.thumbnailUrl,
        description: payload.description,
        placement: payload.placement || "HOME_HERO_VIDEO",
        linkUrl: payload.linkUrl,
        ctaLabel: payload.ctaLabel,
        duration: payload.duration,
        publish: Boolean(payload.publish),
      },
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      thumbnailUrl: string;
      placement: string;
      linkUrl: string;
      ctaLabel: string;
      priority: number;
      publish: boolean;
    }>,
  ) => {
    const { data } = await api.patch<ApiResponse<AdminVideo>>(
      API_ENDPOINTS.ADMIN_CMS.VIDEO_BY_ID(id),
      payload,
    );
    return data.data;
  },

  publish: async (id: string) => {
    const { data } = await api.patch<ApiResponse<AdminVideo>>(
      API_ENDPOINTS.ADMIN_CMS.VIDEO_PUBLISH(id),
    );
    return data.data;
  },

  unpublish: async (id: string) => {
    const { data } = await api.patch<ApiResponse<AdminVideo>>(
      API_ENDPOINTS.ADMIN_CMS.VIDEO_UNPUBLISH(id),
    );
    return data.data;
  },

  archive: async (id: string) => {
    const { data } = await api.patch<ApiResponse<AdminVideo>>(
      API_ENDPOINTS.ADMIN_CMS.VIDEO_ARCHIVE(id),
    );
    return data.data;
  },

  remove: async (id: string) => {
    await api.delete(API_ENDPOINTS.ADMIN_CMS.VIDEO_BY_ID(id));
  },
};
